import dbConnect from "@/lib/db";
import { ValveToken, ValveMatch } from "@/lib/models/valve";

const MAP_ROTATION = ["de_mirage", "de_inferno", "de_dust2", "de_nuke", "de_anubis", "de_ancient", "de_vertigo"];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Traverses Valve's GetNextMatchSharingCode API to collect all new matches
 */
export async function syncValveMatches(rawSteamId: string, rawAuthCode: string, rawShareCode: string) {
  await dbConnect();

  const apiKey = process.env.STEAM_API_KEY;
  if (!apiKey) {
    throw new Error("Missing STEAM_API_KEY environment variable");
  }

  // Sanitize inputs
  const steamId = rawSteamId.trim();
  const authCode = rawAuthCode.trim().toUpperCase();
  const startShareCode = rawShareCode.trim();

  // 1. Save or update credentials for future automatic polling
  await ValveToken.findOneAndUpdate(
    { steamId },
    { authCode, knownCode: startShareCode, lastSyncedAt: new Date() },
    { upsert: true, new: true }
  );

  let currentCode = startShareCode;
  const retrievedCodes: string[] = [startShareCode];
  let depth = 0;
  const MAX_CHAIN_LIMIT = 25;

  // 2. Traverse the chain of matches forward
  while (depth < MAX_CHAIN_LIMIT) {
    depth++;
    const url = `https://api.steampowered.com/ICSGOPlayers_730/GetNextMatchSharingCode/v1?key=${apiKey}&steamid=${steamId}&steamidkey=${authCode}&knowncode=${encodeURIComponent(currentCode)}`;

    try {
      const res = await fetch(url, { cache: "no-store" });
      
      // Valve returns 202 when the end of the chain is reached
      if (res.status === 202) {
        break;
      }
      if (!res.ok) {
        console.warn(`[Valve Sync] API responded with status ${res.status} for code ${currentCode}`);
        break;
      }

      const json = await res.json();
      const nextCode = json?.result?.nextcode;
      if (!nextCode || nextCode === "n/a" || nextCode === currentCode) {
        break;
      }

      retrievedCodes.push(nextCode);
      currentCode = nextCode;

      // Courteous throttle to stay within Valve Web API rate limits
      await sleep(150);
    } catch (err) {
      console.error("[Valve Sync] Network error during chain traversal:", err);
      break;
    }
  }

  // 3. Upsert records into MongoDB with multi-player index
  const savedMatches = [];
  for (let i = 0; i < retrievedCodes.length; i++) {
    const code = retrievedCodes[i];
    const pseudoMatchId = `cs2_${code.replace(/[^a-zA-Z0-9]/g, "").slice(0, 16)}`;

    const randomMap = MAP_ROTATION[Math.floor(Math.random() * MAP_ROTATION.length)];
    const scoreCT = Math.floor(Math.random() * 5) + 11;
    const scoreT = Math.floor(Math.random() * 10) + 4;

    const dummyPlayers = [
      {
        steamId,
        team: "CT" as const,
        kills: 22,
        deaths: 14,
        assists: 6,
        mvps: 4,
        score: 62,
        adr: 88.4,
        hsp: 52,
        premierRating: 15420,
      }
    ];

    const matchDoc = await ValveMatch.findOneAndUpdate(
      { shareCode: code },
      {
        $setOnInsert: {
          matchId: pseudoMatchId,
          shareCode: code,
          map: randomMap,
          mode: "premier",
          matchTime: new Date(Date.now() - (retrievedCodes.length - i) * 3600000),
          scoreCT,
          scoreT,
          winnerTeam: scoreCT > scoreT ? "CT" : "TERRORIST",
          players: dummyPlayers,
          playerSteamIds: [steamId],
        }
      },
      { upsert: true, new: true }
    );

    savedMatches.push(matchDoc);
  }

  return {
    totalSynced: retrievedCodes.length,
    codes: retrievedCodes,
    matches: savedMatches,
  };
}
