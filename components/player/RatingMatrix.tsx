"use client";

import React from "react";
import { Trophy, Award, AlertCircle } from "lucide-react";

interface RatingMatrixProps {
  premier?: {
    rank?: number;
    rating?: number;
    winRate?: number;
  } | null;
  faceit?: {
    skillLevel?: number;
    elo?: number;
    matches?: number;
    winRate?: number;
    kd?: number;
  } | null;
}

export function RatingMatrix({ premier, faceit }: RatingMatrixProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
      {/* Premier CS Rating HUD */}
      <div className="relative p-5 bg-[#080d14]/90 border border-cyan-700/50 shadow-[0_0_20px_rgba(0,255,204,0.08)]">
        <span className="absolute -top-0.5 -left-0.5 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

        <div className="flex items-center justify-between pb-3 mb-4 border-b border-cyan-950 text-xs">
          <span className="flex items-center gap-2 text-cyan-400 font-bold tracking-wider uppercase">
            <Trophy className="w-4 h-4" /> CS2 Premier Rating
          </span>
          <span className="px-2 py-0.5 bg-cyan-950/60 border border-cyan-800/50 text-[10px] text-cyan-300">
            SEASON ACTIVE
          </span>
        </div>

        <div className="flex items-end justify-between my-2">
          <div>
            <div className="text-3xl sm:text-4xl font-black text-cyan-300 drop-shadow-[0_0_12px_rgba(0,255,204,0.4)]">
              {premier?.rating ? premier.rating.toLocaleString() : "UNRANKED"}
            </div>
            <div className="text-[11px] text-gray-500 uppercase mt-0.5">
              Calibrated World Standing
            </div>
          </div>

          <div className="text-right text-xs space-y-1 text-gray-400">
            <div>Global Ladder: <strong className="text-gray-200">{premier?.rank ? `#${premier.rank}` : "Calibrating"}</strong></div>
            <div>Win Rate: <strong className="text-emerald-400">{premier?.winRate ? `${premier.winRate}%` : "--"}</strong></div>
          </div>
        </div>
      </div>

      {/* FACEIT Elo HUD */}
      <div className="relative p-5 bg-[#080d14]/90 border border-amber-700/50 shadow-[0_0_20px_rgba(255,153,0,0.08)]">
        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 border-t-2 border-r-2 border-amber-400" />
        <span className="absolute -bottom-0.5 -left-0.5 w-3 h-3 border-b-2 border-l-2 border-amber-400" />

        <div className="flex items-center justify-between pb-3 mb-4 border-b border-amber-950 text-xs">
          <span className="flex items-center gap-2 text-amber-400 font-bold tracking-wider uppercase">
            <Award className="w-4 h-4" /> FACEIT Competitive Elo
          </span>
          {faceit ? (
            <span className="px-2 py-0.5 bg-amber-950/60 border border-amber-800/50 text-[10px] text-amber-300 font-bold">
              LEVEL {faceit.skillLevel || 1}
            </span>
          ) : (
            <span className="px-2 py-0.5 bg-red-950/40 border border-red-800/50 text-[10px] text-red-400">
              UNLINKED
            </span>
          )}
        </div>

        {faceit ? (
          <div className="flex items-end justify-between my-2">
            <div>
              <div className="text-3xl sm:text-4xl font-black text-amber-400 drop-shadow-[0_0_12px_rgba(255,153,0,0.4)]">
                {faceit.elo?.toLocaleString() || "---"} <span className="text-sm font-normal text-amber-500">ELO</span>
              </div>
              <div className="text-[11px] text-gray-500 uppercase mt-0.5">
                Competitive Division
              </div>
            </div>

            <div className="text-right text-xs space-y-1 text-gray-400">
              <div>K/D Ratio: <strong className="text-amber-300">{faceit.kd || "--"}</strong></div>
              <div>Matches Logged: <strong className="text-gray-200">{faceit.matches || "--"}</strong></div>
            </div>
          </div>
        ) : (
          <div className="py-3 flex items-center gap-3 text-xs text-gray-500">
            <AlertCircle className="w-5 h-5 text-amber-500/60 shrink-0" />
            <span>No linked FACEIT profile was detected for this Steam identifier.</span>
          </div>
        )}
      </div>
    </div>
  );
}
