import { NextResponse } from "next/server";
import { fetchFaceitStats } from "@/lib/services/faceit";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const steamId = searchParams.get("steamId") || "76561198877011661";

  try {
    const stats = await fetchFaceitStats(steamId);
    if (!stats) {
      return NextResponse.json({ error: "Failed to fetch FACEIT stats" }, { status: 404 });
    }
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
