import React from "react";

interface FaceitSkillBadgeProps {
  level: number | string | null | undefined;
  size?: number; // size in pixels (default 24)
  className?: string;
}

const LEVEL_COLORS: Record<number, { stroke: string; glow: string }> = {
  1: { stroke: "#EEEEEE", glow: "rgba(238, 238, 238, 0.4)" },
  2: { stroke: "#1CE400", glow: "rgba(28, 228, 0, 0.4)" },
  3: { stroke: "#1CE400", glow: "rgba(28, 228, 0, 0.4)" },
  4: { stroke: "#FFC700", glow: "rgba(255, 199, 0, 0.4)" },
  5: { stroke: "#FFC700", glow: "rgba(255, 199, 0, 0.4)" },
  6: { stroke: "#FFC700", glow: "rgba(255, 199, 0, 0.4)" },
  7: { stroke: "#FFC700", glow: "rgba(255, 199, 0, 0.4)" },
  8: { stroke: "#FF5500", glow: "rgba(255, 85, 0, 0.45)" },
  9: { stroke: "#FF5500", glow: "rgba(255, 85, 0, 0.45)" },
  10: { stroke: "#FE1F00", glow: "rgba(254, 31, 0, 0.5)" },
};

export function FaceitSkillBadge({ level, size = 24, className = "" }: FaceitSkillBadgeProps) {
  const lvl = Math.max(1, Math.min(10, Number(level) || 1));
  const { stroke, glow } = LEVEL_COLORS[lvl] || LEVEL_COLORS[1];

  const strokeWidth = 3;
  const radius = 16;
  const center = 20;
  // Circumference: 2 * PI * 16 ≈ 100.53
  const circumference = 2 * Math.PI * radius;
  // Official arc fills ~72% of the circumference
  const strokeDasharray = `${circumference * 0.72} ${circumference * 0.28}`;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      title={`FACEIT Level ${lvl}`}
    >
      <svg
        viewBox="0 0 40 40"
        className="w-full h-full -rotate-90"
      >
        {/* Dark inner disc background */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="#17191d"
          stroke="#272a30"
          strokeWidth="2"
        />

        {/* Unfilled arc trace track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#26292f"
          strokeWidth={strokeWidth}
        />

        {/* Official Level Arc Ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          style={{ filter: `drop-shadow(0 0 2px ${glow})` }}
        />
      </svg>

      {/* Centered Level Numeral */}
      <span
        className="absolute inset-0 flex items-center justify-center font-black select-none pointer-events-none"
        style={{
          color: stroke,
          fontSize: `${size * (lvl === 10 ? 0.38 : 0.44)}px`,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          lineHeight: 1,
          letterSpacing: lvl === 10 ? "-0.05em" : "0",
          textShadow: `0 0 4px ${glow}`
        }}
      >
        {lvl}
      </span>
    </div>
  );
}
