import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const steamId64 = searchParams.get("steamId64");

  if (!steamId64) {
    return NextResponse.json({ error: "steamId64 is required" }, { status: 400 });
  }

  if (!uri) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db("cs2biodata");

    const record = await db.collection("player_ranks").findOne({ steamId64 });
    await client.close();

    if (!record) {
      return NextResponse.json({
        steamId64,
        premier: { activeSeason: { rating: 0, wins: 0 }, seasons: [] },
        mapRanks: [],
        wingman: { wins: 0, rankId: 0, bestRankId: 0 },
        isCalibrated: false,
      });
    }

    return NextResponse.json(record);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
