import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const steamId64 = body.steamId64 || body.steamId;

    if (!steamId64) {
      return NextResponse.json({ success: false, error: "Missing SteamID64" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("cs2biodata");
    const cached = await db.collection("player_ranks").findOne({ steamId64: String(steamId64) });

    if (!cached) {
      return NextResponse.json({
        success: false,
        error: "No GC session recorded yet. Ensure GC bot is active and befriend the bot on Steam.",
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        premier: cached.premier,
        wingman: cached.wingman,
        mapRanks: cached.mapRanks || [],
        commendations: cached.commendations,
        medals: cached.medals,
        updatedAt: cached.updatedAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to load GC sync data" }, { status: 500 });
  }
}
