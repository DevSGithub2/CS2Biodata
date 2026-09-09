import clientPromise from "@/lib/mongodb";

export async function enrichInventoryWithPrices(steamId64: string, rawItems: any[]) {
  if (!rawItems || rawItems.length === 0) {
    return { totalValuationUSD: 0, items: [] };
  }

  let db;
  try {
    const client = await clientPromise;
    db = client.db("cs2biodata");

    // Check existing inventory cache in MongoDB
    const cached = await db.collection("inventory_cache").findOne({ steamId64 });
    if (cached && cached.items && cached.items.length > 0) {
      return {
        totalValuationUSD: cached.totalValuationUSD,
        items: cached.items,
        source: "mongodb_cache"
      };
    }
  } catch (e) {
    console.warn("[MongoDB Pricing Cache Miss]", e);
  }

  // Price the most notable items (knives, gloves, StatTrak, tradeable skins) directly via Steam Community Market
  const pricedItems = await Promise.all(
    rawItems.map(async (item) => {
      // Non-marketable items default to 0
      if (!item.tradable) return { ...item, priceUSD: 0 };

      try {
        const marketUrl = `https://steamcommunity.com/market/priceoverview/?appid=730&currency=1&market_hash_name=${encodeURIComponent(item.name)}`;
        const res = await fetch(marketUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          },
          next: { revalidate: 3600 }
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && (data.lowest_price || data.median_price)) {
            const rawStr = data.lowest_price || data.median_price;
            const parsed = parseFloat(rawStr.replace(/[^0-9.]/g, ""));
            return {
              ...item,
              priceUSD: isNaN(parsed) ? 0 : Number(parsed.toFixed(2))
            };
          }
        }
      } catch (err) {
        // Soft fail to keep pipeline fast
      }

      return { ...item, priceUSD: 0 };
    })
  );

  const totalValuation = pricedItems.reduce((acc, cur) => acc + (cur.priceUSD || 0), 0);

  const finalPayload = {
    steamId64,
    totalValuationUSD: Number(totalValuation.toFixed(2)),
    items: pricedItems,
    cachedAt: new Date()
  };

  // Upsert into Atlas
  if (db) {
    db.collection("inventory_cache").updateOne(
      { steamId64 },
      { $set: finalPayload },
      { upsert: true }
    ).catch(() => {});
  }

  return { ...finalPayload, source: "live_calculated" };
}
