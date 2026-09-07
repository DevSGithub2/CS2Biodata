import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const STEAM_API_KEY = process.env.STEAM_API_KEY;

// Helper: Resolve Vanity URL to 64-bit Steam ID
async function resolveVanityUrl(query: string): Promise<string | null> {
  // If it's already a 17-digit SteamID64
  if (/^7656119[0-9]{10}$/.test(query)) {
    return query;
  }

  // Extract from full profile URL if passed
  const urlMatch = query.match(/(?:profiles|id)\/([^\/]+)/);
  const identifier = urlMatch ? urlMatch[1] : query.trim();

  if (/^7656119[0-9]{10}$/.test(identifier)) {
    return identifier;
  }

  try {
    const res = await fetch(
      `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${STEAM_API_KEY}&vanityurl=${encodeURIComponent(identifier)}`
    );
    const data = await res.json();
    if (data.response?.success === 1) {
      return data.response.steamid;
    }
  } catch {
    return null;
  }

  return null;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
  }

  try {
    const steamId = await resolveVanityUrl(query);
    if (!steamId) {
      return NextResponse.json({ error: "Could not resolve Steam profile" }, { status: 404 });
    }

    // 1. Fetch Profile Summary
    const profileRes = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${steamId}`
    );
    const profileData = await profileRes.json();
    const player = profileData.response?.players?.[0];

    if (!player) {
      return NextResponse.json({ error: "Steam profile not found" }, { status: 404 });
    }

    // 2. Fetch CS2 / CS:GO User Stats (AppID: 730)
    let stats = null;
    try {
      const statsRes = await fetch(
        `https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=730&key=${STEAM_API_KEY}&steamid=${steamId}`
      );
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        stats = statsData.playerstats?.stats || [];
      }
    } catch {
      stats = null;
    }

    // 3. Upsert to MongoDB Atlas
    const client = await clientPromise;
    const db = client.db("cs2biodata");
    const collection = db.collection("players");

    const playerData = {
      steamId64: player.steamid,
      personaName: player.personaname,
      profileUrl: player.profileurl,
      avatar: player.avatarfull,
      communityVisibilityState: player.communityvisibilitystate,
      rawStats: stats,
      updatedAt: new Date(),
    };

    await collection.updateOne(
      { steamId64: player.steamid },
      { $set: playerData },
      { upsert: true }
    );

    return NextResponse.json({ success: true, player: playerData });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
