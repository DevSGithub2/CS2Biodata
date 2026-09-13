import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawId = searchParams.get("steamId") || searchParams.get("steamId64");

  if (!rawId) {
    return NextResponse.json({ error: "steamId is required" }, { status: 400 });
  }

  const STEAM_API_KEY = process.env.STEAM_API_KEY;
  if (!STEAM_API_KEY) {
    return NextResponse.json({ error: "STEAM_API_KEY is not configured" }, { status: 500 });
  }

  try {
    let resolvedSteamId64 = rawId.trim();

    // 1. Resolve Vanity URL if input is not a 17-digit SteamID64
    if (!/^\d{17}$/.test(resolvedSteamId64)) {
      const cleanVanity = resolvedSteamId64.replace(/^https?:\/\/steamcommunity\.com\/(id|profiles)\//, "").replace(/\/.*$/, "");
      
      const vanityRes = await fetch(
        `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${STEAM_API_KEY}&vanityurl=${encodeURIComponent(cleanVanity)}`,
        { cache: "no-store" }
      );
      const vanityData = await vanityRes.json();
      if (vanityData?.response?.success === 1 && vanityData.response.steamid) {
        resolvedSteamId64 = vanityData.response.steamid;
      }
    }

    // 2. Fetch live Steam Player Summary
    const profileRes = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${resolvedSteamId64}`,
      { cache: "no-store" }
    );
    const profileData = await profileRes.json();
    const player = profileData.response?.players?.[0];

    if (!player) {
      return NextResponse.json({ error: "Steam profile not found" }, { status: 404 });
    }

    // 3. Fetch live Steam Level using the resolved 64-bit Steam ID
    let steamLevel = 0;
    try {
      const lvlRes = await fetch(
        `https://api.steampowered.com/IPlayerService/GetSteamLevel/v1/?key=${STEAM_API_KEY}&steamid=${resolvedSteamId64}`,
        { cache: "no-store" }
      );
      if (lvlRes.ok) {
        const lvlData = await lvlRes.json();
        if (typeof lvlData.response?.player_level === "number") {
          steamLevel = lvlData.response.player_level;
        }
      }
    } catch {
      steamLevel = 0;
    }

    // 4. Fetch CS2 Raw Stats (AppID 730)
    let stats = null;
    try {
      const statsRes = await fetch(
        `https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=730&key=${STEAM_API_KEY}&steamid=${resolvedSteamId64}`,
        { cache: "no-store" }
      );
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        stats = statsData.playerstats?.stats || [];
      }
    } catch {
      stats = null;
    }

    // 5. Calculate Account Age
    const timeCreated = player.timecreated ? Number(player.timecreated) : null;
    const yearsOld = timeCreated
      ? Math.max(0, Math.floor((Date.now() - timeCreated * 1000) / (365.25 * 24 * 3600 * 1000)))
      : null;

    const client = await clientPromise;
    const db = client.db("cs2biodata");

    // 6. Structure Dynamic Player Document
    const playerData = {
      steamId64: resolvedSteamId64,
      personaName: player.personaname,
      profileUrl: player.profileurl,
      avatar: player.avatarfull,
      personaState: player.personastate ?? 0,
      gameExtraInfo: player.gameextrainfo || null,
      communityVisibilityState: player.communityvisibilitystate,
      country: player.loccountrycode || null,
      timeCreated: timeCreated,
      yearsOld: yearsOld,
      steamLevel: steamLevel,
      level: steamLevel,
      rawStats: stats,
      updatedAt: new Date(),
    };

    // Upsert to DB
    await db.collection("players").updateOne(
      { steamId64: resolvedSteamId64 },
      { $set: playerData },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      player: playerData,
      steam: playerData,
      steamLevel,
      level: steamLevel,
      yearsOld,
    });
  } catch (err: any) {
    console.error("Profile resolution error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
