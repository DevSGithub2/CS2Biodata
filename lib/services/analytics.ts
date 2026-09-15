export interface UnifiedMatchStat {
  source: "FACEIT" | "VALVE";
  matchId: string;
  map: string;
  isWin: boolean;
  kills: number;
  deaths: number;
  assists: number;
  headshots: number;
  mvps: number;
  playedAt: string | Date;
}

export interface CareerTelemetryOverview {
  totalMatches: number;
  faceitMatches: number;
  valveMatches: number;
  wins: number;
  losses: number;
  winRate: number; // Percentage (e.g. 58.4)
  totalKills: number;
  totalDeaths: number;
  totalAssists: number;
  overallKd: number;
  headshotPercentage: number;
  avgKillsPerMatch: number;
  mostPlayedMap: string;
  bestMap: { map: string; winRate: number };
}

export function computeUnifiedOverview(
  valveMatches: any[] = [],
  faceitMatches: any[] = []
): CareerTelemetryOverview {
  const normalized: UnifiedMatchStat[] = [];

  // 1. Normalize Valve Matches
  for (const m of valveMatches) {
    const p = Array.isArray(m.players) && m.players.length > 0 ? m.players[0] : null;
    const isWin = m.result === "VICTORY" || m.result === "WIN" || m.win === true || m.winnerTeam === 2;
    const kills = Number(m.kills ?? p?.kills ?? 0);
    const deaths = Number(m.deaths ?? p?.deaths ?? 0);
    const assists = Number(m.assists ?? p?.assists ?? 0);
    const headshots = Number(m.headshots ?? p?.headshots ?? 0);
    const mvps = Number(m.mvps ?? p?.mvps ?? 0);

    normalized.push({
      source: "VALVE",
      matchId: m.matchId || m.shareCode || Math.random().toString(),
      map: (m.map || "de_dust2").toLowerCase().replace("de_", "").replace("cs_", ""),
      isWin,
      kills,
      deaths,
      assists,
      headshots,
      mvps,
      playedAt: m.playedAt || m.matchTime || new Date()
    });
  }

  // 2. Normalize FACEIT Matches
  for (const f of faceitMatches) {
    const isWin = f.result === "WIN" || f.i10 === "1" || f.won === true;
    const kills = Number(f.kills ?? f.i6 ?? 0);
    const deaths = Number(f.deaths ?? f.i8 ?? 0);
    const assists = Number(f.assists ?? f.i7 ?? 0);
    const headshots = Number(f.headshots ?? f.headshotKills ?? f.i13 ?? 0);
    const mvps = Number(f.mvps ?? f.i9 ?? 0);
    const rawMap = f.map || f.i1 || "mirage";

    normalized.push({
      source: "FACEIT",
      matchId: f.matchId || f.match_id || Math.random().toString(),
      map: rawMap.toLowerCase().replace("de_", "").replace("cs_", ""),
      isWin,
      kills,
      deaths,
      assists,
      headshots,
      mvps,
      playedAt: f.playedAt || f.date || new Date()
    });
  }

  const totalMatches = normalized.length;
  if (totalMatches === 0) {
    return {
      totalMatches: 0,
      faceitMatches: 0,
      valveMatches: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      totalKills: 0,
      totalDeaths: 0,
      totalAssists: 0,
      overallKd: 1.0,
      headshotPercentage: 0,
      avgKillsPerMatch: 0,
      mostPlayedMap: "—",
      bestMap: { map: "—", winRate: 0 }
    };
  }

  let totalWins = 0;
  let totalKills = 0;
  let totalDeaths = 0;
  let totalAssists = 0;
  let totalHeadshots = 0;

  const mapStats: Record<string, { played: number; wins: number }> = {};

  for (const match of normalized) {
    if (match.isWin) totalWins++;
    totalKills += match.kills;
    totalDeaths += match.deaths;
    totalAssists += match.assists;
    totalHeadshots += match.headshots;

    if (!mapStats[match.map]) {
      mapStats[match.map] = { played: 0, wins: 0 };
    }
    mapStats[match.map].played++;
    if (match.isWin) mapStats[match.map].wins++;
  }

  // Determine favorite and highest winrate maps
  let mostPlayedMap = "—";
  let maxPlayedCount = 0;
  let bestMapName = "—";
  let bestWinRate = -1;

  for (const [map, stats] of Object.entries(mapStats)) {
    if (stats.played > maxPlayedCount) {
      maxPlayedCount = stats.played;
      mostPlayedMap = map.toUpperCase();
    }
    const currentMapWinrate = (stats.wins / stats.played) * 100;
    if (stats.played >= 2 && currentMapWinrate > bestWinRate) {
      bestWinRate = currentMapWinrate;
      bestMapName = map.toUpperCase();
    }
  }

  return {
    totalMatches,
    faceitMatches: normalized.filter((m) => m.source === "FACEIT").length,
    valveMatches: normalized.filter((m) => m.source === "VALVE").length,
    wins: totalWins,
    losses: totalMatches - totalWins,
    winRate: Number(((totalWins / totalMatches) * 100).toFixed(1)),
    totalKills,
    totalDeaths,
    totalAssists,
    overallKd: Number((totalDeaths > 0 ? totalKills / totalDeaths : totalKills).toFixed(2)),
    headshotPercentage: Number((totalKills > 0 ? (totalHeadshots / totalKills) * 100 : 0).toFixed(1)),
    avgKillsPerMatch: Number((totalKills / totalMatches).toFixed(1)),
    mostPlayedMap,
    bestMap: {
      map: bestMapName !== "—" ? bestMapName : mostPlayedMap,
      winRate: bestWinRate !== -1 ? Number(bestWinRate.toFixed(1)) : 0
    }
  };
}
