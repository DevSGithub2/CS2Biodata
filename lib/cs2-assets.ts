export interface FaceitLevelMeta {
  level: number | "Challenger";
  minElo: number;
  maxElo: number;
  color: string;
  percent: number;
  label: string;
  badgePath: string;
}

export const FACEIT_LEVELS: FaceitLevelMeta[] = [
  { level: 1, minElo: 100, maxElo: 500, color: "#9e9e9e", percent: 10, label: "1", badgePath: "/assets/ranks/faceit/level-1.svg" },
  { level: 2, minElo: 501, maxElo: 750, color: "#1ce400", percent: 20, label: "2", badgePath: "/assets/ranks/faceit/level-2.svg" },
  { level: 3, minElo: 751, maxElo: 900, color: "#1ce400", percent: 30, label: "3", badgePath: "/assets/ranks/faceit/level-3.svg" },
  { level: 4, minElo: 901, maxElo: 1050, color: "#ffc700", percent: 40, label: "4", badgePath: "/assets/ranks/faceit/level-4.svg" },
  { level: 5, minElo: 1051, maxElo: 1200, color: "#ffc700", percent: 50, label: "5", badgePath: "/assets/ranks/faceit/level-5.svg" },
  { level: 6, minElo: 1201, maxElo: 1350, color: "#ffc700", percent: 60, label: "6", badgePath: "/assets/ranks/faceit/level-6.svg" },
  { level: 7, minElo: 1351, maxElo: 1530, color: "#ffc700", percent: 70, label: "7", badgePath: "/assets/ranks/faceit/level-7.svg" },
  { level: 8, minElo: 1531, maxElo: 1750, color: "#ff5500", percent: 80, label: "8", badgePath: "/assets/ranks/faceit/level-8.svg" },
  { level: 9, minElo: 1751, maxElo: 2000, color: "#ff5500", percent: 90, label: "9", badgePath: "/assets/ranks/faceit/level-9.svg" },
  { level: 10, minElo: 2001, maxElo: Infinity, color: "#fe1f00", percent: 100, label: "10", badgePath: "/assets/ranks/faceit/level-10.svg" },
  { level: "Challenger", minElo: 2001, maxElo: Infinity, color: "#fe1f00", percent: 100, label: "C", badgePath: "/assets/ranks/faceit/challenger.svg" }
];

export function getOfficialFaceitBadge(levelOrElo: number | string): FaceitLevelMeta {
  const num = Number(levelOrElo) || 8;
  if (num > 100) {
    for (let i = FACEIT_LEVELS.length - 2; i >= 0; i--) {
      if (num >= FACEIT_LEVELS[i].minElo) {
        return FACEIT_LEVELS[i];
      }
    }
    return FACEIT_LEVELS[0];
  }
  const match = FACEIT_LEVELS.find((l) => l.level === num);
  return match || FACEIT_LEVELS[7];
}

export interface PremierTierMeta {
  tierId: string;
  minRating: number;
  maxRating: number;
  label: string;
  colorHex: string;
  bgGradient: string;
  borderColor: string;
  badgePath: string;
  color?: string;
  bg?: string;
  border?: string;
  badge?: string;
}

export const PREMIER_TIERS: PremierTierMeta[] = [
  { tierId: "sub5k", minRating: 0, maxRating: 4999, label: "Below 5,000", colorHex: "#b0b0b0", bgGradient: "from-[#41474d] to-[#26292d]", borderColor: "#8a939d", badgePath: "/assets/ranks/premier/sub5k.svg" },
  { tierId: "tier1", minRating: 5000, maxRating: 9999, label: "5,000 - 9,999", colorHex: "#85c2ff", bgGradient: "from-[#274a69] to-[#14283b]", borderColor: "#4b8bc4", badgePath: "/assets/ranks/premier/tier1.svg" },
  { tierId: "tier2", minRating: 10000, maxRating: 14999, label: "10,000 - 14,999", colorHex: "#4887e0", bgGradient: "from-[#1b3c73] to-[#0f1f40]", borderColor: "#2d5da1", badgePath: "/assets/ranks/premier/tier2.svg" },
  { tierId: "tier3", minRating: 15000, maxRating: 19999, label: "15,000 - 19,999", colorHex: "#b366e6", bgGradient: "from-[#4c236e] to-[#270f3b]", borderColor: "#7a389f", badgePath: "/assets/ranks/premier/tier3.svg" },
  { tierId: "tier4", minRating: 20000, maxRating: 24999, label: "20,000 - 24,999", colorHex: "#eb34c2", bgGradient: "from-[#6b1458] to-[#38092d]", borderColor: "#ac158b", badgePath: "/assets/ranks/premier/tier4.svg" },
  { tierId: "tier5", minRating: 25000, maxRating: 29999, label: "25,000 - 29,999", colorHex: "#f04349", bgGradient: "from-[#73181c] to-[#3b0c0e]", borderColor: "#b72025", badgePath: "/assets/ranks/premier/tier5.svg" },
  { tierId: "tier6", minRating: 30000, maxRating: Infinity, label: "30,000+", colorHex: "#ffdb38", bgGradient: "from-[#806613] to-[#423408]", borderColor: "#cca01d", badgePath: "/assets/ranks/premier/tier6.svg" }
];

export function getPremierTier(rating: number | string): PremierTierMeta {
  const num = Number(rating);
  if (isNaN(num)) {
    return {
      tierId: "unranked",
      minRating: 0,
      maxRating: 0,
      label: "UNRANKED",
      colorHex: "#6c757d",
      bgGradient: "from-[#1e2229] to-[#12151b]",
      borderColor: "#3a414e",
      badgePath: "/assets/ranks/premier/unranked.svg",
      color: "#6c757d",
      bg: "from-[#1e2229] to-[#12151b]",
      border: "#3a414e",
      badge: "/assets/ranks/premier/unranked.svg",
    };
  }
  for (let i = PREMIER_TIERS.length - 1; i >= 0; i--) {
    if (num >= PREMIER_TIERS[i].minRating) {
      const t = PREMIER_TIERS[i];
      return {
        ...t,
        color: t.colorHex,
        bg: t.bgGradient,
        border: t.borderColor,
        badge: t.badgePath,
      };
    }
  }
  const t0 = PREMIER_TIERS[0];
  return {
    ...t0,
    color: t0.colorHex,
    bg: t0.bgGradient,
    border: t0.borderColor,
    badge: t0.badgePath,
  };
}

export interface CompetitiveRankMeta {
  id: number;
  name: string;
  shortName: string;
  category: "Silver" | "Gold Nova" | "Master Guardian" | "Elite";
  badgePath: string;
}

export const COMPETITIVE_RANKS: CompetitiveRankMeta[] = [
  { id: 1, name: "Silver I", shortName: "S1", category: "Silver", badgePath: "/assets/ranks/competitive/skillgroup1.svg" },
  { id: 2, name: "Silver II", shortName: "S2", category: "Silver", badgePath: "/assets/ranks/competitive/skillgroup2.svg" },
  { id: 3, name: "Silver III", shortName: "S3", category: "Silver", badgePath: "/assets/ranks/competitive/skillgroup3.svg" },
  { id: 4, name: "Silver IV", shortName: "S4", category: "Silver", badgePath: "/assets/ranks/competitive/skillgroup4.svg" },
  { id: 5, name: "Silver Elite", shortName: "SE", category: "Silver", badgePath: "/assets/ranks/competitive/skillgroup5.svg" },
  { id: 6, name: "Silver Elite Master", shortName: "SEM", category: "Silver", badgePath: "/assets/ranks/competitive/skillgroup6.svg" },
  { id: 7, name: "Gold Nova I", shortName: "GN1", category: "Gold Nova", badgePath: "/assets/ranks/competitive/skillgroup7.svg" },
  { id: 8, name: "Gold Nova II", shortName: "GN2", category: "Gold Nova", badgePath: "/assets/ranks/competitive/skillgroup8.svg" },
  { id: 9, name: "Gold Nova III", shortName: "GN3", category: "Gold Nova", badgePath: "/assets/ranks/competitive/skillgroup9.svg" },
  { id: 10, name: "Gold Nova Master", shortName: "GNM", category: "Gold Nova", badgePath: "/assets/ranks/competitive/skillgroup10.svg" },
  { id: 11, name: "Master Guardian I", shortName: "MG1", category: "Master Guardian", badgePath: "/assets/ranks/competitive/skillgroup11.svg" },
  { id: 12, name: "Master Guardian II", shortName: "MG2", category: "Master Guardian", badgePath: "/assets/ranks/competitive/skillgroup12.svg" },
  { id: 13, name: "Master Guardian Elite", shortName: "MGE", category: "Master Guardian", badgePath: "/assets/ranks/competitive/skillgroup13.svg" },
  { id: 14, name: "Distinguished Master Guardian", shortName: "DMG", category: "Master Guardian", badgePath: "/assets/ranks/competitive/skillgroup14.svg"},
  { id: 15, name: "Legendary Eagle", shortName: "LE", category: "Elite", badgePath: "/assets/ranks/competitive/skillgroup15.svg" },
  { id: 16, name: "Legendary Eagle Master", shortName: "LEM", category: "Elite", badgePath: "/assets/ranks/competitive/skillgroup16.svg" },
  { id: 17, name: "Supreme Master First Class", shortName: "SMFC", category: "Elite", badgePath: "/assets/ranks/competitive/skillgroup17.svg" },
  { id: 18, name: "The Global Elite", shortName: "GE", category: "Elite", badgePath: "/assets/ranks/competitive/skillgroup18.svg" }
];

export const OFFICIAL_SKILL_GROUPS = COMPETITIVE_RANKS;

export interface MapMeta {
  name: string;
  code: string;
  imagePath: string;
}

export const OFFICIAL_MAPS: Record<string, MapMeta> = {
  mirage: { name: "Mirage", code: "de_mirage", imagePath: "/maps/de_mirage.svg" },
  inferno: { name: "Inferno", code: "de_inferno", imagePath: "/maps/de_inferno.png" },
  dust2: { name: "Dust II", code: "de_dust2", imagePath: "/maps/de_dust2.svg" },
  nuke: { name: "Nuke", code: "de_nuke", imagePath: "/maps/de_nuke.svg" },
  anubis: { name: "Anubis", code: "de_anubis", imagePath: "/maps/de_anubis.svg" },
  ancient: { name: "Ancient", code: "de_ancient", imagePath: "/maps/de_ancient.svg" },
  vertigo: { name: "Vertigo", code: "de_vertigo", imagePath: "/maps/de_vertigo.svg" },
  overpass: { name: "Overpass", code: "de_overpass", imagePath: "/maps/de_overpass.png" },
  train: { name: "Train", code: "de_train", imagePath: "/maps/de_train.png" },
  office: { name: "Office", code: "cs_office", imagePath: "/maps/cs_office.svg" },
  italy: { name: "Italy", code: "cs_italy", imagePath: "/maps/cs_italy.svg" }
};

export function getOfficialMapAsset(rawName: string): MapMeta {
  const norm = (rawName || "").toLowerCase().trim().replace(/^de_|^cs_/, "").replace(/\s+/g, "").replace(/ii$/, "2");
  return OFFICIAL_MAPS[norm] || OFFICIAL_MAPS.mirage;
}

export function getMapThumbnail(mapName: string): string {
  const clean = (mapName || "")
    .toLowerCase()
    .trim()
    .replace(/^de_|^cs_/, "")
    .replace(/\s+/g, "")
    .replace(/ii$/, "2");

  const mapFiles: Record<string, string> = {
    mirage: "/maps/de_mirage.svg",
    dust2: "/maps/de_dust2.svg",
    inferno: "/maps/de_inferno.png",
    vertigo: "/maps/de_vertigo.svg",
    nuke: "/maps/de_nuke.svg",
    anubis: "/maps/de_anubis.svg",
    ancient: "/maps/de_ancient.svg",
    cache: "/maps/de_cache.png",
    overpass: "/maps/de_overpass.png",
    train: "/maps/de_train.png",
    office: "/maps/cs_office.svg",
    italy: "/maps/cs_italy.svg",
  };

  return mapFiles[clean] || "/maps/de_mirage.svg";
}
