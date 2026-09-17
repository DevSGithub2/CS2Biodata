import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { resolveToSteamId64 } from "@/lib/services/steam";

const uri = process.env.MONGODB_URI || "";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("steamId64")?.trim();

  if (!query || query === "undefined" || query === "null") {
    return NextResponse.json({
      premier: { activeSeason: { rating: 0, wins: 0 }, seasons: [] },
      mapRanks: [],
      wingman: { wins: 0, rankId: 0, bestRankId: 0 },
      isCalibrated: false,
    });
  }

  if (!uri) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  let client: MongoClient | null = null;

  try {
    // 1. Resolve vanity URL / custom name to real 17-digit numeric SteamID64
    let targetSteamId64 = query;
    if (!/^\d{17}$/.test(targetSteamId64)) {
      try {
        targetSteamId64 = await resolveToSteamId64(query);
      } catch {
        targetSteamId64 = query;
      }
    }

    client = new MongoClient(uri);
    await client.connect();
    const db = client.db("cs2biodata");

    // 2. Strict query by exact SteamID64
    let record: any = await db.collection("player_ranks").findOne({
      $or: [{ steamId64: targetSteamId64 }, { steamId: targetSteamId64 }]
    });

    if (!record || !record.premier?.activeSeason?.rating) {
      const dossier: any = await db.collection("dossiers").findOne({
        $or: [
          { steamId64: targetSteamId64 },
          { steamId: targetSteamId64 },
          { "identifiers.steamID64": targetSteamId64 },
          { "steam.identifiers.steamID64": targetSteamId64 }
        ]
      });

      if (dossier && (dossier.premier || dossier.premierRating || dossier.premier_rank)) {
        const rating = Number(
          dossier.premier?.rating ??
          dossier.premier?.score ??
          dossier.premierRating ??
          dossier.premier_rank ??
          0
        );

        const wins = Number(
          dossier.premier?.activeSeason?.wins ??
          dossier.premier?.wins ??
          dossier.premierWins ??
          0
        );

        record = {
          _id: dossier._id,
          steamId64: targetSteamId64,
          premier: {
            activeSeason: { rating, wins },
            seasons: dossier.premier?.seasons || []
          },
          premierRating: rating,
          premierWins: wins,
          isCalibrated: rating > 0,
          rankings: dossier.rankings || []
        };
      }
    }

    if (!record) {
      return NextResponse.json({
        steamId64: targetSteamId64,
        premier: { activeSeason: { rating: 0, wins: 0 }, seasons: [] },
        mapRanks: [],
        wingman: { wins: 0, rankId: 0, bestRankId: 0 },
        isCalibrated: false,
      });
    }

    return NextResponse.json(record);
  } catch (err: any) {
    console.error("[GC Player Rank Error]:", err);
    return NextResponse.json({
      steamId64: query,
      premier: { activeSeason: { rating: 0, wins: 0 }, seasons: [] },
      mapRanks: [],
      wingman: { wins: 0, rankId: 0, bestRankId: 0 },
      isCalibrated: false,
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
}
