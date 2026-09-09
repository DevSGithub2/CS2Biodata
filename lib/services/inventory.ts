export async function fetchCS2Inventory(steamId64: string) {
  try {
    const res = await fetch(`https://steamcommunity.com/inventory/${steamId64}/730/2?l=english&count=100`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      next: { revalidate: 600 }
    });

    if (!res.ok) return { totalItems: 0, items: [] };

    const data = await res.json();
    if (!data.assets || !data.descriptions) return { totalItems: 0, items: [] };

    const descMap = new Map();
    data.descriptions.forEach((d: any) => descMap.set(`${d.classid}_${d.instanceid}`, d));

    const items = data.assets.map((asset: any) => {
      const desc = descMap.get(`${asset.classid}_${asset.instanceid}`) || {};
      const name = desc.market_name || desc.name || "Unknown Asset";
      const typeStr = (desc.type || "").toLowerCase();
      const lower = name.toLowerCase();

      // Granular category resolution
      let category = "other";
      if (lower.includes("knife") || lower.includes("bayonet") || lower.includes("karambit") || lower.includes("butterfly") || lower.includes("talon") || lower.includes("skeleton") || lower.includes("kukri") || lower.includes("stiletto") || typeStr.includes("knife")) {
        category = "knives";
      } else if (lower.includes("gloves") || lower.includes("hand wraps") || typeStr.includes("gloves")) {
        category = "gloves";
      } else if (lower.includes("awp") || lower.includes("ssg 08") || lower.includes("scar-20") || lower.includes("g3sg1") || typeStr.includes("sniper rifle")) {
        category = "snipers";
      } else if (lower.includes("ak-47") || lower.includes("m4a4") || lower.includes("m4a1-s") || lower.includes("galil") || lower.includes("famas") || lower.includes("sg 553") || lower.includes("aug")) {
        category = "rifles";
      } else if (lower.includes("usp-s") || lower.includes("glock-18") || lower.includes("desert eagle") || lower.includes("p250") || lower.includes("five-seven") || lower.includes("cz75") || lower.includes("dual berettas") || lower.includes("tec-9") || lower.includes("r8 revolver") || lower.includes("p2000") || typeStr.includes("pistol")) {
        category = "pistols";
      } else if (lower.includes("mac-10") || lower.includes("mp9") || lower.includes("mp7") || lower.includes("mp5-sd") || lower.includes("ump-45") || lower.includes("p90") || lower.includes("pp-bizon") || typeStr.includes("smg")) {
        category = "smgs";
      } else if (typeStr.includes("agent") || lower.includes("elite crew") || lower.includes("prof. shahmat")) {
        category = "agents";
      } else if (typeStr.includes("collectible") || typeStr.includes("medal") || lower.includes("coin") || lower.includes("pin") || lower.includes("badge")) {
        category = "collectibles";
      } else if (typeStr.includes("music kit")) {
        category = "music_kits";
      } else if (typeStr.includes("container") || lower.includes("case") || lower.includes("capsule") || lower.includes("pack")) {
        category = "containers";
      }

      // Reconstruct Inspect Link if available
      let inspectLink: string | null = null;
      if (desc.actions && desc.actions[0] && desc.actions[0].link) {
        inspectLink = desc.actions[0].link
          .replace("%owner_steamid%", steamId64)
          .replace("%assetid%", asset.assetid);
      }

      return {
        assetId: asset.assetid,
        name,
        category,
        rarity: desc.type || "Mil-Spec Grade",
        rarityColor: desc.name_color || "4b69ff",
        image: desc.icon_url ? `https://community.cloudflare.steamstatic.com/economy/image/${desc.icon_url}` : null,
        tradable: Boolean(desc.tradable),
        inspectLink
      };
    });

    return {
      totalItems: items.length,
      items
    };
  } catch {
    return { totalItems: 0, items: [] };
  }
}
