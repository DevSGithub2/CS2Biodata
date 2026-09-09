import { NextResponse } from "next/server";
import { fetchPremierLeaderboard, LeaderboardRegion } from "@/lib/services/leaderboard";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = (searchParams.get("region")?.toLowerCase() || "world") as LeaderboardRegion;
  const season = parseInt(searchParams.get("season") || "4", 10);

  try {
    const data = await fetchPremierLeaderboard(region, season);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
