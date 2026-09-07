export interface FaceitPlayerStats {
  kills: number;
  deaths: number;
  kd: number;
  hsPercentage: number;
  adr: number;
  mvps: number;
  result: "WIN" | "LOSS" | "UNKNOWN";
}

export interface EnrichedFaceitMatch {
  matchId: string;
  gameMode: string;
  map: string;
  score: string;
  result: "WIN" | "LOSS" | "UNKNOWN";
  startedAt: number;
  finishedAt: number;
  stats: FaceitPlayerStats;
  faceitUrl: string;
}

const FACEIT_API_URL = "https://open.faceit.com/data/v4";

export async function getFaceitPlayerBySteamId(steamId64: string, apiKey: string) {
  try {
    const res = await fetch(`${FACEIT_API_URL}/players?game=cs2&game_player_id=${steamId64}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      const fallbackRes = await fetch(`${FACEIT_API_URL}/players?game=csgo&game_player_id=${steamId64}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
        next: { revalidate: 60 },
      });
      if (!fallbackRes.ok) return null;
      return await fallbackRes.json();
    }

    return await res.json();
  } catch (err) {
    console.error("FACEIT player lookup failed:", err);
    return null;
  }
}

export async function getEnrichedFaceitMatches(steamId64: string, apiKey: string, limit = 25): Promise<EnrichedFaceitMatch[]> {
  try {
    const player = await getFaceitPlayerBySteamId(steamId64, apiKey);
    if (!player || !player.player_id) return [];

    const playerId = player.player_id;

    const historyRes = await fetch(
      `${FACEIT_API_URL}/players/${playerId}/history?game=cs2&offset=0&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
        next: { revalidate: 60 },
      }
    );

    if (!historyRes.ok) return [];
    const historyData = await historyRes.json();
    const matchesList = historyData.items || [];

    const matchPromises = matchesList.map(async (match: any): Promise<EnrichedFaceitMatch> => {
      const matchId = match.match_id;
      const startedAt = match.started_at ? match.started_at * 1000 : Date.now();
      const finishedAt = match.finished_at ? match.finished_at * 1000 : Date.now();
      const faceitUrl = match.faceit_url ? match.faceit_url.replace("{lang}", "en") : `https://www.faceit.com/en/cs2/room/${matchId}`;

      let mapName = "Competitive";
      let scoreDisplay = "-- : --";
      let result: "WIN" | "LOSS" | "UNKNOWN" = "UNKNOWN";
      let stats: FaceitPlayerStats = {
        kills: 0,
        deaths: 0,
        kd: 0,
        hsPercentage: 0,
        adr: 0,
        mvps: 0,
        result: "UNKNOWN",
      };

      try {
        const statsRes = await fetch(`${FACEIT_API_URL}/matches/${matchId}/stats`, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: "application/json",
          },
          next: { revalidate: 300 },
        });

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          const round = statsData.rounds?.[0];

          if (round) {
            const rawMap = round.round_stats?.Map || "";
            const cleanMap = rawMap.replace(/^(de_|cs_)/, "").trim();
            mapName = cleanMap ? cleanMap.charAt(0).toUpperCase() + cleanMap.slice(1) : "Competitive";
            scoreDisplay = round.round_stats?.Score || "-- : --";

            for (const team of round.teams || []) {
              const p = team.players?.find((x: any) => x.player_id === playerId);
              if (p && p.player_stats) {
                const ps = p.player_stats;
                const kills = Number(ps.Kills) || 0;
                const deaths = Number(ps.Deaths) || 0;
                const kd = Number(ps["K/D Ratio"]) || (deaths > 0 ? Number((kills / deaths).toFixed(2)) : kills);
                const hsPercentage = Number(ps["Headshots %"]) || 0;
                const adr = Number(ps.ADR) || 0;
                const mvps = Number(ps.MVPs) || 0;
                const winFlag = ps.Result === "1";

                result = winFlag ? "WIN" : "LOSS";
                stats = {
                  kills,
                  deaths,
                  kd,
                  hsPercentage,
                  adr,
                  mvps,
                  result,
                };
                break;
              }
            }
          }
        }
      } catch (e) {
        console.warn(`Could not resolve stats for match ${matchId}:`, e);
      }

      return {
        matchId,
        gameMode: match.game_mode || "5v5",
        map: mapName,
        score: scoreDisplay,
        result,
        startedAt,
        finishedAt,
        stats,
        faceitUrl,
      };
    });

    const resolvedMatches = await Promise.allSettled(matchPromises);
    return resolvedMatches
      .filter((res): res is PromiseFulfilledResult<EnrichedFaceitMatch> => res.status === "fulfilled")
      .map((res) => res.value);
  } catch (err) {
    console.error("Failed to load enriched FACEIT history:", err);
    return [];
  }
}
