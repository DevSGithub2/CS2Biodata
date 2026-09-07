import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import * as Sentry from "@sentry/nextjs";

const FACEIT_API_KEY = process.env.FACEIT_API_KEY;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const steamId = searchParams.get("steamId");
  const nickname = searchParams.get("nickname");

  if (!steamId && !nickname) {
    return NextResponse.json({ error: "steamId or nickname is required" }, { status: 400 });
  }

  try {
    let url = "";
    if (steamId) {
      url = `https://open.faceit.com/data/v4/players?game=cs2&game_player_id=${steamId}`;
    } else {
      url = `https://open.faceit.com/data/v4/players?nickname=${encodeURIComponent(nickname!)}`;
    }

    const playerRes = await fetch(url, {
      headers: { Authorization: `Bearer ${FACEIT_API_KEY}` },
    });

    if (!playerRes.ok) {
      return NextResponse.json({ error: "FACEIT player not found", faceitRegistered: false }, { status: 404 });
    }

    const faceitPlayer = await playerRes.json();
    const playerId = faceitPlayer.player_id;

    // Fetch CS2 Stats
    const statsRes = await fetch(`https://open.faceit.com/data/v4/players/${playerId}/stats/cs2`, {
      headers: { Authorization: `Bearer ${FACEIT_API_KEY}` },
    });
    const faceitStats = statsRes.ok ? await statsRes.json() : null;

    // Fetch Last 10 Match History
    const historyRes = await fetch(`https://open.faceit.com/data/v4/players/${playerId}/history?game=cs2&limit=10`, {
      headers: { Authorization: `Bearer ${FACEIT_API_KEY}` },
    });
    const faceitHistory = historyRes.ok ? await historyRes.json() : null;

    const payload = {
      playerId,
      nickname: faceitPlayer.nickname,
      avatar: faceitPlayer.avatar,
      country: faceitPlayer.country,
      cs2: {
        skillLevel: faceitPlayer.games?.cs2?.skill_level || 0,
        elo: faceitPlayer.games?.cs2?.faceit_elo || 0,
        gamePlayerId: faceitPlayer.games?.cs2?.game_player_id || "",
      },
      stats: faceitStats?.lifetime || {},
      recentMatches: faceitHistory?.items || [],
      updatedAt: new Date(),
    };

    // Upsert into MongoDB
    const client = await clientPromise;
    await client.db("cs2biodata").collection("faceit_intel").updateOne(
      { playerId },
      { $set: payload },
      { upsert: true }
    );

    return NextResponse.json({ success: true, data: payload });
  } catch (error: any) {
    Sentry.captureException(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
