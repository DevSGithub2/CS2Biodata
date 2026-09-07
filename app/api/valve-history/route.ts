import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const steamId64 = url.searchParams.get("steamId64");

  if (!steamId64) return NextResponse.json({ success: false, error: "Missing steamId64" }, { status: 400 });

  try {
    const client = await clientPromise;
    const db = client.db("cs2pulse");

    const matches = await db.collection("matches")
      .find({ $or: [{ players: steamId64 }, { steamId64 }, { discoveredFromSteamId: steamId64 }] })
      .sort({ updatedAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({
      success: true,
      matches: matches.map(m => ({
        id: m._id.toString(),
        shareCode: m.shareCode,
        matchId: m.matchId,
        mode: "Competitive", 
        map: "Match",
        score: m.score || "N/A",
        result: m.result || "N/A",
        demoUrl: m.demoUrl,
        scoreboard: m.scoreboard || [],
        status: m.status,
        date: m.updatedAt || m.createdAt
      }))
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
