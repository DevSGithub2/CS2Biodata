import clientPromise from "@/lib/mongodb";

export async function storeMatchRecord(matchData: {
  matchId: string;
  shareCode?: string;
  map: string;
  score: string;
  durationSeconds?: number;
  players: Array<{
    steamId64: string;
    kills: number;
    deaths: number;
    assists: number;
    adr: number;
    headshotPercent: number;
    mvps: number;
  }>;
}) {
  try {
    const client = await clientPromise;
    const db = client.db("cs2biodata");

    await db.collection("matches").updateOne(
      { matchId: matchData.matchId },
      {
        $set: {
          ...matchData,
          createdAt: new Date()
        }
      },
      { upsert: true }
    );
    return { success: true };
  } catch (error: any) {
    console.error("[Match Ingestion Error]", error);
    return { success: false, error: error.message };
  }
}

export async function getPlayerMatchHistory(steamId64: string, limit = 10) {
  try {
    const client = await clientPromise;
    const db = client.db("cs2biodata");

    return await db
      .collection("matches")
      .find({ "players.steamId64": steamId64 })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  } catch (error) {
    return [];
  }
}
