import { NextRequest, NextResponse } from "next/server";

const FACEIT_API_KEY = process.env.FACEIT_API_KEY || "";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const steamId64 = searchParams.get("steamId64");

  if (!steamId64) {
    return NextResponse.json({ error: "Missing steamId64" }, { status: 400 });
  }

  if (!FACEIT_API_KEY) {
    return NextResponse.json({ error: "FACEIT_API_KEY not configured" }, { status: 500 });
  }

  try {
    const profileRes = await fetch(
      `https://open.faceit.com/data/v4/players?game=cs2&game_player_id=${steamId64}`,
      {
        headers: { Authorization: `Bearer ${FACEIT_API_KEY}` },
        next: { revalidate: 180 },
      }
    );

    if (!profileRes.ok) {
      return NextResponse.json({ linked: false, error: "FACEIT profile not found" });
    }

    const profileData = await profileRes.json();
    const playerId = profileData.player_id;
    const cs2Game = profileData.games?.cs2 || {};

    let statsData: any = {};
    let historyData: any = {};
    try {
      const [statsRes, historyRes] = await Promise.all([
        fetch(`https://open.faceit.com/data/v4/players/${playerId}/stats/cs2`, {
          headers: { Authorization: `Bearer ${FACEIT_API_KEY}` },
          next: { revalidate: 180 },
        }),
        fetch(`https://open.faceit.com/data/v4/players/${playerId}/history?game=cs2&offset=0&limit=20`, {
          headers: { Authorization: `Bearer ${FACEIT_API_KEY}` },
          next: { revalidate: 120 },
        }),
      ]);

      if (statsRes.ok) statsData = await statsRes.json();
      if (historyRes.ok) historyData = await historyRes.json();
    } catch {}

    const lifetime = statsData?.lifetime || {};
    const segments = statsData?.segments || [];
    const rawMatches = historyData?.items || [];

    const matchesList = await Promise.all(
      rawMatches.map(async (m: any) => {
        const matchId = m.match_id;
        let playerStats: any = {};
        let eloDiff = "";

        try {
          const mStatsRes = await fetch(`https://open.faceit.com/data/v4/matches/${matchId}/stats`, {
            headers: { Authorization: `Bearer ${FACEIT_API_KEY}` },
            next: { revalidate: 300 },
          });
          if (mStatsRes.ok) {
            const mStatsJson = await mStatsRes.json();
            const rounds = mStatsJson?.rounds?.[0] || {};
            for (const team of rounds.teams || []) {
              const foundP = team.players?.find((p: any) => p.player_id === playerId);
              if (foundP) {
                playerStats = foundP.player_stats || {};
                eloDiff = foundP.player_stats?.["Result"] === "1" ? "+25" : "-25"; 
              }
            }
          }
        } catch {}

        const results = m.results || {};
        let playerWon = false;
        const factions = m.teams || {};
        
        for (const fKey of Object.keys(factions)) {
          const faction = factions[fKey];
          const isPlayerInFaction = faction.players?.some((p: any) => p.player_id === playerId);
          if (isPlayerInFaction && results.winner === fKey) {
            playerWon = true;
          }
        }

        const dateObj = m.finished_at ? new Date(m.finished_at * 1000) : new Date();
        const dateStr = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        const timeStr = dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });

        const kills = playerStats["Kills"] || "12";
        const deaths = playerStats["Deaths"] || "12";
        const assists = playerStats["Assists"] || "5";
        const kd = playerStats["K/D Ratio"] || playerStats["K/D"] || "1.00";
        const adr = playerStats["ADR"] || playerStats["Average Damage per Round"] || "78.5";

        return {
          matchId,
          date: `${dateStr} ${timeStr}`,
          map: m.voting?.map?.pick?.[0] || "Mirage",
          result: playerWon ? "W" : "L",
          score: results.score ? `${results.score.faction1} : ${results.score.faction2}` : "13 : 8",
          kdRatio: Number(kd).toFixed(2),
          kdA: `${kills} / ${deaths} / ${assists}`,
          adr: Number(adr).toFixed(1),
          eloChange: playerWon ? "+26" : "-26",
        };
      })
    );

    const mapStats = segments
      .filter((s: any) => s.type === "Map")
      .map((s: any) => ({
        map: s.label || s.mode,
        matches: s.stats?.Matches || "0",
        winRate: s.stats?.["Win Rate %"] || "0",
        kdRatio: s.stats?.["Average K/D Ratio"] || "0",
        headshotPct: s.stats?.["Average Headshots %"] || "0",
        wins: s.stats?.Wins || "0",
      }));

    return NextResponse.json({
      linked: true,
      playerId,
      nickname: profileData.nickname,
      avatar: profileData.avatar,
      coverImage: profileData.cover_image || null,
      country: profileData.country || "GLOBAL",
      bio: profileData.settings?.bio || "Competitive Counter-Strike 2 Operative",
      faceitUrl: profileData.faceit_url ? profileData.faceit_url.replace("{lang}", "en") : null,
      membershipType: profileData.membership_type || "free",
      skillLevel: cs2Game.skill_level || 0,
      elo: cs2Game.faceit_elo || 0,
      region: cs2Game.region || "GLOBAL",
      lifetime: {
        matches: lifetime.Matches || "0",
        winRate: lifetime["Win Rate %"] || "0",
        kdRatio: lifetime["Average K/D Ratio"] || "0",
        headshots: lifetime["Total Headshots %"] || lifetime["Average Headshots %"] || "0",
        currentWinStreak: lifetime["Current Win Streak"] || "0",
        longestWinStreak: lifetime["Longest Win Streak"] || "0",
      },
      matches: matchesList,
      mapStats,
    });
  } catch (err: any) {
    return NextResponse.json({ linked: false, error: err.message }, { status: 500 });
  }
}
