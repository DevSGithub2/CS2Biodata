"use client";

import React, { useState } from "react";
import { getOfficialFaceitBadge, getPremierTier } from "@/lib/cs2-assets";
import { ExternalLink, Calendar, Database, X, Copy, Check } from "lucide-react";

// Official CS2 Premier Medal Logo (Vector)
function CS2PremierIcon({ className = "w-4 h-4", color = "#ffdb38" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill={color}
        fillOpacity="0.25"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11" r="3" stroke={color} strokeWidth="1.5" />
      <path d="M12 8V14M9 11H15" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

// Official FACEIT Chevron Logo (Vector)
function FaceitLogoIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="#FF5500" className={className}>
      <path d="M23.999 2.001c-.027-.378-.291-.7-.674-.823-.384-.123-.807-.024-1.091.254L.373 22.31c-.347.34-.407.876-.145 1.282.261.406.748.591 1.22.463L23.473 18.1c.334-.092.585-.357.653-.695.068-.337-.048-.686-.303-.912l-8.629-7.657L23.8 2.593c.139-.164.208-.378.199-.592z" />
    </svg>
  );
}

// Official Valve VAC Tactical Security Shield Logo (Vector)
function ValveVacShieldIcon({ className = "w-5 h-5", isClean = true }: { className?: string; isClean?: boolean }) {
  const strokeColor = isClean ? "#10B981" : "#F43F5E";
  const fillColor = isClean ? "rgba(16, 185, 129, 0.15)" : "rgba(244, 63, 94, 0.2)";
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 22S20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {isClean ? (
        <path
          d="M9 12L11 14L15 9.5"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M9 9L15 15M15 9L9 15"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

export function DossierHero({ data }: { data: any }) {
  const [showDrawer, setShowDrawer] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const steam = data?.steam || {};
  const bans = steam?.bans || data?.bans || {};
  const faceit = data?.faceit;
  const premier = data?.premier;

  const personaName = steam?.personaName || "Unknown Operative";
  const steamId64 = steam?.steamId64 || data?.steamId64 || "";
  const avatar = steam?.avatar || "";
  const country = steam?.country && steam?.country !== "GLOBAL" ? steam.country.toLowerCase() : null;
  const profileUrl = steam?.profileUrl || (steamId64 ? `https://steamcommunity.com/profiles/${steamId64}` : "#");

  const createdDate = steam?.timeCreated
    ? new Date(steam.timeCreated * 1000).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : null;

  // SteamID Calculations
  let steamID = "N/A";
  let steamID3 = "N/A";
  let steamID3NoBrackets = "N/A";

  try {
    if (steamId64 && /^\d+$/.test(steamId64)) {
      const bId = BigInt(steamId64);
      const vBase = 76561197960265728n;
      if (bId > vBase) {
        const idNum = bId - vBase;
        const y = idNum % 2n;
        const z = idNum / 2n;
        steamID = `STEAM_0:${y}:${z}`;
        steamID3 = `[U:1:${idNum}]`;
        steamID3NoBrackets = `U:1:${idNum}`;
      }
    }
  } catch {}

  const rawProfileUrl = steam?.profileUrl || (steamId64 ? `https://steamcommunity.com/profiles/${steamId64}/` : "");
  let customURL = "";
  if (rawProfileUrl.includes("/id/")) {
    customURL = rawProfileUrl.split("/id/")[1]?.replace(/\/$/, "") || "";
  } else if (steam?.personaName) {
    customURL = encodeURIComponent(steam.personaName.toLowerCase().replace(/\s+/g, ""));
  }

  const fullUrl = steamId64 ? `https://steamcommunity.com/profiles/${steamId64}` : "N/A";
  const fullUrlWithCustom = customURL ? `https://steamcommunity.com/id/${customURL}` : "None Configured";
  const steamIoUrl = steamId64 ? `https://steamid.io/lookup/${steamId64}` : "https://steamid.io";

  // Comprehensive VAC ban detection across API schema variations
  const isVacBanned = Boolean(
    bans?.vacBanned ||
    bans?.VACBanned ||
    (typeof bans?.numberOfVacBans === "number" && bans.numberOfVacBans > 0) ||
    (typeof bans?.NumberOfVACBans === "number" && bans.NumberOfVACBans > 0)
  );

  const numVacBans = bans?.numberOfVacBans ?? bans?.NumberOfVACBans ?? (isVacBanned ? 1 : 0);
  const daysSinceLastBan = bans?.daysSinceLastBan ?? bans?.DaysSinceLastBan ?? 0;
  const isCommunityBanned = Boolean(bans?.communityBanned || bans?.CommunityBanned);
  const economyBan = bans?.economyBan || bans?.EconomyBan || "none";
  const isPublic = steam?.isPublic ?? true;

  const rows = [
    { key: "steamID", label: "a steamID", value: steamID, isLink: false },
    { key: "steamID3", label: "a steamID3", value: steamID3, isLink: false },
    { key: "steamID3NoBrackets", label: "a steamID3 without brackets", value: steamID3NoBrackets, isLink: false },
    { key: "steamID64", label: "a steamID64", value: steamId64 || "N/A", isLink: false },
    { key: "customURL", label: "a customURL", value: customURL || "none", isLink: false },
    { key: "fullUrl", label: "a full URL", value: fullUrl, isLink: true, href: fullUrl },
    { key: "fullUrlWithCustom", label: "a full URL with customURL", value: fullUrlWithCustom, isLink: !!customURL, href: fullUrlWithCustom },
    { key: "steamIoLink", label: "a steamID.io lookup", value: steamIoUrl, isLink: true, href: steamIoUrl },
  ];

  const handleCopy = (key: string, value: string) => {
    if (!value || value === "N/A" || value === "None Configured") return;
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // Premier State
  const isPremierRanked = typeof premier?.rating === "number" && premier.rating > 0;
  const premierTier = getPremierTier(premier?.rating);

  // FACEIT State Check: verify if player actually exists on FACEIT
  const hasFaceit = Boolean(
    faceit &&
    (faceit.skillLevel || faceit.elo || faceit.nickname || faceit.player_id || faceit.id)
  );
  const faceitBadge = hasFaceit ? getOfficialFaceitBadge(faceit?.skillLevel || faceit?.elo || 1) : null;

  return (
    <>
      <div className="relative rounded-lg bg-[#070b12]/95 border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-md p-5 sm:p-6 font-mono">
        <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-cyan-400/40 rounded-tl" />
        <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-cyan-400/40 rounded-tr" />
        <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-cyan-400/40 rounded-bl" />
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-cyan-400/40 rounded-br" />

        <div className="flex flex-col lg:flex-row items-center lg:items-center justify-between gap-6">
          
          {/* Left: Avatar + Unified Action Layout */}
          <div className="flex items-center gap-4 text-left w-full lg:w-auto">
            <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-lg border border-white/[0.14] overflow-hidden bg-black/50 flex items-center justify-center shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.5)] ring-1 ring-cyan-500/10">
              {avatar ? (
                <img src={avatar} alt={personaName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-500 font-bold text-2xl">?</span>
              )}
            </div>

            <div className="flex flex-col justify-center gap-2 min-w-0">
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate max-w-[260px] leading-none">
                  {personaName}
                </h1>

                {country && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/[0.04] border border-white/[0.08] rounded shrink-0">
                    <img
                      src={`https://flagcdn.com/20x15/${country}.png`}
                      alt={country.toUpperCase()}
                      className="w-3.5 h-2.5 object-cover rounded-[1px]"
                    />
                    <span className="text-[10px] text-gray-300 font-bold uppercase leading-none">
                      {country.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDrawer(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-500/[0.08] hover:bg-cyan-500/[0.16] border border-cyan-500/40 hover:border-cyan-400 text-[11px] text-cyan-300 hover:text-white font-semibold transition-all active:scale-95 leading-none"
                >
                  <Database className="w-3 h-3 text-cyan-400" />
                  <span>Steam.io Data</span>
                </button>

                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.1] hover:border-white/20 text-[11px] text-gray-300 hover:text-white font-medium transition-all active:scale-95 leading-none"
                >
                  <span>Steam Profile</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </a>
              </div>

              {createdDate && (
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 leading-none pl-0.5">
                  <Calendar className="w-3 h-3 text-gray-500" />
                  <span>Service Since {createdDate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Badge Matrix */}
          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 w-full lg:w-auto">
            
            {/* 1. CS2 Premier Medal */}
            <div
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg border transition-all min-w-[170px]"
              style={{
                borderColor: `${premierTier.borderColor}40`,
                backgroundColor: isPremierRanked ? `${premierTier.colorHex}0c` : "rgba(255, 255, 255, 0.02)",
              }}
            >
              <div className="w-10 h-10 rounded-lg bg-black/60 border border-white/[0.08] flex items-center justify-center shrink-0 p-1">
                <img
                  src={premierTier.badgePath}
                  alt={premierTier.label}
                  className="h-full w-full object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
                />
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-[9px] uppercase font-bold text-gray-400 tracking-wider">
                  <CS2PremierIcon className="w-3 h-3" color={premierTier.colorHex} />
                  <span>PREMIER</span>
                  {isPremierRanked && (
                    <span
                      className="text-[8px] px-1 py-0.5 rounded font-black uppercase"
                      style={{ color: premierTier.colorHex, backgroundColor: `${premierTier.colorHex}20` }}
                    >
                      {premierTier.label}
                    </span>
                  )}
                </div>
                <div
                  className="text-base font-black tracking-tight font-mono leading-tight mt-0.5"
                  style={{ color: premierTier.colorHex }}
                >
                  {isPremierRanked ? premier.rating.toLocaleString() : "UNRANKED"}
                </div>
              </div>
            </div>

            {/* 2. FACEIT Official Badge */}
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-[#FF5500]/30 bg-[#FF5500]/[0.04] transition-all min-w-[170px]">
              <div className="w-10 h-10 rounded-lg bg-black/60 border border-white/[0.08] flex items-center justify-center shrink-0 p-1">
                {hasFaceit && faceitBadge ? (
                  <img
                    src={faceitBadge.badgePath}
                    alt={`FACEIT Level ${faceitBadge.label}`}
                    className="h-full w-full object-contain drop-shadow-[0_2px_8px_rgba(255,85,0,0.3)]"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center rounded bg-[#FF5500]/10 border border-[#FF5500]/20">
                    <FaceitLogoIcon className="w-6 h-6" />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-[9px] uppercase font-bold text-gray-400 tracking-wider">
                  <FaceitLogoIcon className="w-3 h-3" />
                  <span>FACEIT PRO</span>
                </div>
                <div className="text-base font-black text-white tracking-tight font-mono leading-tight mt-0.5">
                  {hasFaceit && faceit?.elo ? (
                    <>
                      {faceit.elo.toLocaleString()}{" "}
                      <span className="text-[10px] font-bold text-[#FF5500]">ELO</span>
                    </>
                  ) : hasFaceit && faceit?.skillLevel ? (
                    <span className="text-xs text-orange-300 font-bold">Level {faceit.skillLevel}</span>
                  ) : (
                    <span className="text-[11px] text-gray-400 font-semibold tracking-wide">ID NOT FOUND</span>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Valve VAC Security Shield Badge */}
            <div
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border min-w-[170px] transition-all ${
                !isVacBanned
                  ? "border-emerald-500/30 bg-emerald-500/[0.03]"
                  : "border-rose-500/70 bg-rose-950/50 shadow-[0_0_20px_rgba(244,63,94,0.35)]"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg bg-black/60 border flex items-center justify-center shrink-0 p-1 ${
                  !isVacBanned ? "border-white/[0.08]" : "border-rose-500/40"
                }`}
              >
                <ValveVacShieldIcon className="w-5 h-5" isClean={!isVacBanned} />
              </div>

              <div>
                <div className={`text-[9px] uppercase font-bold tracking-wider ${!isVacBanned ? "text-gray-400" : "text-rose-300/80"}`}>
                  VALVE VAC
                </div>
                <div
                  className={`text-xs font-black uppercase tracking-wider leading-tight mt-0.5 ${
                    !isVacBanned ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {!isVacBanned ? "CLEAN STANDING" : `${numVacBans > 1 ? `${numVacBans} VAC BANS` : "VAC BANNED"}`}
                </div>
                {isVacBanned && (
                  <div className="text-[8px] text-rose-300/90 font-mono mt-0.5">
                    {daysSinceLastBan > 0 ? `${daysSinceLastBan}d since ban` : "INFRACTION RECORDED"}
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Slide-over Modal for Steam.io Data */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-3xl bg-[#070c14] border border-cyan-500/30 rounded-lg shadow-[0_12px_40px_rgba(0,0,0,0.8)] font-mono text-xs overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.08] bg-white/[0.02]">
              <div className="flex items-center gap-2 text-cyan-300 font-bold tracking-wider text-xs uppercase">
                <Database className="w-4 h-4 text-cyan-400" />
                <span>Steam.io Telemetry &amp; Registry Audit</span>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={steamIoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-cyan-300 transition-colors"
                >
                  <span>Open on SteamID.io</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  onClick={() => setShowDrawer(false)}
                  className="p-1 rounded hover:bg-white/[0.08] text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className={`p-2.5 rounded border ${isVacBanned ? "bg-rose-950/30 border-rose-500/40" : "bg-white/[0.02] border-white/[0.06]"}`}>
                  <div className="text-[10px] text-gray-500 uppercase font-semibold">VAC Ban</div>
                  <div className={`text-xs font-bold mt-0.5 ${isVacBanned ? "text-rose-400" : "text-emerald-400"}`}>
                    {isVacBanned ? `${numVacBans} Ban(s)` : "Clean"}
                  </div>
                </div>

                <div className={`p-2.5 rounded border ${isCommunityBanned ? "bg-rose-950/30 border-rose-500/40" : "bg-white/[0.02] border-white/[0.06]"}`}>
                  <div className="text-[10px] text-gray-500 uppercase font-semibold">Community</div>
                  <div className={`text-xs font-bold mt-0.5 ${isCommunityBanned ? "text-rose-400" : "text-emerald-400"}`}>
                    {isCommunityBanned ? "Restricted" : "Clean"}
                  </div>
                </div>

                <div className="p-2.5 rounded bg-white/[0.02] border border-white/[0.06]">
                  <div className="text-[10px] text-gray-500 uppercase font-semibold">Trade Ban</div>
                  <div className={`text-xs font-bold mt-0.5 uppercase ${economyBan !== "none" ? "text-rose-400" : "text-gray-300"}`}>
                    {economyBan}
                  </div>
                </div>

                <div className="p-2.5 rounded bg-white/[0.02] border border-white/[0.06]">
                  <div className="text-[10px] text-gray-500 uppercase font-semibold">Visibility</div>
                  <div className={`text-xs font-bold mt-0.5 ${isPublic ? "text-emerald-400" : "text-amber-400"}`}>
                    {isPublic ? "Public" : "Private"}
                  </div>
                </div>
              </div>

              <div className="rounded border border-white/[0.08] bg-black/40 overflow-hidden">
                <div className="divide-y divide-white/[0.04]">
                  {rows.map((row) => (
                    <div
                      key={row.key}
                      className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-2 hover:bg-white/[0.02] transition-colors gap-2"
                    >
                      <span className="w-48 shrink-0 text-gray-500 text-[11px]">
                        {row.label}
                      </span>

                      <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
                        {row.isLink && row.href ? (
                          <a
                            href={row.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-cyan-400 hover:text-cyan-300 underline underline-offset-2 truncate select-all flex items-center gap-1"
                          >
                            <span>{row.value}</span>
                            <ExternalLink className="w-3 h-3 opacity-60 shrink-0" />
                          </a>
                        ) : (
                          <span className="text-xs text-gray-300 truncate select-all font-mono">
                            {row.value}
                          </span>
                        )}

                        <button
                          onClick={() => handleCopy(row.key, row.value)}
                          className={`p-1 px-2 rounded border transition-all text-[10px] font-medium shrink-0 ${
                            copiedKey === row.key
                              ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                              : "bg-white/[0.03] hover:bg-white/[0.08] border-white/[0.08] text-gray-400 hover:text-white"
                          }`}
                        >
                          {copiedKey === row.key ? (
                            <span className="flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-400" /> Copied
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Copy className="w-3 h-3" /> Copy
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
