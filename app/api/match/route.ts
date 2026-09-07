import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://22bcs50145_db_user:Cs2PulsePass2026@cluster0.sphkwzw.mongodb.net/cs2pulse?retryWrites=true&w=majority&appName=Cluster0";

let client: MongoClient | null = null;
async function getDb() {
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
  }
  return client.db("cs2pulse");
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const shareCode = searchParams.get("shareCode");

    if (!shareCode) {
      return NextResponse.json({ success: false, error: "shareCode is required" }, { status: 400 });
    }

    const db = await getDb();
    const match = await db.collection("matches").findOne({ shareCode });

    if (!match) {
      return NextResponse.json({ success: false, error: "Match not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      match: {
        shareCode: match.shareCode,
        status: match.status || "indexed",
        scoreboard: match.scoreboard || [],
        players: match.players || [],
        createdAt: match.createdAt,
        parsedAt: match.parsedAt || null,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { shareCode, steamId64 } = await req.json();

    if (!shareCode || typeof shareCode !== "string") {
      return NextResponse.json({ success: false, error: "Missing match share code." }, { status: 400 });
    }

    const cleanCode = shareCode.trim();
    const db = await getDb();

    await db.collection("matches").updateOne(
      { shareCode: cleanCode },
      {
        $setOnInsert: {
          shareCode: cleanCode,
          status: "pending_download",
          discoveredFromSteamId: steamId64 || null,
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, shareCode: cleanCode });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
