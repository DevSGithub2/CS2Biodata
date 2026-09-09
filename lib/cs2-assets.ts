// Official Valve CS2 & FACEIT Asset Pipeline

export interface MapMeta {
  name: string;
  code: string;
  icon: string;
  gradient: string;
}

export const OFFICIAL_MAPS: Record<string, MapMeta> = {
  mirage: {
    name: "Mirage",
    code: "de_mirage",
    icon: "https://icons.veryicon.com/png/o/miscellaneous/game-interface-1/map-18.png",
    gradient: "from-amber-950 via-amber-900 to-stone-900",
  },
  inferno: {
    name: "Inferno",
    code: "de_inferno",
    icon: "https://icons.veryicon.com/png/o/miscellaneous/game-interface-1/map-18.png",
    gradient: "from-red-950 via-orange-950 to-stone-900",
  },
  dust2: {
    name: "Dust II",
    code: "de_dust2",
    icon: "https://icons.veryicon.com/png/o/miscellaneous/game-interface-1/map-18.png",
    gradient: "from-yellow-950 via-amber-950 to-stone-900",
  },
  nuke: {
    name: "Nuke",
    code: "de_nuke",
    icon: "https://icons.veryicon.com/png/o/miscellaneous/game-interface-1/map-18.png",
    gradient: "from-sky-950 via-blue-950 to-stone-900",
  },
  ancient: {
    name: "Ancient",
    code: "de_ancient",
    icon: "https://icons.veryicon.com/png/o/miscellaneous/game-interface-1/map-18.png",
    gradient: "from-emerald-950 via-teal-950 to-stone-900",
  },
  anubis: {
    name: "Anubis",
    code: "de_anubis",
    icon: "https://icons.veryicon.com/png/o/miscellaneous/game-interface-1/map-18.png",
    gradient: "from-yellow-900 via-stone-900 to-black",
  },
  vertigo: {
    name: "Vertigo",
    code: "de_vertigo",
    icon: "https://icons.veryicon.com/png/o/miscellaneous/game-interface-1/map-18.png",
    gradient: "from-blue-950 via-slate-900 to-black",
  },
  overpass: {
    name: "Overpass",
    code: "de_overpass",
    icon: "https://icons.veryicon.com/png/o/miscellaneous/game-interface-1/map-18.png",
    gradient: "from-green-950 via-stone-900 to-black",
  },
  train: {
    name: "Train",
    code: "de_train",
    icon: "https://icons.veryicon.com/png/o/miscellaneous/game-interface-1/map-18.png",
    gradient: "from-slate-900 via-zinc-900 to-black",
  },
  cache: {
    name: "Cache",
    code: "de_cache",
    icon: "https://icons.veryicon.com/png/o/miscellaneous/game-interface-1/map-18.png",
    gradient: "from-cyan-950 via-slate-900 to-black",
  },
};

export function getOfficialMapAsset(rawName: string): MapMeta {
  const norm = (rawName || "").toLowerCase().trim().replace(/^de_/, "").replace(/\s+/g, "").replace(/ii$/, "2");

  if (norm.includes("dust")) return OFFICIAL_MAPS.dust2;
  if (norm.includes("mirage")) return OFFICIAL_MAPS.mirage;
  if (norm.includes("inferno")) return OFFICIAL_MAPS.inferno;
  if (norm.includes("nuke")) return OFFICIAL_MAPS.nuke;
  if (norm.includes("ancient")) return OFFICIAL_MAPS.ancient;
  if (norm.includes("anubis")) return OFFICIAL_MAPS.anubis;
  if (norm.includes("vertigo")) return OFFICIAL_MAPS.vertigo;
  if (norm.includes("overpass")) return OFFICIAL_MAPS.overpass;
  if (norm.includes("train")) return OFFICIAL_MAPS.train;
  if (norm.includes("cache")) return OFFICIAL_MAPS.cache;

  return {
    name: rawName || "Competitive Map",
    code: "de_map",
    icon: "https://icons.veryicon.com/png/o/miscellaneous/game-interface-1/map-18.png",
    gradient: "from-slate-900 to-black",
  };
}

export function getOfficialFaceitBadge(level: number | string) {
  const lvl = Number(level) || 8;
  return { bg: "#FF5500", text: "#000000", label: String(lvl) };
}

export const OFFICIAL_SKILL_GROUPS: Record<number, { name: string; icon: string }> = {
  0: { name: "Unranked", icon: "" },
};
