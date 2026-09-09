const FACEIT_KEY = process.env.FACEIT_API_KEY || "";

export async function fetchFaceitStats(steamId64: string) {
  if (!FACEIT_KEY) return null;

  try {
    const playerRes = await fetch(
      `https://open.faceit.com/data/v4/players?game=cs2&game_player_id=${steamId64}`,
      {
        headers: { Authorization: `Bearer ${FACEIT_KEY}` },
        next: { revalidate: 300 }
      }
    );

    if (!playerRes.ok) return null;
    const player = await playerRes.json();
    const playerId = player.player_id;
    const cs2Game = player.games?.cs2;

    if (!cs2Game) {
      return {
        registered: true,
        nickname: player.nickname,
        avatar: player.avatar,
        elo: null,
        skillLevel: null
      };
    }

    // Fetch stats breakdown (matches, win rate, K/D)
    let stats: any = null;
    try {
      const statsRes = await fetch(
        `https://open.faceit.com/data/v4/players/${playerId}/stats/cs2`,
        {
          headers: { Authorization: `Bearer ${FACEIT_KEY}` },
          next: { revalidate: 300 }
        }
      );
      if (statsRes.ok) {
        stats = await statsRes.json();
      }
    } catch {}

    const lifetime = stats?.lifetime || {};

    return {
      registered: true,
      nickname: player.nickname,
      avatar: player.avatar,
      elo: cs2Game.faceit_elo ?? 1000,
      skillLevel: cs2Game.skill_level ?? 1,
      region: cs2Game.region,
      lifetime: {
        matches: Number(lifetime["Matches"] || 0),
        winRate: lifetime["Win Rate %"] || "0%",
        kdRatio: Number(lifetime["Average K/D Ratio"] || 0),
        headshots: lifetime["Average Headshots %"] || "0%",
        recentResults: lifetime["Recent Results"] || []
      }
    };
  } catch (err) {
    console.error("[Faceit Service Error]", err);
    return null;
  }
}
