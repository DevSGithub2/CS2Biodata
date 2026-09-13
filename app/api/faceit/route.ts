import { NextRequest, NextResponse } from "next/server";
import { fetchFaceitStats } from "@/lib/services/faceit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const steamId = searchParams.get("steamId") || searchParams.get("steamId64");

  if (!steamId) {
    return NextResponse.json({ error: "Missing steamId parameter" }, { status: 400 });
  }

  const data = await fetchFaceitStats(steamId);
  if (!data) {
    return NextResponse.json({ error: "No FACEIT profile found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
