import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { resolveToSteamId64 } from "@/lib/services/steam";

const uri = process.env.MONGODB_URI || "";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawQuery = searchParams.get("steamId64")?.trim();

  if (!rawQuery || rawQuery === "undefined" || rawQuery === "null") {
    return NextResponse.json({
      steamId64: "",
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
    // 1. Universal Resolution: Convert any input (vanity, URL, SteamID) to 17-digit numeric SteamID64
    let targetSteamId64 = rawQuery;
    if (!/^\d{17}$/.test(targetSteamId64)) {
      try {
        const resolved = await resolveToSteamId64(rawQuery);
        if (resolved) targetSteamId64 = resolved;
      } catch (resolveErr) {
        console.warn("[GC Rank] SteamID resolution failed for:", rawQuery);
      }
    }

    client = new MongoClient(uri);
    await client.connect();
    const db = client.db("cs2biodata");

    // 2. Strict ID search in player_ranks
    let record: any = await db.collection("player_ranks").findOne({
      $or: [{ steamId64: targetSteamId64 }, { steamId: targetSteamId64 }]
    });

    // 3. Fallback to dossiers strictly matching targetSteamId64
    if (!record || !record.premier?.activeSeason?.rating) {
      const dossier: any = await db.collection("dossiers").findOne({
        $or: [
          { steamId64: targetSteamId64 },
          { steamId: targetSteamId64 },
          { "identifiers.steamID64": targetSteamId64 },
          { "steam.identifiers.steamID64": targetSteamId64 }
        ]
      });

      if (dossier) {
        // Look for rank_type_id: 6 (Premier) inside protobuf rankings array if present
        const premierRanking = Array.isArray(dossier.rankings)
          ? dossier.rankings.find((r: any) => r.rank_type_id === 6 || r.rank_type_id === 2)
          : null;

        const rating = Number(
          premierRanking?.rank_id ??
          dossier.premier?.activeSeason?.rating ??
          dossier.premier?.rating ??
          dossier.premierRating ??
          dossier.premier_rank ??
          0
        );

        const wins = Number(
          premierRanking?.wins ??
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

    // 4. If ID has never synced with GC bot, return clean uncalibrated state
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
      steamId64: rawQuery,
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
