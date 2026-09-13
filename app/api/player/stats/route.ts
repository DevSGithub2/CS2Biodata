import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const steamId = searchParams.get("steamId64") || searchParams.get("steamId");

    if (!steamId) {
      return NextResponse.json({ error: "Missing steamId or steamId64" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("cs2biodata");

    // 1. First check player_ranks
    let doc = await db.collection("player_ranks").findOne({
      $or: [{ steamId64: steamId }, { steamId }]
    });

    // 2. If not found or stats empty, check player_stats
    if (!doc || !doc.kdRatio) {
      const statsDoc = await db.collection("player_stats").findOne({
        $or: [{ steamId64: steamId }, { steamId }]
      });
      if (statsDoc) {
        doc = { ...doc, ...statsDoc };
      }
    }

    if (!doc) {
      return NextResponse.json({ error: "Stats not found" }, { status: 404 });
    }

    return NextResponse.json({
      kdRatio: doc.kdRatio ?? 0,
      adr: doc.adr ?? 0,
      headshotPct: doc.headshotPct ?? 0,
      totalKills: doc.totalKills ?? 0,
      totalDeaths: doc.totalDeaths ?? 0,
      totalMatches: doc.totalMatches ?? 0
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
