import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const steamId64 = searchParams.get("steamId64");

  if (!steamId64) {
    return NextResponse.json({ matches: [] });
  }

  try {
    const client = await clientPromise;
    const db = client.db("cs2biodata");

    const [parsedMatches, pendingMatches, tokenRecord] = await Promise.all([
      db.collection("valve_matches")
        .find({ $or: [{ steamId: steamId64 }, { steamId64 }] })
        .sort({ playedAt: -1, syncedAt: -1 })
        .toArray(),
      db.collection("pending_matches")
        .find({ steamId: steamId64, status: { $ne: "completed" } })
        .sort({ queuedAt: -1 })
        .toArray(),
      db.collection("valvetokens").findOne({ steamId: steamId64 })
    ]);

    const formattedMatches: any[] = [];

    parsedMatches.forEach((m: any) => {
      const mapName = m.map || m.matchDetails?.map || "de_dust2";
      const score = m.score || (m.matchDetails?.team1_score != null && m.matchDetails?.team2_score != null
        ? `${m.matchDetails.team1_score} - ${m.matchDetails.team2_score}`
        : "13 - 9");

      const result = m.result || (m.winnerTeam === 2 || m.win ? "VICTORY" : "DEFEAT");

      const player = Array.isArray(m.players) && m.players.length > 0 ? m.players[0] : null;

      formattedMatches.push({
        id: m.matchId || m.shareCode,
        matchId: m.matchId || m.shareCode,
        shareCode: m.shareCode,
        map: mapName,
        score,
        result,
        win: result === "VICTORY" || result === "WIN",
        kills: m.kills ?? player?.kills ?? 0,
        deaths: m.deaths ?? player?.deaths ?? 0,
        assists: m.assists ?? player?.assists ?? 0,
        headshots: m.headshots ?? player?.headshots ?? 0,
        mvps: m.mvps ?? player?.mvps ?? 0,
        date: m.playedAt || m.matchTime || m.syncedAt || "Recent",
        playedAt: m.playedAt || m.matchTime || m.syncedAt
      });
    });

    // Add in-progress pending match codes if any exist
    pendingMatches.forEach((p: any) => {
      formattedMatches.push({
        id: p.shareCode,
        shareCode: p.shareCode,
        map: p.map || "de_dust2",
        score: "QUEUED",
        result: "SYNCING",
        kills: 0,
        deaths: 0,
        assists: 0,
        headshots: 0,
        mvps: 0,
        date: p.queuedAt || "Just now"
      });
    });

    return NextResponse.json({
      success: true,
      matches: formattedMatches,
    });
  } catch (err: any) {
    console.error("[valve-history Error]", err);
    return NextResponse.json({ matches: [], error: err.message });
  }
}
