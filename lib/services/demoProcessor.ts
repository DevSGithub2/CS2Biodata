import axios from "axios";
// @ts-ignore
import bz2 from "unbzip2-stream";
import fs from "fs";
import path from "path";
import { parseEvent } from "@laihoe/demoparser2";
import clientPromise from "@/lib/mongodb";

export async function processDemo(matchId: string, demoUrl: string) {
  const demoPath = path.join("/tmp", `${matchId}.dem`);

  try {
    console.log(`📥 Downloading demo: ${demoUrl}`);
    const response = await axios({ method: "get", url: demoUrl, responseType: "stream" });
    
    const writer = fs.createWriteStream(demoPath);
    response.data.pipe(bz2()).pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", () => resolve(true));
      writer.on("error", reject);
    });

    console.log(`⚙️ Parsing advanced telemetry for match: ${matchId}`);
    
    // 1. Parse round ends, kills, and damage
    const roundEvents = parseEvent(demoPath, "round_end", [], ["total_rounds_played"]) || [];
    const totalRounds = Math.max(roundEvents.length, 1);

    const deathEvents = parseEvent(
      demoPath,
      "player_death",
      ["attacker_steamid", "user_steamid", "assist_player_steamid", "headshot"],
      []
    ) || [];

    const damageEvents = parseEvent(
      demoPath,
      "player_hurt",
      ["attacker_steamid", "user_steamid", "dmg_health"],
      []
    ) || [];

    // 2. Aggregate per-player metrics
    const stats: Record<string, any> = {};

    function initPlayer(id: string) {
      if (id && id !== "0" && !stats[id]) {
        stats[id] = {
          steamId64: String(id),
          kills: 0,
          deaths: 0,
          assists: 0,
          headshots: 0,
          totalDamage: 0,
          adr: 0,
          hsPercent: 0,
          score: 0,
        };
      }
    }

    damageEvents.forEach((ev: any) => {
      const attacker = ev.attacker_steamid;
      const dmg = Number(ev.dmg_health) || 0;
      if (attacker && attacker !== "0") {
        initPlayer(attacker);
        stats[attacker].totalDamage += dmg;
      }
    });

    deathEvents.forEach((ev: any) => {
      const killer = ev.attacker_steamid;
      const victim = ev.user_steamid;
      const assister = ev.assist_player_steamid;
      const isHs = ev.headshot === true || ev.headshot === 1;

      [killer, victim, assister].forEach(initPlayer);

      if (victim && victim !== "0" && stats[victim]) {
        stats[victim].deaths += 1;
      }

      if (killer && killer !== "0" && killer !== victim && stats[killer]) {
        stats[killer].kills += 1;
        stats[killer].score += 2;
        if (isHs) stats[killer].headshots += 1;
      }

      if (assister && assister !== "0" && stats[assister]) {
        stats[assister].assists += 1;
        stats[assister].score += 1;
      }
    });

    // 3. Compute final averages
    Object.values(stats).forEach((p: any) => {
      p.adr = Math.round(p.totalDamage / totalRounds);
      p.hsPercent = p.kills > 0 ? Math.round((p.headshots / p.kills) * 100) : 0;
    });

    const scoreboard = Object.values(stats);
    const client = await clientPromise;
    const db = client.db("cs2pulse");

    await db.collection("matches").updateOne(
      { shareCode: matchId },
      { 
        $set: { 
          scoreboard,
          totalRounds,
          status: "demo_parsed",
          parsedAt: new Date()
        } 
      }
    );

    console.log(`✅ Match telemetry saved with ADR and HS% for: ${matchId}`);
  } catch (error: any) {
    console.error("Demo parsing failed:", error.message);
  } finally {
    if (fs.existsSync(demoPath)) fs.unlinkSync(demoPath);
  }
}
