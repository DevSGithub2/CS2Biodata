"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Database, Copy, Check, ExternalLink, ShieldCheck, ShieldAlert, Lock, UserCheck, Calendar } from "lucide-react";

export function SteamIoDrawer({ data }: { data: any }) {
  const [expanded, setExpanded] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const steam = data?.steam || {};
  const bans = steam?.bans || data?.bans || {};
  const steamId64 = steam?.steamId64 || data?.steamId64 || "";

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

  const isVacBanned = bans?.vacBanned ?? false;
  const vacCount = bans?.numberOfVacBans ?? 0;
  const isCommunityBanned = bans?.communityBanned ?? false;
  const economyBan = bans?.economyBan || "none";
  const isPublic = steam?.isPublic ?? true;
  const createdDate = steam?.timeCreated
    ? new Date(steam.timeCreated * 1000).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "Classified";

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

  return (
    <div className="w-full bg-[#05080e]/90 border-b border-white/[0.06] font-mono text-xs relative z-10 transition-colors">
      <div className="max-w-[1700px] mx-auto px-6 sm:px-12">
        {/* Drawer Header Toggle */}
        <div className="py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 text-gray-400 hover:text-cyan-300 transition-colors group"
            >
              <Database className="w-3.5 h-3.5 text-cyan-400/80 group-hover:text-cyan-300" />
              <span className="font-semibold text-xs tracking-wider uppercase text-gray-300 group-hover:text-white">
                Steam.io Telemetry Registry
              </span>
              {expanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-gray-500 group-hover:text-cyan-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-gray-500 group-hover:text-cyan-400" />
              )}
            </button>

            <span className="text-gray-700 hidden sm:inline">|</span>
            <span className="text-gray-500 text-[11px] hidden sm:inline">
              SteamID64: <strong className="text-gray-400 select-all font-medium">{steamId64}</strong>
            </span>
          </div>

          <a
            href={steamIoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] text-gray-400 hover:text-cyan-300 hover:bg-cyan-500/[0.08] transition-all"
          >
            <span>SteamID.io</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        </div>

        {/* Expanded Metadata Content */}
        {expanded && (
          <div className="pb-5 pt-3 border-t border-white/[0.06] space-y-4 animate-fadeIn">
            {/* Status Pills */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              <div className="p-2.5 rounded bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-semibold">VAC Status</div>
                  <div className={`text-xs font-bold mt-0.5 ${isVacBanned ? "text-rose-400" : "text-emerald-400"}`}>
                    {isVacBanned ? `${vacCount} Violation(s)` : "In Good Standing"}
                  </div>
                </div>
                {isVacBanned ? <ShieldAlert className="w-4 h-4 text-rose-400" /> : <ShieldCheck className="w-4 h-4 text-emerald-400/80" />}
              </div>

              <div className="p-2.5 rounded bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-semibold">Community Ban</div>
                  <div className={`text-xs font-bold mt-0.5 ${isCommunityBanned ? "text-rose-400" : "text-emerald-400"}`}>
                    {isCommunityBanned ? "Restricted" : "Clean"}
                  </div>
                </div>
                <UserCheck className="w-4 h-4 text-cyan-400/80" />
              </div>

              <div className="p-2.5 rounded bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-semibold">Economy Ban</div>
                  <div className={`text-xs font-bold mt-0.5 uppercase ${economyBan !== "none" ? "text-rose-400" : "text-gray-300"}`}>
                    {economyBan}
                  </div>
                </div>
                <Lock className="w-4 h-4 text-cyan-400/80" />
              </div>

              <div className="p-2.5 rounded bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-semibold">Visibility & Created</div>
                  <div className={`text-xs font-bold mt-0.5 ${isPublic ? "text-emerald-400" : "text-amber-400"}`}>
                    {isPublic ? "Public" : "Private"} • {createdDate}
                  </div>
                </div>
                <Calendar className="w-4 h-4 text-cyan-400/80" />
              </div>
            </div>

            {/* Standard Formats Table */}
            <div className="rounded border border-white/[0.06] bg-[#03060a] overflow-hidden">
              <div className="divide-y divide-white/[0.04]">
                {rows.map((row) => (
                  <div
                    key={row.key}
                    className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-2 hover:bg-white/[0.02] transition-colors gap-2"
                  >
                    <span className="w-48 shrink-0 text-gray-500 text-[11px] font-medium">
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
                        className={`p-1 px-2 rounded border transition-all text-[10px] font-medium ${
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
        )}
      </div>
    </div>
  );
}
