export interface SteamLevelStyle {
  color: string;
  borderColor: string;
  textColor: string;
  glow: string;
}

export function getSteamLevelStyle(level: number = 0): SteamLevelStyle {
  const tier = Math.floor((Math.max(0, level) % 100) / 10);

  const palette: Record<number, { color: string; glow: string }> = {
    0: { color: "#9b9b9b", glow: "rgba(155, 155, 155, 0.4)" }, // 0-9   Grey
    1: { color: "#c02942", glow: "rgba(192, 41, 66, 0.45)" },  // 10-19 Red
    2: { color: "#d95b26", glow: "rgba(217, 91, 38, 0.45)" },  // 20-29 Orange
    3: { color: "#e4af12", glow: "rgba(228, 175, 18, 0.45)" }, // 30-39 Yellow
    4: { color: "#438244", glow: "rgba(67, 130, 68, 0.45)" },  // 40-49 Green
    5: { color: "#3a80e8", glow: "rgba(58, 128, 232, 0.5)" },  // 50-59 Blue
    6: { color: "#8a43b6", glow: "rgba(138, 67, 182, 0.5)" },  // 60-69 Purple
    7: { color: "#d846b4", glow: "rgba(216, 70, 180, 0.5)" },  // 70-79 Pink
    8: { color: "#702737", glow: "rgba(112, 39, 55, 0.5)" },   // 80-89 Dark Crimson
    9: { color: "#8b5e34", glow: "rgba(139, 94, 52, 0.45)" },  // 90-99 Bronze
  };

  const current = palette[tier] || palette[0];

  return {
    color: current.color,
    borderColor: current.color,
    textColor: current.color,
    glow: `0 0 12px ${current.glow}`,
  };
}
