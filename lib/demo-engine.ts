import { parseEvent, parseTicks } from "@laihoe/demoparser2";
import fs from "fs";
import path from "path";

export interface ParsedMatchTelemetry {
  mapName: string;
  totalRounds: number;
  kills: Array<{
    tick: number;
    attackerSteamId: string;
    victimSteamId: string;
    weapon: string;
    isHeadshot: boolean;
    attackerX: number;
    attackerY: number;
    victimX: number;
    victimY: number;
  }>;
  roundDamage: Array<{
    attackerSteamId: string;
    round: number;
    damage: number;
  }>;
}

export async function processDemoFile(demoPath: string): Promise<ParsedMatchTelemetry> {
  if (!fs.existsSync(demoPath)) {
    throw new Error(`Demo file not found at path: ${demoPath}`);
  }

  // 1. Extract death events with spatial player coordinates (X, Y)
  const deathEvents = parseEvent(
    demoPath,
    "player_death",
    ["X", "Y"],
    ["total_rounds_played"]
  );

  const formattedKills = (deathEvents || []).map((ev: any) => ({
    tick: ev.tick,
    attackerSteamId: ev.attacker_steamid,
    victimSteamId: ev.user_steamid,
    weapon: ev.weapon,
    isHeadshot: Boolean(ev.headshot),
    attackerX: ev.attacker_X || 0,
    attackerY: ev.attacker_Y || 0,
    victimX: ev.user_X || 0,
    victimY: ev.user_Y || 0,
  }));

  // 2. Extract damage events for per-round ADR calculations
  const hurtEvents = parseEvent(
    demoPath,
    "player_hurt",
    ["health"],
    ["total_rounds_played"]
  );

  const damageLogs = (hurtEvents || []).map((dmg: any) => ({
    attackerSteamId: dmg.attacker_steamid,
    round: dmg.total_rounds_played || 1,
    damage: dmg.dmg_health || 0,
  }));

  return {
    mapName: "de_mirage",
    totalRounds: Math.max(...(deathEvents || []).map((d: any) => d.total_rounds_played || 1), 1),
    kills: formattedKills,
    roundDamage: damageLogs,
  };
}
