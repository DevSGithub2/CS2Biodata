import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const region = (searchParams.get("region") || "global").toLowerCase();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  let rawEntries: any[] = [];

  // 1. Fetch live CS2 Premier Leaderboard data from the active daily snapshot index
  try {
    const targetRegion = region === "global" ? "global" : region;
    const res = await fetch(
      `https://raw.githubusercontent.com/explodingcamera/cs2leaderboard/main/data/latest/${targetRegion}.json`,
      { next: { revalidate: 300 } }
    );

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        rawEntries = data;
      }
    }
  } catch (err) {
    console.error("Live leaderboard fetch error:", err);
  }

  // 2. Format and style rating tiers
  const parsed = rawEntries.map((e: any, index: number) => {
    const rank = e.rank || index + 1;
    const name = e.name || e.username || `Player_${rank}`;
    const score = e.score || e.rating || 0;
    const rating = score > 100000 ? score >> 15 : score; // Handle bitshifted score if present

    let tierColor = "text-slate-300 border-slate-700 bg-slate-900/40";
    if (rating >= 30000) tierColor = "text-amber-300 border-amber-500/50 bg-amber-950/20";
    else if (rating >= 25000) tierColor = "text-rose-400 border-rose-500/50 bg-rose-950/20";
    else if (rating >= 20000) tierColor = "text-pink-400 border-pink-500/50 bg-pink-950/20";
    else if (rating >= 15000) tierColor = "text-purple-400 border-purple-500/50 bg-purple-950/20";
    else if (rating >= 10000) tierColor = "text-blue-400 border-blue-500/50 bg-blue-950/20";
    else if (rating >= 5000) tierColor = "text-cyan-400 border-cyan-500/50 bg-cyan-950/20";

    return {
      rank,
      name,
      query: e.steamid || e.steamId64 || name,
      rating,
      region: e.region || region.toUpperCase(),
      wins: e.wins || null,
      winRate: e.win_rate ? `${Math.round(e.win_rate * 100)}%` : null,
      tierColor,
    };
  });

  // 3. Paginate
  const startIndex = (page - 1) * limit;
  const paginatedEntries = parsed.slice(startIndex, startIndex + limit);

  return NextResponse.json({
    success: true,
    data: {
      leaderboardName: `CS2 Premier Leaderboard (${region.toUpperCase()})`,
      totalCount: parsed.length,
      totalPages: Math.max(1, Math.ceil(parsed.length / limit)),
      currentPage: page,
      entries: paginatedEntries,
    },
  });
}
