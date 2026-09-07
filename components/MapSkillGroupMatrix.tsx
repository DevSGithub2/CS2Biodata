"use client";

import React from "react";
import { Shield, Sparkles, Award } from "lucide-react";

interface MapRank {
  mapName?: string;
  rankId?: number;
  rankName?: string;
  wins?: number;
}

interface MapSkillGroupMatrixProps {
  mapRanks?: MapRank[] | null;
  wingmanRank?: {
    rankId?: number;
    rankName?: string;
    wins?: number;
  } | null;
  csgoLegacyRank?: {
    rankId?: number;
    rankName?: string;
    wins?: number;
  } | null;
}

const OFFICIAL_MAPS = [
  { id: "mirage", name: "Mirage", pool: "Active Duty", icon: "https://raw.githubusercontent.com/MurkyYT/cs2-map-icons/main/images/de_mirage.png" },
  { id: "inferno", name: "Inferno", pool: "Active Duty", icon: "https://raw.githubusercontent.com/MurkyYT/cs2-map-icons/main/images/de_inferno.png" },
  { id: "nuke", name: "Nuke", pool: "Active Duty", icon: "https://raw.githubusercontent.com/MurkyYT/cs2-map-icons/main/images/de_nuke.png" },
  { id: "dust2", name: "Dust II", pool: "Active Duty", icon: "https://raw.githubusercontent.com/MurkyYT/cs2-map-icons/main/images/de_dust2.png" },
  { id: "ancient", name: "Ancient", pool: "Active Duty", icon: "https://raw.githubusercontent.com/MurkyYT/cs2-map-icons/main/images/de_ancient.png" },
  { id: "anubis", name: "Anubis", pool: "Active Duty", icon: "https://raw.githubusercontent.com/MurkyYT/cs2-map-icons/main/images/de_anubis.png" },
  { id: "vertigo", name: "Vertigo", pool: "Active Duty", icon: "https://raw.githubusercontent.com/MurkyYT/cs2-map-icons/main/images/de_vertigo.png" },
  { id: "train", name: "Train", pool: "Active Duty", icon: "https://raw.githubusercontent.com/MurkyYT/cs2-map-icons/main/images/de_train.png" },
  { id: "overpass", name: "Overpass", pool: "Competitive Pool", icon: "https://raw.githubusercontent.com/MurkyYT/cs2-map-icons/main/images/de_overpass.png" },
  { id: "cache", name: "Cache", pool: "Competitive Pool", icon: "https://raw.githubusercontent.com/MurkyYT/cs2-map-icons/main/images/de_cache.png" },
  { id: "office", name: "Office", pool: "Reserves (Hostage)", icon: "https://raw.githubusercontent.com/MurkyYT/cs2-map-icons/main/images/cs_office.png" },
  { id: "italy", name: "Italy", pool: "Reserves (Hostage)", icon: "https://raw.githubusercontent.com/MurkyYT/cs2-map-icons/main/images/cs_italy.png" },
];

export function MapSkillGroupMatrix({ mapRanks, wingmanRank, csgoLegacyRank }: MapSkillGroupMatrixProps) {
  const safeMapRanks = Array.isArray(mapRanks) ? mapRanks : [];

  const getRankBadge = (rankId?: number) => {
    if (!rankId || rankId <= 0) return null;
    return `/ranks/skillgroup${rankId}.svg`;
  };

  const getRankName = (rankId?: number) => {
    if (!rankId || rankId <= 0) return "Unranked";
    const names: Record<number, string> = {
      1: "Silver I", 2: "Silver II", 3: "Silver III", 4: "Silver IV", 5: "Silver Elite", 6: "Silver Elite Master",
      7: "Gold Nova I", 8: "Gold Nova II", 9: "Gold Nova III", 10: "Gold Nova Master",
      11: "Master Guardian I", 12: "Master Guardian II", 13: "Master Guardian Elite", 14: "Distinguished Master Guardian",
      15: "Legendary Eagle", 16: "Legendary Eagle Master", 17: "Supreme Master First Class", 18: "The Global Elite"
    };
    return names[rankId] || "Unranked";
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#080d1a]/90 border border-slate-800/90 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Shield className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                Competitive Per-Map Skill Groups
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  12 Official Maps
                </span>
              </h2>
              <p className="text-xs text-slate-400">Independent competitive skill groups and win calibration.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {OFFICIAL_MAPS.map((map) => {
            const data = safeMapRanks.find(
              (r) => typeof r?.mapName === "string" && r.mapName.toLowerCase().includes(map.id)
            );
            const rankId = data?.rankId || 0;
            const wins = data?.wins || 0;
            const rankBadge = getRankBadge(rankId);
            const rankName = getRankName(rankId);

            return (
              <div
                key={map.id}
                className="bg-[#050811] border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-4 flex items-center justify-between gap-3 transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 flex items-center justify-center shrink-0">
                    <img
                      src={map.icon}
                      alt={map.name}
                      className="w-11 h-11 object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/maps/de_mirage.svg";
                      }}
                    />
                  </div>
                  <div>
                    <div className="font-black text-sm text-white">{map.name}</div>
                    <div className="text-[11px] text-slate-400">{map.pool}</div>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end">
                  {rankBadge ? (
                    <img src={rankBadge} alt={rankName} className="h-6 object-contain mb-1" />
                  ) : (
                    <span className="text-[11px] font-black uppercase text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/40">
                      Unranked
                    </span>
                  )}
                  <span className="text-xs font-mono font-bold text-slate-300 mt-1">{wins} Wins</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#080d1a]/90 border border-slate-800/90 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-wider">Wingman 2v2 Rating</h2>
                <p className="text-xs text-slate-400">Wingman competitive skill group</p>
              </div>
            </div>
          </div>

          <div className="bg-[#050811] border border-slate-800/80 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {wingmanRank && (wingmanRank.rankId ?? 0) > 0 && getRankBadge(wingmanRank.rankId) ? (
                <img src={getRankBadge(wingmanRank.rankId)!} alt="Wingman Rank" className="h-8 object-contain" />
              ) : (
                <span className="text-xs font-black uppercase text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700/40">
                  Unranked
                </span>
              )}
              <div>
                <div className="font-black text-sm text-white">{getRankName(wingmanRank?.rankId)}</div>
                <div className="text-xs text-slate-400">2v2 Competitive Queue</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-mono font-black text-purple-400">{wingmanRank?.wins || 0} Wins</div>
              <div className="text-[10px] uppercase font-bold text-slate-500">Total Wins</div>
            </div>
          </div>
        </div>

        <div className="bg-[#080d1a]/90 border border-slate-800/90 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Award className="w-4 h-4 text-black" />
              </div>
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-wider">CS:GO Legacy Rank</h2>
                <p className="text-xs text-slate-400">Archived global competitive rating</p>
              </div>
            </div>
          </div>

          <div className="bg-[#050811] border border-slate-800/80 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {csgoLegacyRank && (csgoLegacyRank.rankId ?? 0) > 0 && getRankBadge(csgoLegacyRank.rankId) ? (
                <img src={getRankBadge(csgoLegacyRank.rankId)!} alt="Legacy Rank" className="h-8 object-contain" />
              ) : (
                <span className="text-xs font-black uppercase text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700/40">
                  Unranked
                </span>
              )}
              <div>
                <div className="font-black text-sm text-white">{getRankName(csgoLegacyRank?.rankId)}</div>
                <div className="text-xs text-slate-400">5v5 Global Matchmaking</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-mono font-black text-amber-400">{csgoLegacyRank?.wins || 0} Wins</div>
              <div className="text-[10px] uppercase font-bold text-slate-500">Archived Wins</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


export default MapSkillGroupMatrix;
