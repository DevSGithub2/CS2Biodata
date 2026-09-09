import { NextRequest, NextResponse } from "next/server";

const STEAM_CDN = "https://community.cloudflare.steamstatic.com/economy/image/";

const RARITY_WEIGHT: Record<string, number> = {
  "ffd700": 700,
  "e4ae39": 650,
  "eb4b4b": 500,
  "d32ce6": 400,
  "8847ff": 300,
  "4b69ff": 200,
  "5e98d9": 100,
  "b0c3d9": 50,
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const steamId64 = searchParams.get("steamId64");

  if (!steamId64) {
    return NextResponse.json({ error: "Missing steamId64 parameter" }, { status: 400 });
  }

  try {
    let allDescriptions: any[] = [];
    let startAssetId: string | null = null;
    let hasMore = true;
    let iterations = 0;

    while (hasMore && iterations < 15) {
      iterations++;
      const url = new URL(`https://steamcommunity.com/inventory/${steamId64}/730/2?l=english&count=2000`);
      if (startAssetId) {
        url.searchParams.set("start_assetid", startAssetId);
      }

      const res = await fetch(url.toString(), {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        next: { revalidate: 300 },
      });

      if (!res.ok) break;

      const json = await res.json();
      if (json?.descriptions && Array.isArray(json.descriptions)) {
        allDescriptions = allDescriptions.concat(json.descriptions);
      }

      if (json?.more_items && json?.last_assetid) {
        startAssetId = json.last_assetid;
      } else {
        hasMore = false;
      }
    }

    const seen = new Set<string>();
    const uniqueDescriptions = allDescriptions.filter((desc) => {
      const key = `${desc.classid}_${desc.instanceid}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const items = uniqueDescriptions.map((desc: any) => {
      const tags = desc.tags || [];
      const typeTag = tags.find((t: any) => t.category === "Type")?.internal_name?.toLowerCase() || "";
      const weaponTag = tags.find((t: any) => t.category === "Weapon")?.name || "";
      const exteriorTag = tags.find((t: any) => t.category === "Exterior")?.name || "";
      const rarityColor = (tags.find((t: any) => t.category === "Rarity")?.color || "b0c3d9").toLowerCase();
      const marketName = desc.market_name || desc.name || "CS2 Item";
      const lowerName = marketName.toLowerCase();

      let nametag = null;
      const fraudWarning = desc.fraudwarnings?.[0] || "";
      if (fraudWarning.includes("Name Tag:")) {
        const match = fraudWarning.match(/Name Tag:\s*''([^']+)''/);
        if (match) nametag = match[1];
      }

      const stickerDesc = desc.descriptions?.find((d: any) => d.value?.includes("sticker_info") || d.value?.includes("Sticker:"));
      const stickers = stickerDesc ? stickerDesc.value.replace(/<[^>]*>?/gm, "").replace("Sticker: ", "") : null;

      // 100% Granular Discrete Categorization
      let category = "other";
      if (typeTag.includes("knife") || lowerName.includes("knife") || lowerName.includes("bayonet") || lowerName.includes("karambit") || lowerName.includes("daggers")) {
        category = "knife";
      } else if (typeTag.includes("gloves") || lowerName.includes("gloves") || lowerName.includes("wraps")) {
        category = "gloves";
      } else if (lowerName.includes("awp") || lowerName.includes("ssg 08") || lowerName.includes("scar-20") || lowerName.includes("g3sg1")) {
        category = "sniper";
      } else if (
        lowerName.includes("ak-47") || lowerName.includes("m4a4") || lowerName.includes("m4a1-s") || 
        lowerName.includes("galil") || lowerName.includes("famas") || lowerName.includes("aug") || lowerName.includes("sg 553")
      ) {
        category = "rifle";
      } else if (
        lowerName.includes("usp-s") || lowerName.includes("glock") || lowerName.includes("desert eagle") ||
        lowerName.includes("p250") || lowerName.includes("five-seven") || lowerName.includes("tec-9") ||
        lowerName.includes("cz75") || lowerName.includes("dual berettas") || lowerName.includes("r8 revolver") ||
        lowerName.includes("p2000")
      ) {
        category = "pistol";
      } else if (
        lowerName.includes("mp9") || lowerName.includes("mac-10") || lowerName.includes("mp7") ||
        lowerName.includes("ump-45") || lowerName.includes("p90") || lowerName.includes("pp-bizon")
      ) {
        category = "smg";
      } else if (
        lowerName.includes("nova") || lowerName.includes("xm1014") || lowerName.includes("mag-7") ||
        lowerName.includes("sawed-off") || lowerName.includes("m249") || lowerName.includes("negev")
      ) {
        category = "heavy";
      } else if (typeTag.includes("customplayer") || lowerName.includes("agent") || lowerName.includes("crew") || lowerName.includes("operator")) {
        category = "agent";
      } else if (lowerName.includes("service medal") || lowerName.includes("veteran coin") || lowerName.includes("badge") || lowerName.includes("birthday coin")) {
        category = "medal";
      } else if (lowerName.includes("pin")) {
        category = "pin";
      } else if (lowerName.includes("case") || lowerName.includes("package") || lowerName.includes("souvenir")) {
        category = "case";
      } else if (lowerName.includes("capsule")) {
        category = "capsule";
      } else if (lowerName.includes("music kit")) {
        category = "musickit";
      } else if (lowerName.includes("graffiti")) {
        category = "graffiti";
      } else if (lowerName.includes("charm") || lowerName.includes("detachment") || lowerName.includes("tool") || lowerName.includes("patch") || lowerName.includes("explosive")) {
        category = "utility";
      }

      const iconPath = desc.icon_url_large || desc.icon_url || "";
      const fullIconUrl = iconPath ? (iconPath.startsWith("http") ? iconPath : `${STEAM_CDN}${iconPath}`) : "";

      let rarityScore = RARITY_WEIGHT[rarityColor] || 0;
      if (category === "knife") rarityScore = 1200;
      else if (category === "gloves") rarityScore = 1100;
      else if (category === "medal" || category === "pin") rarityScore = 150;

      return {
        id: `${desc.classid}_${desc.instanceid}`,
        name: marketName,
        type: category,
        weapon: weaponTag || category.toUpperCase(),
        wear: exteriorTag || "Standard Grade",
        icon: fullIconUrl,
        rarityColor: `#${rarityColor}`,
        rarityScore,
        nametag,
        stickers,
        tradable: desc.tradable === 1,
        marketable: desc.marketable === 1,
      };
    });

    items.sort((a: any, b: any) => b.rarityScore - a.rarityScore);

    return NextResponse.json({ items });
  } catch (err: any) {
    return NextResponse.json({ items: [], error: err.message }, { status: 500 });
  }
}
