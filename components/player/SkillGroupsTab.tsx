"use client";

import React, { useState } from "react";
import Image from "next/image";
import { getPremierTier, COMPETITIVE_RANKS, getOfficialFaceitBadge } from "@/lib/cs2-assets";

interface MapRankItem {
  mapId: string;
  name?: string;
  wins?: number;
  rankId?: number;
  bestRankId?: number;
}

interface PremierSeasonItem {
  season: string;
  year?: string;
  wins?: number;
  currentRating?: number;
  bestRating?: number;
}

interface SkillGroupsTabProps {
  data?: any;
}

function OfficialPremierRatingBanner({
  rating,
  size = "md",
}: {
  rating?: number | null;
  size?: "sm" | "md" | "lg";
}) {
  if (!rating || rating <= 0) {
    return (
      <div className="inline-flex items-center px-3 py-1 rounded bg-[#10141d] border border-white/[0.08] text-gray-500 font-bold tracking-widest text-[10px] uppercase">
        UNRANKED
      </div>
    );
  }

  const tier = getPremierTier(rating);
  const isLarge = size === "lg";
  const isSmall = size === "sm";

  return (
    <div
      className={`relative inline-flex items-center skew-x-[-12deg] rounded-sm overflow-hidden border shadow-lg transition-transform ${
        isLarge
          ? "px-3.5 py-1.5 min-w-[130px]"
          : isSmall
          ? "px-2 py-0.5 min-w-[80px]"
          : "px-3 py-1 min-w-[110px]"
      }`}
      style={{
        backgroundColor: `${tier.colorHex}20`,
        borderColor: `${tier.colorHex}70`,
        boxShadow: `0 0 16px ${tier.colorHex}25`,
      }}
    >
      <div className="flex items-center gap-1 mr-2 pl-0.5">
        <span
          className={`block ${isLarge ? "w-1.5 h-6" : isSmall ? "w-0.5 h-3.5" : "w-1 h-5"} rounded-xs`}
          style={{ backgroundColor: tier.colorHex }}
        />
        <span
          className={`block ${isLarge ? "w-1.5 h-6" : isSmall ? "w-0.5 h-3.5" : "w-1 h-5"} rounded-xs`}
          style={{ backgroundColor: tier.colorHex }}
        />
      </div>

      <span
        className={`skew-x-[12deg] font-black italic tracking-wide text-right flex-1 ${
          isLarge ? "text-lg" : isSmall ? "text-xs" : "text-sm"
        }`}
        style={{ color: tier.colorHex }}
      >
        {rating.toLocaleString()}
      </span>
    </div>
  );
}

export function SkillGroupsTab({ data }: SkillGroupsTabProps) {
  const [showAllSeasons, setShowAllSeasons] = useState(false);

  // Ingested Premier Telemetry
  const premier = data?.premier || {};
  const activeSeason = {
    season: premier.activeSeason?.name || "Premier Season",
    timeAgo: premier.activeSeason?.lastUpdated || "Live",
    wins: premier.activeSeason?.wins ?? null,
    currentRating: premier.activeSeason?.rating ?? null,
    bestRating: premier.activeSeason?.bestRating ?? null,
  };

  const historicSeasons: PremierSeasonItem[] = Array.isArray(premier.seasons)
    ? premier.seasons
    : [];

  // Ingested FACEIT Telemetry
  const faceit = data?.faceit || {};
  const faceitLvl = Number(faceit?.skillLevel || faceit?.skill_level || faceit?.level || 0);
  const faceitElo = Number(faceit?.elo || faceit?.faceitElo || 0);
  const hasFaceit = Boolean(faceitLvl > 0 || faceitElo > 0 || faceit?.nickname || faceit?.player_id);
  const faceitBadge = hasFaceit ? getOfficialFaceitBadge(faceitLvl || 1) : null;

  // Ingested Map Calibration Telemetry
  const incomingMapRanks: MapRankItem[] = Array.isArray(data?.mapRanks)
    ? data.mapRanks
    : [];

  const mapCatalog = [
    { mapId: "de_mirage", name: "Mirage" },
    { mapId: "de_inferno", name: "Inferno" },
    { mapId: "de_dust2", name: "Dust II" },
    { mapId: "de_nuke", name: "Nuke" },
    { mapId: "de_anubis", name: "Anubis" },
    { mapId: "de_ancient", name: "Ancient" },
    { mapId: "de_vertigo", name: "Vertigo" },
    { mapId: "de_train", name: "Train" },
    { mapId: "de_overpass", name: "Overpass" },
    { mapId: "cs_office", name: "Office" },
    { mapId: "cs_italy", name: "Italy" },
    { mapId: "de_cache", name: "Cache" },
  ];

  const mapRows = mapCatalog.map((catalogItem) => {
    const found = incomingMapRanks.find(
      (m) =>
        m.mapId?.toLowerCase() === catalogItem.mapId.toLowerCase() ||
        m.name?.toLowerCase() === catalogItem.name.toLowerCase()
    );
    return {
      mapId: catalogItem.mapId,
      name: catalogItem.name,
      wins: found?.wins ?? null,
      rankId: found?.rankId ?? null,
      bestRankId: found?.bestRankId ?? null,
    };
  });

  const totalCompWins = mapRows.reduce((acc, curr) => acc + (curr.wins || 0), 0);

  // Ingested Wingman & Legacy CS:GO
  const wingman = data?.wingman || {};
  const csgo = data?.csgo || {};

  const getRankBadgePath = (rankId: number | null | undefined) => {
    if (!rankId || rankId <= 0) return null;
    const meta = COMPETITIVE_RANKS.find((r) => r.id === rankId);
    return meta ? meta.badgePath : null;
  };

  return (
    <div className="w-full max-w-[1550px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 font-mono select-none">
      
      {/* ======================================================== */}
      {/* LEFT COLUMN: PREMIER RATINGS & FACEIT TELEMETRY         */}
      {/* ======================================================== */}
      <div className="lg:col-span-5 space-y-4">
        
        {/* Premier Active & Seasons Card */}
        <div className="rounded-xl bg-[#090b10] border border-white/[0.08] p-5 space-y-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <span className="font-black text-white tracking-widest uppercase text-sm">
                PREMIER
              </span>
              <span className="text-xs text-gray-400">{activeSeason.season}</span>
              <span className="text-gray-600">•</span>
              <span className="text-[11px] text-cyan-400/80">{activeSeason.timeAgo}</span>
            </div>
            {historicSeasons.length > 0 && (
              <button
                onClick={() => setShowAllSeasons(!showAllSeasons)}
                className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 uppercase tracking-wider transition-colors"
              >
                {showAllSeasons ? "LESS" : "MORE"}
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 items-center">
            <div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                WINS
              </div>
              <div className="text-3xl font-black text-white mt-1">
                {activeSeason.wins !== null ? activeSeason.wins : "0"}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                CURRENT
              </div>
              <OfficialPremierRatingBanner rating={activeSeason.currentRating} size="md" />
            </div>

            <div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                BEST
              </div>
              <OfficialPremierRatingBanner rating={activeSeason.bestRating} size="md" />
            </div>
          </div>

          {showAllSeasons && (
            <div className="pt-3 border-t border-white/[0.06] space-y-2">
              <div className="grid grid-cols-12 text-[10px] uppercase font-bold text-gray-500 tracking-wider px-1">
                <div className="col-span-4">SEASON</div>
                <div className="col-span-2 text-center">WINS</div>
                <div className="col-span-3 text-center">CURRENT</div>
                <div className="col-span-3 text-center">BEST</div>
              </div>

              {historicSeasons.length === 0 ? (
                <div className="text-center py-3 text-xs text-gray-600">
                  No historical seasons on record.
                </div>
              ) : (
                historicSeasons.map((s, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 items-center py-1.5 px-1 rounded hover:bg-white/[0.02]"
                  >
                    <div className="col-span-4 text-xs font-bold text-gray-300">
                      {s.season}{" "}
                      {s.year && (
                        <span className="text-[10px] text-gray-500">{s.year}</span>
                      )}
                    </div>
                    <div className="col-span-2 text-center text-xs font-mono text-gray-400">
                      {s.wins ?? "—"}
                    </div>
                    <div className="col-span-3 text-center">
                      <OfficialPremierRatingBanner rating={s.currentRating} size="sm" />
                    </div>
                    <div className="col-span-3 text-center">
                      <OfficialPremierRatingBanner rating={s.bestRating} size="sm" />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* FACEIT Integration Card */}
        <div className="rounded-xl bg-[#090b10] border border-white/[0.08] p-5 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-black/60 border border-white/[0.08] flex items-center justify-center shrink-0 p-1">
              {hasFaceit && faceitBadge ? (
                <img
                  src={faceitBadge.badgePath}
                  alt={`FACEIT Level ${faceitLvl}`}
                  className="w-9 h-9 object-contain drop-shadow-[0_2px_10px_rgba(255,85,0,0.35)]"
                />
              ) : (
                <div className="w-9 h-9 rounded-full border border-white/[0.1] bg-white/[0.02] flex items-center justify-center text-[10px] font-bold text-gray-600">
                  —
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase text-gray-400">
                <svg viewBox="0 0 24 24" fill="#FF5500" className="w-3.5 h-3.5">
                  <path d="M23.999 2.001c-.027-.378-.291-.7-.674-.823-.384-.123-.807-.024-1.091.254L.373 22.31c-.347.34-.407.876-.145 1.282.261.406.748.591 1.22.463L23.473 18.1c.334-.092.585-.357.653-.695.068-.337-.048-.686-.303-.912l-8.629-7.657L23.8 2.593c.139-.164.208-.378.199-.592z" />
                </svg>
                <span>FACEIT</span>
                {hasFaceit && faceitLvl > 0 && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-black text-[#FF5500] bg-[#FF5500]/15 border border-[#FF5500]/30">
                    LVL {faceitLvl}
                  </span>
                )}
              </div>

              <div className="text-lg font-black tracking-tight text-white mt-0.5 font-mono">
                {faceitElo > 0 ? (
                  <span>
                    {faceitElo.toLocaleString()}{" "}
                    <span className="text-[11px] font-bold text-[#FF5500]">ELO</span>
                  </span>
                ) : (
                  <span className="text-xs font-bold text-gray-500 uppercase">UNLINKED</span>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
              STATUS
            </span>
            <span className="text-xs font-bold font-mono text-emerald-400">
              {hasFaceit ? "VERIFIED" : "STANDBY"}
            </span>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* RIGHT COLUMN: COMPETITIVE MAPS, WINGMAN & CS:GO          */}
      {/* ======================================================== */}
      <div className="lg:col-span-7 space-y-4">
        
        {/* Competitive Per-Map Calibration */}
        <div className="rounded-xl bg-[#090b10] border border-white/[0.08] p-5 space-y-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-black text-white tracking-widest uppercase">
                COMPETITIVE
              </span>
              <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/40 text-[10px] font-mono text-cyan-300 font-bold">
                {totalCompWins} WINS
              </span>
            </div>

            <div className="flex items-center gap-6 text-[10px] uppercase font-bold text-gray-500 tracking-wider pr-2">
              <span className="w-14 text-center">CURRENT</span>
              <span className="w-14 text-center">BEST</span>
            </div>
          </div>

          <div className="divide-y divide-white/[0.04]">
            {mapRows.map((m, idx) => {
              const curBadge = getRankBadgePath(m.rankId);
              const bestBadge = getRankBadgePath(m.bestRankId);

              return (
                <div
                  key={idx}
                  className="py-2 px-1.5 flex items-center justify-between hover:bg-white/[0.02] rounded transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-[140px]">
                    <div className="relative w-6 h-6 rounded overflow-hidden shrink-0 border border-white/[0.08] bg-black/40">
                      <Image
                        src={`/maps/${m.mapId}.png`}
                        alt={m.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-200">
                      {m.name}
                    </span>
                  </div>

                  <div className="text-center font-mono text-xs text-gray-400 w-16">
                    {m.wins !== null ? m.wins : "—"}
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="relative w-14 h-6 flex items-center justify-center">
                      {curBadge ? (
                        <Image
                          src={curBadge}
                          alt="Current Rank"
                          fill
                          className="object-contain drop-shadow"
                          unoptimized
                        />
                      ) : (
                        <span className="text-[10px] text-gray-600 font-bold">
                          —
                        </span>
                      )}
                    </div>

                    <div className="relative w-14 h-6 flex items-center justify-center">
                      {bestBadge ? (
                        <Image
                          src={bestBadge}
                          alt="Best Rank"
                          fill
                          className="object-contain drop-shadow"
                          unoptimized
                        />
                      ) : (
                        <span className="text-[10px] text-gray-600 font-bold">
                          —
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wingman & CS:GO Footer Card */}
        <div className="rounded-xl bg-[#090b10] border border-white/[0.08] p-4 space-y-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between py-1.5 px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white tracking-widest uppercase">
                WINGMAN
              </span>
            </div>
            <div className="text-xs font-mono text-gray-300 font-bold">
              {wingman.wins !== undefined && wingman.wins !== null ? `${wingman.wins} WINS` : "0 WINS"}
            </div>
            <div className="flex items-center gap-6">
              <div className="w-14 text-center">
                {getRankBadgePath(wingman.rankId) ? (
    <div className="flex items-center justify-center w-16 h-7">
      <img
        src={getRankBadgePath(wingman.rankId)!}
        alt="Wingman Current"
        className="h-6 w-auto object-contain drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]"
      />
    </div>
  ) : (
                  <span className="text-[10px] text-gray-500 font-bold bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
                    EXPIRED
                  </span>
                )}
              </div>
              <div className="w-14 text-center">
                {getRankBadgePath(wingman.bestRankId) ? (
    <div className="flex items-center justify-center w-16 h-7">
      <img
        src={getRankBadgePath(wingman.bestRankId)!}
        alt="Wingman Best"
        className="h-6 w-auto object-contain drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]"
      />
    </div>
  ) : (
                  <span className="text-[10px] text-gray-600 font-bold">—</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.04] px-1">
            <span className="text-xs font-black text-gray-400 tracking-widest uppercase">
              CS:GO
            </span>
            <div className="text-xs font-mono text-gray-400">
              {csgo.wins !== undefined && csgo.wins !== null ? `${csgo.wins} WINS` : "—"}
            </div>
            <div className="flex items-center gap-6">
              <div className="w-14 text-center text-[10px] text-gray-600 font-bold">
                —
              </div>
              <div className="w-14 text-center text-[10px] text-gray-600 font-bold">
                {getRankBadgePath(csgo.bestRankId) ? (
                  <div className="relative w-14 h-6 mx-auto">
                    <Image
                      src={getRankBadgePath(csgo.bestRankId)!}
                      alt="CSGO Best"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                ) : (
                  "—"
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
