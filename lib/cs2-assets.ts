export interface SkillGroupMeta {
  id: number;
  name: string;
  badgePath: string;
}

export const COMPETITIVE_RANKS: SkillGroupMeta[] = [
  { id: 1, name: "Silver I", badgePath: "/ranks/skillgroup1.svg" },
  { id: 2, name: "Silver II", badgePath: "/ranks/skillgroup2.svg" },
  { id: 3, name: "Silver III", badgePath: "/ranks/skillgroup3.svg" },
  { id: 4, name: "Silver IV", badgePath: "/ranks/skillgroup4.svg" },
  { id: 5, name: "Silver Elite", badgePath: "/ranks/skillgroup5.svg" },
  { id: 6, name: "Silver Elite Master", badgePath: "/ranks/skillgroup6.svg" },
  { id: 7, name: "Gold Nova I", badgePath: "/ranks/skillgroup7.svg" },
  { id: 8, name: "Gold Nova II", badgePath: "/ranks/skillgroup8.svg" },
  { id: 9, name: "Gold Nova III", badgePath: "/ranks/skillgroup9.svg" },
  { id: 10, name: "Gold Nova Master", badgePath: "/ranks/skillgroup10.svg" },
  { id: 11, name: "Master Guardian I", badgePath: "/ranks/skillgroup11.svg" },
  { id: 12, name: "Master Guardian II", badgePath: "/ranks/skillgroup12.svg" },
  { id: 13, name: "Master Guardian Elite", badgePath: "/ranks/skillgroup13.svg" },
  { id: 14, name: "Distinguished Master Guardian", badgePath: "/ranks/skillgroup14.svg" },
  { id: 15, name: "Legendary Eagle", badgePath: "/ranks/skillgroup15.svg" },
  { id: 16, name: "Legendary Eagle Master", badgePath: "/ranks/skillgroup16.svg" },
  { id: 17, name: "Supreme Master First Class", badgePath: "/ranks/skillgroup17.svg" },
  { id: 18, name: "The Global Elite", badgePath: "/ranks/skillgroup18.svg" },
];

export const OFFICIAL_SKILL_GROUPS = COMPETITIVE_RANKS;

export function getRankBadgePath(rankId: number | null | undefined): string | null {
  const id = Number(rankId);
  if (!id || id < 1 || id > 18) return null;
  return `/ranks/skillgroup${id}.svg`;
}

export function getPremierTier(rating: number | null | undefined) {
  const r = Number(rating || 0);
  if (r >= 30000) return { name: "Gold", hex: "#f0d046", colorHex: "#f0d046", bg: "rgba(240,208,70,0.12)", border: "rgba(240,208,70,0.4)", badgePath: "/ranks/premier/medal.svg" };
  if (r >= 25000) return { name: "Red", hex: "#eb4b4b", colorHex: "#eb4b4b", bg: "rgba(235,75,75,0.12)", border: "rgba(235,75,75,0.4)", badgePath: "/ranks/premier/medal.svg" };
  if (r >= 20000) return { name: "Pink", hex: "#d32ce6", colorHex: "#d32ce6", bg: "rgba(211,44,230,0.12)", border: "rgba(211,44,230,0.4)", badgePath: "/ranks/premier/medal.svg" };
  if (r >= 15000) return { name: "Purple", hex: "#8847ff", colorHex: "#8847ff", bg: "rgba(136,71,255,0.12)", border: "rgba(136,71,255,0.4)", badgePath: "/ranks/premier/medal.svg" };
  if (r >= 10000) return { name: "Blue", hex: "#4b69ff", colorHex: "#4b69ff", bg: "rgba(75,105,255,0.12)", border: "rgba(75,105,255,0.4)", badgePath: "/ranks/premier/medal.svg" };
  if (r >= 5000) return { name: "Light Blue", hex: "#5e98d9", colorHex: "#5e98d9", bg: "rgba(94,152,217,0.12)", border: "rgba(94,152,217,0.4)", badgePath: "/ranks/premier/medal.svg" };
  return { name: "Grey", hex: "#b0c3d9", colorHex: "#b0c3d9", bg: "rgba(176,195,217,0.12)", border: "rgba(176,195,217,0.4)", badgePath: "/ranks/premier/medal.svg" };
}

export function getOfficialFaceitBadge(level: number | string | null | undefined) {
  const lvl = Math.max(1, Math.min(10, Number(level) || 1));
  return {
    level: lvl,
    name: `Level ${lvl}`,
    badgePath: `/faceit/faceit${lvl}.svg`
  };
}

export function getOfficialMapAsset(mapId: string | null | undefined) {
  if (!mapId) return { name: "Unknown", iconPath: "/maps/unknown.png", bannerPath: "/maps/unknown.png" };
  const clean = mapId.toLowerCase().replace("de_", "").replace("cs_", "");
  return {
    name: clean.toUpperCase(),
    iconPath: `/assets/maps/${clean}.svg`,
    bannerPath: `/maps/${clean}.png`,
  };
}

export function getMapThumbnail(mapName?: string | null): string {
  if (!mapName) return "/assets/maps/dust2.png";
  
  const m = mapName.toLowerCase()
    .replace(/^de_/, "")
    .replace(/^cs_/, "")
    .replace(/\s+/g, "")
    .trim();

  return `/assets/maps/${m}.png`;
}
