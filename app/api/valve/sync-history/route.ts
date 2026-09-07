import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { decodeShareCode } from "@/lib/sharecode";
import * as Sentry from "@sentry/nextjs";

export const dynamic = "force-dynamic";

const STEAM_API_KEY = process.env.STEAM_API_KEY;

export async function POST(req: Request) {
  try {
    const { steamId, authCode, knownCode } = await req.json();

    if (!steamId || !authCode || !knownCode) {
      return NextResponse.json(
        { error: "steamId, authCode, and knownCode are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("cs2biodata");
    const collection = db.collection("valve_matches");

    const matchesFound: any[] = [];
    let currentCode = knownCode.trim();

    // 1. First parse and save the known initial code
    const initialDecoded = decodeShareCode(currentCode);
    matchesFound.push({
      steamId,
      shareCode: currentCode,
      decoded: initialDecoded,
      syncedAt: new Date(),
    });

    // 2. Crawl Valve API up to 20 chronological matches forward
    let hasNext = true;
    let iterations = 0;

    while (hasNext && iterations < 20) {
      iterations++;
      const url = `https://api.steampowered.com/ICSGOPlayers_730/GetNextMatchSharingCode/v1?key=${STEAM_API_KEY}&steamid=${steamId}&steamidkey=${encodeURIComponent(
        authCode.trim()
      )}&knowncode=${encodeURIComponent(currentCode)}`;

      const res = await fetch(url);

      if (res.status === 202) {
        // HTTP 202 Accepted means no newer matches exist (end of timeline)
        hasNext = false;
        break;
      }

      if (!res.ok) {
        hasNext = false;
        break;
      }

      const data = await res.json();
      const nextCode = data.result?.nextcode;

      if (!nextCode || nextCode === "n/a" || nextCode === currentCode) {
        hasNext = false;
        break;
      }

      const decoded = decodeShareCode(nextCode);
      matchesFound.push({
        steamId,
        shareCode: nextCode,
        decoded,
        syncedAt: new Date(),
      });

      currentCode = nextCode;
    }

    // 3. Batch upsert discovered matches into Atlas
    for (const match of matchesFound) {
      await collection.updateOne(
        { steamId, shareCode: match.shareCode },
        { $set: match },
        { upsert: true }
      );
    }

    return NextResponse.json({
      success: true,
      syncedCount: matchesFound.length,
      matches: matchesFound,
    });
  } catch (error: any) {
    Sentry.captureException(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const steamId = searchParams.get("steamId");

  if (!steamId) {
    return NextResponse.json({ error: "steamId is required" }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const matches = await client
      .db("cs2biodata")
      .collection("valve_matches")
      .find({ steamId })
      .sort({ syncedAt: -1 })
      .limit(30)
      .toArray();

    return NextResponse.json({ success: true, matches });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
