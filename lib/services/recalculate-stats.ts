import clientPromise from "../mongodb";
import https from "https";

async function fetchSteamLifetimeStats(steamId: string): Promise<any> {
  const apiKey = process.env.STEAM_API_KEY;
  if (!apiKey) return null;

  const url = `https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v2/?appid=730&key=${apiKey}&steamid=${steamId}`;

  return new Promise((resolve) => {
    https.get(url, (res) => {
      let d = "";
      res.on("data", c => d += c);
      res.on("end", () => {
        try {
          const json = JSON.parse(d);
          const stats = json.playerstats?.stats || [];
          const getStat = (n: string) => stats.find((s: any) => s.name === n)?.value || 0;
          
          const kills = getStat("total_kills");
          const deaths = getStat("total_deaths");
          const headshots = getStat("total_kills_headshot");
          const damage = getStat("total_damage_done");
          const rounds = getStat("total_rounds_played");

          if (kills === 0 && deaths === 0) return resolve(null);

          resolve({
            totalKills: kills,
            totalDeaths: deaths,
            kdRatio: deaths > 0 ? Number((kills / deaths).toFixed(2)) : kills,
            headshotPct: kills > 0 ? Math.round((headshots / kills) * 100) : 0,
            adr: rounds > 0 ? Number((damage / rounds).toFixed(1)) : 85.0
          });
        } catch {
          resolve(null);
        }
      });
    }).on("error", () => resolve(null));
  });
}

export async function recalculatePlayerStats(steamId: string) {
  const client = await clientPromise;
  const db = client.db("cs2biodata");

  const matches = await db.collection("valve_matches")
    .find({ $or: [{ steamId }, { steamId64: steamId }] })
    .toArray();

  let totalKills = 0;
  let totalDeaths = 0;
  let totalAssists = 0;
  let totalHeadshots = 0;
  let totalWins = 0;

  matches.forEach((m: any) => {
    totalKills += Number(m.kills || 0);
    totalDeaths += Number(m.deaths || 0);
    totalAssists += Number(m.assists || 0);
    totalHeadshots += Number(m.headshots || 0);
    if (m.result === "WIN" || m.won === true) totalWins++;
  });

  let kdRatio = totalDeaths > 0 ? Number((totalKills / totalDeaths).toFixed(2)) : totalKills;
  let headshotPct = totalKills > 0 ? Math.round((totalHeadshots / totalKills) * 100) : 0;
  let adr = 82.5;

  // If local crawled matches are fewer than 5, hydrate from Steam Lifetime stats
  if (matches.length < 5) {
    const steamStats = await fetchSteamLifetimeStats(steamId);
    if (steamStats) {
      totalKills = steamStats.totalKills;
      kdRatio = steamStats.kdRatio;
      headshotPct = steamStats.headshotPct;
      adr = steamStats.adr;
    }
  }

  await db.collection("player_ranks").updateOne(
    { $or: [{ steamId }, { steamId64: steamId }] },
    {
      $set: {
        totalMatches: matches.length,
        totalWins,
        totalKills,
        kdRatio,
        headshotPct,
        adr,
        updatedAt: new Date()
      }
    },
    { upsert: true }
  );

  console.log(`[Stats Recalculated] ${steamId} -> Kills: ${totalKills}, KD: ${kdRatio}, HS: ${headshotPct}%, ADR: ${adr}`);
}
