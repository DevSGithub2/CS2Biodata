export interface SteamLevelStyle {
  border: string;
  text: string;
  glow: string;
}

export function getSteamLevelStyle(level: number): SteamLevelStyle {
  const lvl = Math.floor(Math.max(0, level) / 10) * 10;

  switch (lvl) {
    case 0:
      return {
        border: "border-zinc-500/40",
        text: "text-zinc-300",
        glow: "0 0 10px rgba(161,161,170,0.25)",
      };
    case 10:
      return {
        border: "border-red-500/50",
        text: "text-red-400",
        glow: "0 0 12px rgba(239,68,68,0.35)",
      };
    case 20:
      return {
        border: "border-amber-500/50",
        text: "text-amber-400",
        glow: "0 0 12px rgba(245,158,11,0.35)",
      };
    case 30:
      return {
        border: "border-yellow-500/50",
        text: "text-yellow-400",
        glow: "0 0 12px rgba(234,179,8,0.35)",
      };
    case 40:
      return {
        border: "border-emerald-500/50",
        text: "text-emerald-400",
        glow: "0 0 12px rgba(16,185,129,0.35)",
      };
    case 50:
      return {
        border: "border-cyan-500/50",
        text: "text-cyan-400",
        glow: "0 0 12px rgba(6,182,212,0.35)",
      };
    case 60:
      return {
        border: "border-blue-500/50",
        text: "text-blue-400",
        glow: "0 0 12px rgba(59,130,246,0.35)",
      };
    case 70:
      return {
        border: "border-purple-500/50",
        text: "text-purple-400",
        glow: "0 0 12px rgba(168,85,247,0.35)",
      };
    case 80:
      return {
        border: "border-pink-500/50",
        text: "text-pink-400",
        glow: "0 0 12px rgba(236,72,153,0.35)",
      };
    case 90:
      return {
        border: "border-orange-500/50",
        text: "text-orange-400",
        glow: "0 0 12px rgba(249,115,22,0.35)",
      };
    default:
      return {
        border: "border-fuchsia-500/60",
        text: "text-fuchsia-400",
        glow: "0 0 15px rgba(217,70,239,0.45)",
      };
  }
}

// Alias to ensure both naming conventions resolve
export const getSteamLevelTier = getSteamLevelStyle;
