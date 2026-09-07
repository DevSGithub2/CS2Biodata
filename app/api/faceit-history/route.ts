import { NextResponse } from "next/server";
import { getFaceitPlayerBySteamId, getEnrichedFaceitMatches } from "@/lib/faceit";

const FACEIT_API_URL = "https://open.faceit.com/data/v4";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const steamId64 = searchParams.get("steamId64") || searchParams.get("q");
    const limit = Number(searchParams.get("limit")) || 20;

    if (!steamId64) {
      return NextResponse.json({ success: false, error: "Steam ID64 is required" }, { status: 400 });
    }

    const apiKey = process.env.FACEIT_API_KEY || "2b0d2e13-4ed0-43f3-9e1a-0b7a6736ca92";

    // 1. Fetch Player Details
    const player = await getFaceitPlayerBySteamId(steamId64, apiKey);
    if (!player || !player.player_id) {
      return NextResponse.json({
        success: false,
        error: "No FACEIT profile found for this Steam ID",
        matches: [],
      }, { status: 404 });
    }

    const playerId = player.player_id;
    const region = player.games?.cs2?.region || "SEA";
    const country = player.country || "in";

    // 2. Concurrently fetch Lifetime & Map Stats, Rankings, Bans, and Matches
    const [statsRes, regionRankRes, countryRankRes, bansRes, matches] = await Promise.all([
      fetch(`${FACEIT_API_URL}/players/${playerId}/stats/cs2`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        next: { revalidate: 60 },
      }),
      fetch(`${FACEIT_API_URL}/rankings/games/cs2/regions/${region}/players/${playerId}?limit=1`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        next: { revalidate: 300 },
      }),
      fetch(`${FACEIT_API_URL}/rankings/games/cs2/regions/${region}/players/${playerId}?country=${country}&limit=1`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        next: { revalidate: 300 },
      }),
      fetch(`${FACEIT_API_URL}/players/${playerId}/bans`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        next: { revalidate: 300 },
      }),
      getEnrichedFaceitMatches(steamId64, apiKey, limit),
    ]);

    const statsData = statsRes.ok ? await statsRes.json() : null;
    const regionRankData = regionRankRes.ok ? await regionRankRes.json() : null;
    const countryRankData = countryRankRes.ok ? await countryRankRes.json() : null;
    const bansData = bansRes.ok ? await bansRes.json() : { items: [] };

    // Parse Map Segments cleanly
    const mapSegments = (statsData?.segments || [])
      .filter((s: any) => s.type === "Map")
      .map((s: any) => {
        const rawMap = s.label || s.mode || "";
        const cleanMap = rawMap.replace(/^(de_|cs_)/, "").trim();
        return {
          map: cleanMap ? cleanMap.charAt(0).toUpperCase() + cleanMap.slice(1) : rawMap,
          image: s.img_regular || s.img_small || null,
          matches: Number(s.stats?.Matches || 0),
          winRate: Number(s.stats?.["Win Rate %"] || 0),
          kd: Number(s.stats?.["Average K/D Ratio"] || s.stats?.["K/D Ratio"] || 0),
          hs: Number(s.stats?.["Average Headshots %"] || 0),
          wins: Number(s.stats?.Wins || 0),
        };
      })
      .sort((a: any, b: any) => b.matches - a.matches);

    return NextResponse.json({
      success: true,
      player: {
        playerId,
        nickname: player.nickname,
        avatar: player.avatar,
        coverImage: player.cover_image,
        country: player.country,
        skillLevel: player.games?.cs2?.skill_level || 1,
        elo: player.games?.cs2?.faceit_elo || 1000,
        region,
        verified: !!player.verified,
        faceitUrl: player.faceit_url ? player.faceit_url.replace("{lang}", "en") : `https://www.faceit.com/en/players/${player.nickname}`,
        regionalRank: regionRankData?.position || null,
        countryRank: countryRankData?.position || null,
        bans: bansData?.items || [],
      },
      stats: statsData?.lifetime || {},
      mapSegments,
      matches,
    });
  } catch (error: any) {
    console.error("FACEIT history API error:", error);
    return NextResponse.json({ success: false, error: error.message, matches: [] }, { status: 500 });
  }
}
