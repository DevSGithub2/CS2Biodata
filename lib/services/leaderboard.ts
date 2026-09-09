import clientPromise from "@/lib/mongodb";

export type LeaderboardRegion =
  | "world"
  | "asia"
  | "europe"
  | "northamerica"
  | "southamerica"
  | "australia"
  | "china"
  | "africa";

const FACEIT_REGION_MAP: Record<LeaderboardRegion, string> = {
  world: "EU",
  europe: "EU",
  asia: "SEA",
  northamerica: "US",
  southamerica: "SA",
  australia: "OCE",
  china: "SEA",
  africa: "ZA"
};

export async function fetchPremierLeaderboard(region: LeaderboardRegion = "world", season: number = 4) {
  let db;
  try {
    const client = await clientPromise;
    db = client.db("cs2biodata");

    // Check Atlas cache (1 hour TTL)
    const cached = await db.collection("leaderboards").findOne({
      region,
      updatedAt: { $gt: new Date(Date.now() - 60 * 60 * 1000) }
    });

    if (cached && cached.entries && cached.entries.length > 0) {
      return {
        region,
        season,
        entries: cached.entries,
        source: "mongodb_cache"
      };
    }
  } catch (err) {
    console.warn("[Leaderboard DB Check Error]", err);
  }

  // Fetch competitive top ladder from FACEIT Open API v4
  const faceitRegion = FACEIT_REGION_MAP[region] || "SEA";
  const faceitApiKey = process.env.FACEIT_API_KEY || "";

  try {
    const res = await fetch(
      `https://open.faceit.com/data/v4/rankings/games/cs2/regions/${faceitRegion}?limit=50`,
      {
        headers: {
          Authorization: `Bearer ${faceitApiKey}`,
          Accept: "application/json"
        },
        cache: "no-store"
      }
    );

    if (res.ok) {
      const data = await res.json();
      const rawItems = data.items || [];

      const entries = rawItems.map((item: any) => ({
        rank: item.position,
        score: item.faceit_elo,
        name: item.nickname,
        steamId64: item.game_player_id || null,
        country: item.country || "GLOBAL",
        avatar: item.avatar || "https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg"
      }));

      if (db && entries.length > 0) {
        await db.collection("leaderboards").updateOne(
          { region },
          {
            $set: {
              region,
              season,
              entries,
              updatedAt: new Date()
            }
          },
          { upsert: true }
        ).catch(() => {});
      }

      return {
        region,
        season,
        entries,
        source: "faceit_premier_ladder"
      };
    }
  } catch (err) {
    console.error("[Leaderboard Fetch Error]", err);
  }

  return { region, season, entries: [], source: "upstream_offline" };
}
