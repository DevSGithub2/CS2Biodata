// CS2 Official Assets, Ranks, Maps & FACEIT Telemetry Helpers

export interface SkillGroupMeta {
  id: number;
  name: string;
  badgePath: string;
}

export const COMPETITIVE_RANKS = [
  { id: 1, name: "Silver I", badgePath: "/assets/ranks/competitive/skillgroup1.png" },
  { id: 2, name: "Silver II", badgePath: "/assets/ranks/competitive/skillgroup2.png" },
  { id: 3, name: "Silver III", badgePath: "/assets/ranks/competitive/skillgroup3.png" },
  { id: 4, name: "Silver IV", badgePath: "/assets/ranks/competitive/skillgroup4.png" },
  { id: 5, name: "Silver Elite", badgePath: "/assets/ranks/competitive/skillgroup5.png" },
  { id: 6, name: "Silver Elite Master", badgePath: "/assets/ranks/competitive/skillgroup6.png" },
  { id: 7, name: "Gold Nova I", badgePath: "/assets/ranks/competitive/skillgroup7.png" },
  { id: 8, name: "Gold Nova II", badgePath: "/assets/ranks/competitive/skillgroup8.png" },
  { id: 9, name: "Gold Nova III", badgePath: "/assets/ranks/competitive/skillgroup9.png" },
  { id: 10, name: "Gold Nova Master", badgePath: "/assets/ranks/competitive/skillgroup10.png" },
  { id: 11, name: "Master Guardian I", badgePath: "/assets/ranks/competitive/skillgroup11.png" },
  { id: 12, name: "Master Guardian II", badgePath: "/assets/ranks/competitive/skillgroup12.png" },
  { id: 13, name: "Master Guardian Elite", badgePath: "/assets/ranks/competitive/skillgroup13.png" },
  { id: 14, name: "Distinguished Master Guardian", badgePath: "/assets/ranks/competitive/skillgroup14.png" },
  { id: 15, name: "Legendary Eagle", badgePath: "/assets/ranks/competitive/skillgroup15.png" },
  { id: 16, name: "Legendary Eagle Master", badgePath: "/assets/ranks/competitive/skillgroup16.png" },
  { id: 17, name: "Supreme Master First Class", badgePath: "/assets/ranks/competitive/skillgroup17.png" },
  { id: 18, name: "The Global Elite", badgePath: "/assets/ranks/competitive/skillgroup18.png" },
];

// Alias for backwards compatibility with DossierTabs
export const OFFICIAL_SKILL_GROUPS = COMPETITIVE_RANKS;

export function getPremierTier(rating?: number | null) {
  const r = Number(rating) || 0;
  if (r <= 0) {
    return {
      tier: "unranked",
      label: "Unranked",
      colorHex: "#888888",
      borderColor: "#444444",
      badgePath: "/assets/ranks/premier/unranked.svg",
    };
  }
  if (r < 5000) {
    return {
      tier: "sub5k",
      label: "0 - 4,999",
      colorHex: "#b0c3d9",
      borderColor: "#b0c3d9",
      badgePath: "/assets/ranks/premier/sub5k.svg",
    };
  }
  if (r < 10000) {
    return {
      tier: "sub10k",
      label: "5,000 - 9,999",
      colorHex: "#5e98d9",
      borderColor: "#5e98d9",
      badgePath: "/assets/ranks/premier/sub10k.svg",
    };
  }
  if (r < 15000) {
    return {
      tier: "sub15k",
      label: "10,000 - 14,999",
      colorHex: "#4b69ff",
      borderColor: "#4b69ff",
      badgePath: "/assets/ranks/premier/sub15k.svg",
    };
  }
  if (r < 20000) {
    return {
      tier: "sub20k",
      label: "15,000 - 19,999",
      colorHex: "#d32ce6",
      borderColor: "#d32ce6",
      badgePath: "/assets/ranks/premier/sub20k.svg",
    };
  }
  if (r < 25000) {
    return {
      tier: "sub25k",
      label: "20,000 - 24,999",
      colorHex: "#eb4b4b",
      borderColor: "#eb4b4b",
      badgePath: "/assets/ranks/premier/sub25k.svg",
    };
  }
  if (r < 30000) {
    return {
      tier: "sub30k",
      label: "25,000 - 29,999",
      colorHex: "#e4ae39",
      borderColor: "#e4ae39",
      badgePath: "/assets/ranks/premier/sub30k.svg",
    };
  }
  return {
    tier: "max",
    label: "30,000+",
    colorHex: "#ffd700",
    borderColor: "#ffd700",
    badgePath: "/assets/ranks/premier/30k.svg",
  };
}

export function getOfficialFaceitBadge(level: number | string) {
  const lvl = Number(level) || 1;
  if (lvl >= 11 || String(level).toLowerCase() === "challenger") {
    return {
      name: "Challenger",
      label: "Challenger",
      badgePath: "/assets/ranks/faceit/challenger.svg",
      color: "#FF3344",
    };
  }
  const cleanLvl = Math.max(1, Math.min(10, lvl));
  const colors: Record<number, string> = {
    1: "#EEEEEE",
    2: "#22c55e",
    3: "#22c55e",
    4: "#eab308",
    5: "#eab308",
    6: "#eab308",
    7: "#eab308",
    8: "#FF5500",
    9: "#FF5500",
    10: "#ef4444",
  };
  return {
    name: `Level ${cleanLvl}`,
    label: `Level ${cleanLvl}`,
    badgePath: `/assets/ranks/faceit/level-${cleanLvl}.svg`,
    color: colors[cleanLvl] || "#FF5500",
  };
}

export function getMapThumbnail(mapName?: string | null): string {
  if (!mapName) return "/maps/de_dust2.png";
  const raw = String(mapName).toLowerCase().trim().replace(/\s+/g, "");

  const aliases: Record<string, string> = {
    "dust2": "/maps/de_dust2.png",
    "de_dust2": "/maps/de_dust2.png",
    "dust": "/maps/de_dust2.png",
    "mirage": "/maps/de_mirage.png",
    "de_mirage": "/maps/de_mirage.png",
    "inferno": "/maps/de_inferno.png",
    "de_inferno": "/maps/de_inferno.png",
    "nuke": "/maps/de_nuke.png",
    "de_nuke": "/maps/de_nuke.png",
    "anubis": "/maps/de_anubis.png",
    "de_anubis": "/maps/de_anubis.png",
    "ancient": "/maps/de_ancient.png",
    "de_ancient": "/maps/de_ancient.png",
    "vertigo": "/maps/de_vertigo.png",
    "de_vertigo": "/maps/de_vertigo.png",
    "train": "/maps/de_train.png",
    "de_train": "/maps/de_train.png",
    "overpass": "/maps/de_overpass.png",
    "de_overpass": "/maps/de_overpass.png",
    "cache": "/maps/de_cache.png",
    "de_cache": "/maps/de_cache.png",
    "office": "/maps/cs_office.png",
    "cs_office": "/maps/cs_office.png",
    "italy": "/maps/cs_italy.png",
    "cs_italy": "/maps/cs_italy.png"
  };

  if (aliases[raw]) return aliases[raw];
  const normalized = raw.startsWith("de_") || raw.startsWith("cs_") ? raw : `de_${raw}`;
  return `/maps/${normalized}.png`;
}

export function getOfficialMapAsset(mapName?: string | null): { name: string; imagePath: string } {
  const clean = (mapName || "de_dust2").toLowerCase().trim();
  const normalized = clean.startsWith("de_") || clean.startsWith("cs_") ? clean : `de_${clean}`;
  
  const mapDisplayName: Record<string, string> = {
    de_dust2: "Dust II",
    de_mirage: "Mirage",
    de_inferno: "Inferno",
    de_nuke: "Nuke",
    de_anubis: "Anubis",
    de_ancient: "Ancient",
    de_vertigo: "Vertigo",
    de_train: "Train",
    de_overpass: "Overpass",
    cs_office: "Office",
    cs_italy: "Italy",
    de_cache: "Cache",
  };

  return {
    name: mapDisplayName[normalized] || normalized,
    imagePath: `/maps/${normalized}.png`,
  };
}
