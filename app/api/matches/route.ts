import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const steamId = searchParams.get("steamId") || searchParams.get("steamId64") || searchParams.get("q");

    if (!steamId) {
      return NextResponse.json({ matches: [] });
    }

    const client = await clientPromise;
    const db = client.db();

    const matches = await db
      .collection("matches")
      .find({
        $or: [
          { steamId64: steamId },
          { "scoreboard.steamId64": steamId },
        ],
      })
      .sort({ updatedAt: -1, _id: -1 })
      .toArray();

    return NextResponse.json({ matches });
  } catch (err: any) {
    console.error("Matches GET error:", err);
    return NextResponse.json({ matches: [], error: err.message }, { status: 500 });
  }
}
