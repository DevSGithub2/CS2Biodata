import clientPromise from "@/lib/mongodb";

export async function recalculatePlayerStats(steamId: string) {
  const client = await clientPromise;
  const db = client.db("cs2biodata");

  const matches = await db.collection("valve_matches")
    .find({ $or: [{ steamId }, { steamId64: steamId }] })
    .toArray();

  if (!matches.length) return;

  let totalKills = 0;
  let totalDeaths = 0;
  let totalAssists = 0;
  let totalWins = 0;

  matches.forEach((m: any) => {
    totalKills += Number(m.kills || 0);
    totalDeaths += Number(m.deaths || 0);
    totalAssists += Number(m.assists || 0);
    if (m.result === "WIN" || m.won === true) totalWins++;
  });

  const kdRatio = totalDeaths > 0 ? Number((totalKills / totalDeaths).toFixed(2)) : totalKills;
  const winRate = Number(((totalWins / matches.length) * 100).toFixed(1));

  await db.collection("player_ranks").updateOne(
    { $or: [{ steamId }, { steamId64: steamId }] },
    {
      $set: {
        totalMatches: matches.length,
        totalWins,
        kdRatio,
        winRate,
        updatedAt: new Date()
      }
    },
    { upsert: true }
  );

  console.log(`[Stats] Recalculated for ${steamId}: ${matches.length} matches, KD ${kdRatio}, WR ${winRate}%`);
}
