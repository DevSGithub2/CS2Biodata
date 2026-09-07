import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const { steamId64 } = await req.json();

    if (!steamId64) {
      return NextResponse.json({ success: false, error: "Missing SteamID64" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("cs2pulse");
    const cached = await db.collection("gc_profiles").findOne({ steamId64: String(steamId64) });

    if (!cached) {
      return NextResponse.json({
        success: false,
        error: "No GC session recorded yet. Click 'Add GC Bot on Steam' first, wait 2 seconds for acceptance, then click Re-verify!",
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        premierRating: cached.premierRating,
        wingmanData: cached.wingmanData,
        mapSkillGroups: cached.mapSkillGroups || [],
        updatedAt: cached.updatedAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to load GC sync data" }, { status: 500 });
  }
}
