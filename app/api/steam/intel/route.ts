import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import * as Sentry from "@sentry/nextjs";

const STEAM_API_KEY = process.env.STEAM_API_KEY;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const steamId = searchParams.get("steamId");

  if (!steamId) {
    return NextResponse.json({ error: "steamId is required" }, { status: 400 });
  }

  try {
    // 1. Parallel Fetch: Profile Summary + Ban Status + CS2 Stats
    const [summaryRes, bansRes, statsRes, invRes] = await Promise.all([
      fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${steamId}`),
      fetch(`https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${STEAM_API_KEY}&steamids=${steamId}`),
      fetch(`https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=730&key=${STEAM_API_KEY}&steamid=${steamId}`).catch(() => null),
      fetch(`https://steamcommunity.com/inventory/${steamId}/730/2?l=english&count=5000`).catch(() => null),
    ]);

    const summaryData = await summaryRes.json();
    const bansData = await bansRes.json();
    const statsData = statsRes && statsRes.ok ? await statsRes.json() : null;
    const invData = invRes && invRes.ok ? await invRes.json() : null;

    const profile = summaryData?.response?.players?.[0] || null;
    const bans = bansData?.players?.[0] || null;

    if (!profile) {
      return NextResponse.json({ error: "Player not found on Steam" }, { status: 404 });
    }

    // Format inventory items cleanly if public
    let inventoryItems: any[] = [];
    if (invData && invData.assets && invData.descriptions) {
      const descMap = new Map();
      invData.descriptions.forEach((d: any) => {
        descMap.set(`${d.classid}_${d.instanceid}`, d);
      });

      inventoryItems = invData.assets.map((asset: any) => {
        const desc = descMap.get(`${asset.classid}_${asset.instanceid}`) || {};
        return {
          assetid: asset.assetid,
          name: desc.market_name || desc.name,
          type: desc.type,
          icon_url: desc.icon_url ? `https://community.cloudflare.steamstatic.com/economy/image/${desc.icon_url}` : null,
          marketable: desc.marketable === 1,
          tradable: desc.tradable === 1,
          rarityColor: desc.tags?.find((t: any) => t.category === "Rarity")?.color || "ffffff",
        };
      });
    }

    const payload = {
      steamId,
      profile,
      bans: {
        communityBanned: bans?.CommunityBanned || false,
        vacBanned: bans?.VACBanned || false,
        numberOfVACBans: bans?.NumberOfVACBans || 0,
        daysSinceLastBan: bans?.DaysSinceLastBan || 0,
        economyBan: bans?.EconomyBan || "none",
      },
      stats: statsData?.playerstats?.stats || [],
      inventory: {
        totalCount: inventoryItems.length,
        items: inventoryItems.slice(0, 100), // Preview top 100
      },
      updatedAt: new Date(),
    };

    // Cache into MongoDB Atlas
    const client = await clientPromise;
    await client.db("cs2biodata").collection("steam_intel").updateOne(
      { steamId },
      { $set: payload },
      { upsert: true }
    );

    return NextResponse.json({ success: true, data: payload });
  } catch (error: any) {
    Sentry.captureException(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
