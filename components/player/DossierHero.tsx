"use client";

import React, { useState } from "react";
import { ExternalLink, Calendar, Database, X, Copy, Check } from "lucide-react";

// Official CS2 Premier Medal Logo (Vector)
function CS2PremierIcon({ className = "w-5 h-5", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill={color}
        fillOpacity="0.2"
        stroke={color}
        strokeWidth="1.5"
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
  const fillColor = isClean ? "rgba(16, 185, 129, 0.15)" : "rgba(244, 63, 94, 0.15)";
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

// Premier CS2 Official Rating Tiers
function getPremierTier(rating?: number) {
  if (!rating || rating === 0) {
    return {
      label: "UNRANKED",
      color: "text-gray-400",
      hex: "#9CA3AF",
      border: "border-white/[0.08]",
      bg: "bg-white/[0.02]",
      badge: "bg-white/[0.06] text-gray-400",
    };
  }
  if (rating < 5000) return { label: "COMMON", color: "text-gray-300", hex: "#D1D5DB", border: "border-gray-500/40", bg: "bg-gray-500/[0.05]", badge: "bg-gray-600/30 text-gray-300" };
  if (rating < 10000) return { label: "CHALLENGER", color: "text-sky-300", hex: "#7DD3FC", border: "border-sky-500/30", bg: "bg-sky-500/[0.05]", badge: "bg-sky-500/20 text-sky-300" };
  if (rating < 15000) return { label: "GUARDIAN", color: "text-blue-300", hex: "#93C5FD", border: "border-blue-500/30", bg: "bg-blue-500/[0.05]", badge: "bg-blue-500/20 text-blue-300" };
  if (rating < 20000) return { label: "MASTER", color: "text-purple-300", hex: "#D8B4FE", border: "border-purple-500/30", bg: "bg-purple-500/[0.05]", badge: "bg-purple-500/20 text-purple-300" };
  if (rating < 25000) return { label: "ELITE", color: "text-pink-300", hex: "#F472B6", border: "border-pink-500/30", bg: "bg-pink-500/[0.05]", badge: "bg-pink-500/20 text-pink-300" };
  if (rating < 30000) return { label: "LEGENDARY", color: "text-rose-400", hex: "#FB7185", border: "border-rose-500/30", bg: "bg-rose-500/[0.05]", badge: "bg-rose-500/20 text-rose-300" };
  return { label: "WORLD CLASS", color: "text-amber-300", hex: "#FCD34D", border: "border-amber-400/40", bg: "bg-amber-500/[0.08]", badge: "bg-amber-400/20 text-amber-300" };
}

// Official FACEIT Level Badge Color Matrix
function getFaceitBadge(level?: number) {
  if (!level) return { bg: "bg-white/[0.06]", text: "text-gray-400", border: "border-white/[0.08]" };
  if (level <= 3) return { bg: "bg-[#4B6B18]", text: "text-white", border: "border-[#628A20]" };
  if (level <= 7) return { bg: "bg-[#BF7A0A]", text: "text-white", border: "border-[#D98E11]" };
  if (level <= 9) return { bg: "bg-[#B84507]", text: "text-white", border: "border-[#D6540D]" };
  return { bg: "bg-[#A61818]", text: "text-white", border: "border-[#D42222] shadow-[0_0_10px_rgba(212,34,34,0.4)]" };
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

  // BigInt Computations for Steam formats
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
  } catch {
    // fallback
  }

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

  const isVacBanned = Boolean(bans?.vacBanned || bans?.numberOfVacBans > 0);
  const numVacBans = bans?.numberOfVacBans ?? 0;
  const daysSinceLastBan = bans?.daysSinceLastBan ?? 0;
  const isCommunityBanned = Boolean(bans?.communityBanned);
  const economyBan = bans?.economyBan || "none";
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

  const premierTier = getPremierTier(premier?.rating);
  const faceitStyle = getFaceitBadge(faceit?.skillLevel);

  return (
    <>
      <div className="relative rounded-lg bg-[#070b12]/95 border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-md p-5 sm:p-6 font-mono">
        {/* Subtle Corner Brackets */}
        <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-cyan-400/40 rounded-tl" />
        <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-cyan-400/40 rounded-tr" />
        <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-cyan-400/40 rounded-bl" />
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-cyan-400/40 rounded-br" />

        <div className="flex flex-col lg:flex-row items-center lg:items-center justify-between gap-6">
          
          {/* 1. Left: Refined Avatar + Unified Action Layout */}
          <div className="flex items-center gap-4 text-left w-full lg:w-auto">
            {/* Avatar Frame with Beveled Corners */}
            <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-lg border border-white/[0.14] overflow-hidden bg-black/50 flex items-center justify-center shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.5)] ring-1 ring-cyan-500/10">
              {avatar ? (
                <img src={avatar} alt={personaName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-500 font-bold text-2xl">?</span>
              )}
            </div>

            {/* Name + Side-by-Side Action Strip + Date */}
            <div className="flex flex-col justify-center gap-2 min-w-0">
              {/* Row 1: Name + Flag */}
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

              {/* Row 2: Unified Action Strip (Side-by-Side) */}
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

              {/* Row 3: Account Creation Footnote */}
              {createdDate && (
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 leading-none pl-0.5">
                  <Calendar className="w-3 h-3 text-gray-500" />
                  <span>Service Since {createdDate}</span>
                </div>
              )}
            </div>
          </div>

          {/* 2. Right: Official Badge Matrix with Vector Icons */}
          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 w-full lg:w-auto">
            
            {/* Premier Official CS2 Medal Badge */}
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border ${premierTier.border} ${premierTier.bg} transition-all min-w-[155px]`}>
              <div className="w-9 h-9 rounded-md bg-black/50 border border-white/[0.08] flex items-center justify-center shrink-0">
                <CS2PremierIcon className="w-5 h-5" color={premierTier.hex} />
              </div>

              <div>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">PREMIER</span>
                  <span className={`text-[8px] px-1 py-0.2 rounded font-black uppercase ${premierTier.badge}`}>
                    {premierTier.label}
                  </span>
                </div>
                <div className={`text-base font-black ${premierTier.color} leading-snug tracking-tight`}>
                  {premier?.rating ? premier.rating.toLocaleString() : "UNRANKED"}
                </div>
              </div>
            </div>

            {/* FACEIT Official Brand & Level Badge */}
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-[#FF5500]/25 bg-[#FF5500]/[0.03] min-w-[155px]">
              {/* FACEIT Level Box */}
              <div className={`w-9 h-9 rounded-md border flex flex-col items-center justify-center shrink-0 ${faceitStyle.bg} ${faceitStyle.border}`}>
                <span className={`text-[7px] font-black leading-none ${faceitStyle.text}`}>LVL</span>
                <span className={`text-sm font-black leading-none mt-0.5 ${faceitStyle.text}`}>
                  {faceit?.skillLevel || "—"}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-[9px] uppercase font-bold text-gray-400 tracking-wider">
                  <FaceitLogoIcon className="w-2.5 h-2.5" />
                  <span>FACEIT PRO</span>
                </div>
                <div className="text-base font-black text-white leading-snug tracking-tight">
                  {faceit?.elo ? (
                    <>
                      {faceit.elo.toLocaleString()}{" "}
                      <span className="text-[10px] font-semibold text-[#FF5500]">ELO</span>
                    </>
                  ) : (
                    <span className="text-xs text-gray-500 font-semibold">Unlinked</span>
                  )}
                </div>
              </div>
            </div>

            {/* Valve VAC Security Shield Badge */}
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border min-w-[165px] ${
              !isVacBanned
                ? "border-emerald-500/30 bg-emerald-500/[0.03]"
                : "border-rose-500/60 bg-rose-950/40 shadow-[0_0_15px_rgba(244,63,94,0.25)]"
            }`}>
              <div className="w-9 h-9 rounded-md bg-black/50 border border-white/[0.08] flex items-center justify-center shrink-0">
                <ValveVacShieldIcon className="w-5 h-5" isClean={!isVacBanned} />
              </div>

              <div>
                <div className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">
                  VALVE VAC
                </div>
                <div className={`text-xs font-black uppercase tracking-wider leading-snug ${
                  !isVacBanned ? "text-emerald-400" : "text-rose-400 font-bold"
                }`}>
                  {!isVacBanned ? "CLEAN STANDING" : `${numVacBans} BANNED`}
                </div>
                {isVacBanned && daysSinceLastBan > 0 && (
                  <div className="text-[8px] text-rose-400/80 font-mono">
                    {daysSinceLastBan}d ago
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
            {/* Header */}
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

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-2.5 rounded bg-white/[0.02] border border-white/[0.06]">
                  <div className="text-[10px] text-gray-500 uppercase font-semibold">VAC Ban</div>
                  <div className={`text-xs font-bold mt-0.5 ${isVacBanned ? "text-rose-400" : "text-emerald-400"}`}>
                    {isVacBanned ? `${numVacBans} Bans` : "Clean"}
                  </div>
                </div>

                <div className="p-2.5 rounded bg-white/[0.02] border border-white/[0.06]">
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

              {/* Formats Table */}
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
