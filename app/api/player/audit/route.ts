import { NextResponse } from "next/server";
import { resolveToSteamId64, fetchSteamProfileAndBans, fetchFriendNetworkAudit } from "@/lib/services/steam";
import { fetchFaceitStats } from "@/lib/services/faceit";
import { fetchCS2Inventory } from "@/lib/services/inventory";
import { enrichInventoryWithPrices } from "@/lib/services/pricing";
import { getPlayerMatchHistory } from "@/lib/services/matches";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim();

  if (!query) {
    return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
  }

  try {
    const steamId64 = await resolveToSteamId64(query);
    const STEAM_API_KEY = process.env.STEAM_API_KEY;

    // 1. Check MongoDB Atlas Cached Player Record (5-minute TTL)
    let client;
    let db;
    try {
      client = await clientPromise;
      db = client.db("cs2biodata");
      const cached = await db.collection("players").findOne({
        steamId64,
        updatedAt: { $gt: new Date(Date.now() - 5 * 60 * 1000) }
      });
      if (cached && (cached as any).steamLevel !== undefined && (cached as any).steamLevel > 0) {
        return NextResponse.json({
          ...cached,
          source: "mongodb_cache",
          cacheAgeSeconds: Math.round((Date.now() - new Date(cached.updatedAt).getTime()) / 1000)
        });
      }
    } catch (dbErr) {
      console.warn("[MongoDB Read Miss]", dbErr);
    }

    // 2. Parallel Live Ingestion including Live Steam Level
    const fetchLiveLevel = async (): Promise<number> => {
      try {
        if (!STEAM_API_KEY) return 0;
        const res = await fetch(
          `https://api.steampowered.com/IPlayerService/GetSteamLevel/v1/?key=${STEAM_API_KEY}&steamid=${steamId64}`,
          { cache: "no-store" }
        );
        if (res.ok) {
          const json = await res.json();
          return typeof json.response?.player_level === "number" ? json.response.player_level : 0;
        }
      } catch {}
      return 0;
    };

    const [steamProfileRaw, liveLevel, faceitData, friendAudit, rawInventory, matchHistory] = await Promise.all([
      fetchSteamProfileAndBans(steamId64),
      fetchLiveLevel(),
      fetchFaceitStats(steamId64),
      fetchFriendNetworkAudit(steamId64),
      fetchCS2Inventory(steamId64),
      getPlayerMatchHistory(steamId64, 5)
    ]);

    // 3. Calculate dynamic tenure
    const rawTime = (steamProfileRaw as any)?.timeCreated;
    const timeCreated = rawTime ? Number(rawTime) : null;
    const yearsOld = timeCreated
      ? Math.max(0, Math.floor((Date.now() - timeCreated * 1000) / (365.25 * 24 * 3600 * 1000)))
      : null;

    // Enriched Steam Profile object without mutating strictly typed interfaces
    const steamProfile = {
      ...(steamProfileRaw as any),
      steamLevel: liveLevel,
      level: liveLevel,
      yearsOld,
      timeCreated
    };

    // 4. Price inventory items
    const pricedInventory = await enrichInventoryWithPrices(steamId64, rawInventory.items);

    const auditPayload = {
      steamId64,
      steamLevel: liveLevel,
      level: liveLevel,
      yearsOld,
      steam: steamProfile,
      faceit: faceitData,
      network: friendAudit,
      inventory: {
        totalItems: pricedInventory.items.length,
        totalValuationUSD: pricedInventory.totalValuationUSD,
        items: pricedInventory.items
      },
      matches: matchHistory,
      updatedAt: new Date()
    };

    // 5. Save to MongoDB Atlas
    if (db) {
      await db.collection("players").updateOne(
        { steamId64 },
        { $set: auditPayload },
        { upsert: true }
      ).catch(() => {});
    }

    return NextResponse.json({
      ...auditPayload,
      source: "live_aggregated"
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
