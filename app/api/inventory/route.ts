import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const steamId64 = searchParams.get("steamId64")?.trim();

  if (!steamId64) {
    return NextResponse.json({ success: false, error: "Missing steamId64" }, { status: 400 });
  }

  try {
    const steamUrl = `https://steamcommunity.com/inventory/${steamId64}/730/2?l=english&count=2000`;
    
    const res = await fetch(steamUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Referer: `https://steamcommunity.com/profiles/${steamId64}/inventory`,
        Accept: "application/json",
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (res.status === 403) {
      return NextResponse.json({ success: true, isPrivate: true, items: [], totalCount: 0 });
    }

    if (!res.ok) {
      return NextResponse.json({ success: true, isPrivate: false, items: [], totalCount: 0 });
    }

    const data = await res.json();
    const descriptions = data.descriptions || [];
    const assets = data.assets || [];

    // Map descriptions to individual items
    const items = descriptions.map((desc: any) => {
      const isStatTrak = desc.market_name?.includes("StatTrak™");
      const isSouvenir = desc.market_name?.includes("Souvenir");
      const wearTag = desc.tags?.find((t: any) => t.category === "Exterior")?.name || null;
      const typeTag = desc.tags?.find((t: any) => t.category === "Type")?.name || desc.type || "Weapon";
      const rarityTag = desc.tags?.find((t: any) => t.category === "Rarity");

      return {
        id: desc.classid,
        name: desc.market_name,
        type: typeTag,
        rarity: rarityTag?.name || "Common",
        rarityColor: desc.name_color ? `#${desc.name_color}` : "#d2d2d2",
        iconUrl: desc.icon_url
          ? `https://community.cloudflare.steamstatic.com/economy/image/${desc.icon_url}`
          : null,
        isStatTrak,
        isSouvenir,
        wear: wearTag,
        tradable: desc.tradable === 1,
      };
    });

    return NextResponse.json({
      success: true,
      isPrivate: false,
      totalCount: assets.length || items.length,
      items,
    });
  } catch (err: any) {
    console.error("Steam Inventory fetch error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
