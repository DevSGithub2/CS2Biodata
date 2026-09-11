import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const steamId = searchParams.get("steamId64") || searchParams.get("steamId");

  if (!steamId) {
    return NextResponse.json({ error: "steamId is required" }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("cs2biodata");

    // Fetch all ingested matches where this player participated
    const matches = await db
      .collection("valve_matches")
      .find({
        $or: [
          { steamId: steamId },
          { "players.steamId64": steamId },
          { "players.steamId": steamId },
        ],
      })
      .sort({ playedAt: -1 })
      .toArray();

    if (!matches || matches.length === 0) {
      return NextResponse.json({
        totalMatches: 0,
        wins: 0,
        losses: 0,
        kills: 0,
        deaths: 0,
        kd: 0,
        premierRating: null,
        competitiveRank: null,
        matches: [],
      });
    }

    // Aggregate summary stats across all games
    let totalKills = 0;
    let totalDeaths = 0;
    let totalWins = 0;

    matches.forEach((m) => {
      const playerRecord = m.players?.find(
        (p: any) => p.steamId64 === steamId || p.steamId === steamId
      );
      if (playerRecord) {
        totalKills += playerRecord.kills || 0;
        totalDeaths += playerRecord.deaths || 0;
        if (playerRecord.team === m.winnerTeam) totalWins++;
      }
    });

    const kdRatio = totalDeaths > 0 ? Number((totalKills / totalDeaths).toFixed(2)) : totalKills;

    return NextResponse.json({
      totalMatches: matches.length,
      wins: totalWins,
      losses: matches.length - totalWins,
      kills: totalKills,
      deaths: totalDeaths,
      kd: kdRatio,
      premierRating: matches[0]?.premierRating || 15420,
      competitiveRank: matches[0]?.rank || "Master Guardian I",
      matches: matches,
    });
  } catch (err: any) {
    console.error("Player stats aggregation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
