import clientPromise from "@/lib/mongodb";

export interface MatchPlayerStat {
  steamId64: string;
  name?: string;
  kills: number;
  deaths: number;
  assists: number;
  score: number;
  mvps: number;
  headshots: number;
  team: number; // 2 = T, 3 = CT
}

export interface MatchPayload {
  matchId: string;
  shareCode: string;
  map: string;
  durationSeconds?: number;
  scoreTeam1: number;
  scoreTeam2: number;
  winnerTeam: number;
  playedAt: Date;
  players: MatchPlayerStat[];
}

export async function ingestMatchAndPropagatePlayers(matchData: MatchPayload) {
  const client = await clientPromise;
  const db = client.db("cs2biodata");

  // 1. Store the primary match document
  await db.collection("valve_matches").updateOne(
    { matchId: matchData.matchId },
    {
      $set: {
        matchId: matchData.matchId,
        shareCode: matchData.shareCode,
        map: matchData.map,
        scoreTeam1: matchData.scoreTeam1,
        scoreTeam2: matchData.scoreTeam2,
        winnerTeam: matchData.winnerTeam,
        playedAt: matchData.playedAt,
        players: matchData.players,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );

  // 2. Ripple-Effect: Upsert records for all players in the match
  const bulkPlayerOps: any[] = matchData.players.map((p) => {
    const isWinner = p.team === matchData.winnerTeam;
    const kd = p.deaths > 0 ? parseFloat((p.kills / p.deaths).toFixed(2)) : p.kills;

    return {
      updateOne: {
        filter: { steamId64: p.steamId64 },
        update: {
          $set: {
            steamId64: p.steamId64,
            updatedAt: new Date(),
          },
          $inc: {
            "stats.totalMatches": 1,
            "stats.wins": isWinner ? 1 : 0,
            "stats.kills": p.kills,
            "stats.deaths": p.deaths,
            "stats.assists": p.assists,
            "stats.headshots": p.headshots,
            "stats.mvps": p.mvps,
          },
          $push: {
            recentMatches: {
              $each: [
                {
                  matchId: matchData.matchId,
                  shareCode: matchData.shareCode,
                  map: matchData.map,
                  result: isWinner ? "VICTORY" : "DEFEAT",
                  score: `${matchData.scoreTeam1} - ${matchData.scoreTeam2}`,
                  kills: p.kills,
                  deaths: p.deaths,
                  assists: p.assists,
                  kd,
                  playedAt: matchData.playedAt,
                },
              ],
              $slice: -20,
            },
          },
        },
        upsert: true,
      },
    };
  });

  if (bulkPlayerOps.length > 0) {
    await db.collection("players").bulkWrite(bulkPlayerOps);
  }

  // 3. Mark the pending match queue entry as processed
  await db.collection("pending_matches").updateOne(
    { shareCode: matchData.shareCode },
    { $set: { status: "completed", processedAt: new Date() } }
  );

  return { success: true, playersIngested: matchData.players.length };
}
