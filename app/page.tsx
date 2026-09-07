"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  ExternalLink,
  Loader2,
  Database,
  Flame,
  Zap,
  Radio,
  Trophy,
  Copy,
  Check,
  Fingerprint,
  History,
  Key,
  Plus,
  Swords,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  Target,
  Crosshair,
  Clock,
  EyeOff,
  TrendingUp,
  Award,
} from "lucide-react";
import { MasterDossierResponse } from "@/types/dossier";

function StatDial({
  value,
  max = 100,
  label,
  sublabel,
  color = "#22c55e",
}: {
  value: number;
  max?: number;
  label: string;
  sublabel?: string;
  color?: string;
}) {
  const radius = 34;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progress = Math.min(Math.max(value / max, 0), 1);
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          <circle
            stroke="#1f242d"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset, transition: "stroke-dashoffset 0.5s ease" }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <span className="absolute font-mono text-sm font-black text-white">{value}%</span>
      </div>
      <span className="mt-2 text-[10px] font-bold tracking-wider text-neutral-400 uppercase">{label}</span>
      {sublabel && <span className="text-[9px] font-mono text-neutral-500">{sublabel}</span>}
    </div>
  );
}

export default function Home() {
  const [query, setQuery] = useState("76561198877011661");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MasterDossierResponse["data"] | null>(null);
  const [activeTab, setActiveTab] = useState<"faceit" | "steam">("faceit");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Valve Sync State
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [authCode, setAuthCode] = useState("");
  const [knownCode, setKnownCode] = useState("");
  const [syncing, setSyncing] = useState(false);

  const fetchDossier = async (target: string) => {
    if (!target.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/player/aggregate?query=${encodeURIComponent(target.trim())}`);
      const json: MasterDossierResponse = await res.json();
      if (!res.ok || !json.success) throw new Error((json as any).error || "Profile not found.");
      setData(json.data);
    } catch (err: any) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDossier("76561198877011661");
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDossier(query);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleSyncValve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authCode.trim() || !knownCode.trim() || !data?.steamId) return;

    setSyncing(true);
    try {
      const res = await fetch("/api/valve/sync-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          steamId: data.steamId,
          authCode,
          knownCode,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to sync Valve history");
      setShowSyncModal(false);
      fetchDossier(data.steamId);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSyncing(false);
    }
  };

  const steam = data?.steam;
  const faceit = data?.faceit;
  const fIdentity = faceit?.identity;
  const fOverview = faceit?.overview;
  const fEntry = faceit?.entry;
  const fClutch = faceit?.clutch;
  const fUtility = faceit?.utility;
  const recentFaceitMatches = faceit?.recentMatches || [];
  const valveMatches = data?.valveHistory || [];

  const rawResults = fOverview?.recentResults || ["1", "1", "0", "0", "0"];
  const recent20 = Array(20)
    .fill(null)
    .map((_, i) => rawResults[i % rawResults.length]);

  const formatDate = (unix: number) => {
    if (!unix) return "Recent";
    return new Date(unix * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <main className="min-h-screen bg-[#0d0f12] text-[#e1e7ed] font-sans antialiased pb-20 selection:bg-emerald-500 selection:text-black">
      {/* Header */}
      <header className="h-14 border-b border-[#1b1f26] bg-[#11141a]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-black text-white text-base tracking-wider">
            <span className="text-emerald-400 font-mono text-lg">CS2</span> BIODATA
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-3 py-0.5 rounded-full ml-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ONLINE
          </div>
        </div>

        <form onSubmit={handleSearch} className="relative w-80">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="SteamID64, Vanity, or Profile..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#171b22] border border-[#232934] rounded-lg pl-9 pr-8 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition font-mono"
          />
          {loading && <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />}
        </form>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {error && (
          <div className="p-3 rounded-lg border border-red-500/30 bg-red-950/20 text-red-400 text-xs font-mono text-center">
            {error}
          </div>
        )}

        {data && steam && (
          <>
            {/* Identity Bar */}
            <div className="relative rounded-2xl bg-[#13161c] border border-[#1e232d] p-6 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 shadow-xl">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <img
                    src={fIdentity?.avatar || steam.profile?.avatar || ""}
                    alt={steam.profile?.personaName || "Player Avatar"}
                    className="w-20 h-20 rounded-2xl border-2 border-[#2a313d] object-cover shadow-lg"
                  />
                  {faceit?.registered && fIdentity && (
                    <span className="absolute -bottom-2 -right-2 bg-orange-600 border-2 border-[#13161c] text-white text-[10px] font-black rounded-lg px-1.5 py-0.5 shadow">
                      LVL {fIdentity.skillLevel}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-black text-white tracking-tight">
                      {faceit?.registered && fIdentity ? fIdentity.nickname : steam.profile?.personaName}
                    </h1>
                    <span className="text-xs bg-[#1a1f27] border border-[#262e3a] px-2 py-0.5 rounded text-neutral-300 uppercase font-mono font-bold">
                      {fIdentity?.country || "IN"}
                    </span>
                    <a href={steam.profile?.profileUrl} target="_blank" rel="noreferrer" className="text-neutral-500 hover:text-white">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] font-mono text-neutral-500">
                    <span>STEAMID: {data.steamId}</span>
                    <span>•</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Database className="w-3 h-3" /> ATLAS SYNCED
                    </span>
                  </div>
                </div>
              </div>

              {/* Tab Switcher */}
              <div className="flex items-center gap-4">
                <div className="flex bg-[#181c24] p-1 rounded-xl border border-[#222834]">
                  <button
                    onClick={() => setActiveTab("faceit")}
                    className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                      activeTab === "faceit"
                        ? "bg-orange-600 text-white shadow-lg"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    FACEIT Track ({recentFaceitMatches.length} Matches)
                  </button>
                  <button
                    onClick={() => setActiveTab("steam")}
                    className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                      activeTab === "steam"
                        ? "bg-blue-600 text-white shadow-lg"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    Steam & Valve Track ({valveMatches.length} Synced)
                  </button>
                </div>

                {faceit?.registered && fIdentity && (
                  <div className="flex items-center gap-2 bg-[#171b23] border border-[#232935] px-4 py-2 rounded-xl font-mono">
                    <span className="text-xs text-neutral-400">ELO</span>
                    <span className="text-xl font-black text-white">{fIdentity.elo}</span>
                  </div>
                )}
              </div>
            </div>

            {/* =================================================================== */}
            {/* TAB 1: FACEIT TRACK (Stats + Segments + FACEIT Match History)       */}
            {/* =================================================================== */}
            {activeTab === "faceit" && (
              <div className="space-y-6">
                {!faceit?.registered || !fOverview ? (
                  <div className="bg-[#13161c] border border-[#1e232d] rounded-2xl p-12 text-center space-y-3">
                    <EyeOff className="w-10 h-10 text-neutral-600 mx-auto" />
                    <h3 className="text-lg font-bold text-white uppercase">No FACEIT Account Linked</h3>
                    <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                      This Steam account does not have a linked FACEIT CS2 registration or has not played competitive 5v5 matches.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Top Headline Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                      {[
                        { label: "WIN RATE", val: fOverview.winRatePct, sub: `${fOverview.wins} WINS`, color: "text-emerald-400" },
                        { label: "MATCHES", val: fOverview.matches, sub: "LIFETIME 5V5", color: "text-white" },
                        { label: "K/D RATIO", val: fOverview.kdRatio, sub: "AVERAGE", color: "text-white" },
                        { label: "ADR", val: fOverview.adr, sub: "DAMAGE / RD", color: "text-white" },
                        { label: "HEADSHOT %", val: fOverview.headshotPct, sub: "PRECISION", color: "text-white" },
                        { label: "SNIPER RATE", val: fEntry?.sniperKillRate || "0%", sub: `${fEntry?.totalSniperKills || 0} KILLS`, color: "text-white" },
                      ].map((item, idx) => (
                        <div key={idx} className="bg-[#13161c] border border-[#1e232d] rounded-xl p-4 text-center">
                          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">{item.label}</span>
                          <p className={`font-mono text-2xl font-black mt-0.5 ${item.color}`}>{item.val}</p>
                          <span className="text-[9px] font-mono text-neutral-500 uppercase block mt-1">{item.sub}</span>
                        </div>
                      ))}
                    </div>

                    {/* Three Telemetry Columns */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Form & Streaks */}
                      <div className="bg-[#13161c] border border-[#1e232d] rounded-xl p-5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
                            <span>Recent Form • Last 20</span>
                            <span className="text-emerald-400 font-mono">{fOverview.winRatePct} WR</span>
                          </div>
                          <div className="grid grid-cols-10 gap-1.5 mb-4">
                            {recent20.map((res, i) => (
                              <div
                                key={i}
                                className={`h-6 rounded flex items-center justify-center font-mono text-[10px] font-black border ${
                                  res === "1"
                                    ? "bg-emerald-600/20 border-emerald-500/40 text-emerald-400"
                                    : "bg-red-600/20 border-red-500/40 text-red-400"
                                }`}
                              >
                                {res === "1" ? "W" : "L"}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 border-t border-[#1e232d] pt-3 text-center font-mono text-xs">
                          <div>
                            <span className="text-[9px] text-neutral-500 uppercase block">Current Streak</span>
                            <span className="font-bold text-white">{fOverview.currentWinStreak}W</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-neutral-500 uppercase block">Longest Streak</span>
                            <span className="font-bold text-emerald-400">{fOverview.longestWinStreak}W</span>
                          </div>
                        </div>
                      </div>

                      {/* Clutch & Entry */}
                      <div className="bg-[#13161c] border border-[#1e232d] rounded-xl p-5 flex flex-col justify-between">
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-4">
                            Clutch & Entry Telemetry
                          </span>
                          <div className="flex items-center justify-around mb-6">
                            <StatDial
                              value={parseInt(fClutch?.clutch1v1?.winRate || "0", 10)}
                              label="1v1 Win Rate"
                              sublabel={`${fClutch?.clutch1v1?.wins || 0} / ${fClutch?.clutch1v1?.count || 0}`}
                              color="#10b981"
                            />
                            <StatDial
                              value={parseInt(fClutch?.clutch1v2?.winRate || "0", 10)}
                              label="1v2 Win Rate"
                              sublabel={`${fClutch?.clutch1v2?.wins || 0} / ${fClutch?.clutch1v2?.count || 0}`}
                              color="#06b6d4"
                            />
                          </div>
                          <div className="space-y-2 font-mono text-xs">
                            <div className="flex justify-between items-center bg-[#171b23] p-2 rounded border border-[#212733]">
                              <span className="text-neutral-400 text-[11px] flex items-center gap-1">
                                <Zap className="w-3.5 h-3.5 text-amber-400" /> ENTRY RATE
                              </span>
                              <span className="font-bold text-white">{fEntry?.entryRate}</span>
                            </div>
                            <div className="flex justify-between items-center bg-[#171b23] p-2 rounded border border-[#212733]">
                              <span className="text-neutral-400 text-[11px] flex items-center gap-1">
                                <Trophy className="w-3.5 h-3.5 text-emerald-400" /> ENTRY SUCCESS
                              </span>
                              <span className="font-bold text-emerald-400">{fEntry?.entrySuccessRate}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Utility Mastery */}
                      <div className="bg-[#13161c] border border-[#1e232d] rounded-xl p-5 flex flex-col justify-between">
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-4">
                            Utility Mastery
                          </span>
                          <div className="flex items-center justify-around mb-6">
                            <StatDial
                              value={parseInt(fUtility?.utilitySuccessRate || "0", 10)}
                              label="Utility Success"
                              sublabel={`${fUtility?.totalUtilitySuccesses || 0} / ${fUtility?.totalUtilityCount || 0}`}
                              color="#10b981"
                            />
                            <StatDial
                              value={parseInt(fUtility?.flashSuccessRate || "0", 10)}
                              label="Flash Success"
                              sublabel={`${fUtility?.totalFlashSuccesses || 0} / ${fUtility?.totalFlashCount || 0}`}
                              color="#f59e0b"
                            />
                          </div>
                          <div className="space-y-2 font-mono text-xs">
                            <div className="flex justify-between items-center bg-[#171b23] p-2 rounded border border-[#212733]">
                              <span className="text-neutral-400 text-[11px] flex items-center gap-1">
                                <Radio className="w-3.5 h-3.5 text-blue-400" /> ENEMIES FLASHED
                              </span>
                              <span className="font-bold text-amber-400">{fUtility?.enemiesFlashedPerRound}/rd</span>
                            </div>
                            <div className="flex justify-between items-center bg-[#171b23] p-2 rounded border border-[#212733]">
                              <span className="text-neutral-400 text-[11px] flex items-center gap-1">
                                <Flame className="w-3.5 h-3.5 text-orange-400" /> UTIL DMG / ROUND
                              </span>
                              <span className="font-bold text-white">{fUtility?.utilityDamagePerRound}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Map Segments */}
                    {faceit.maps && faceit.maps.length > 0 && (
                      <div className="space-y-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                          // FACEIT Map Performance Segments
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {faceit.maps.map((m) => (
                            <div key={m.mapName} className="rounded-xl bg-[#13161c] border border-[#1e232d] p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-black text-white">{m.mapName}</h4>
                                <span className="text-base font-mono font-black text-emerald-400">{m.winRate}</span>
                              </div>
                              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#1e232d] font-mono text-[11px]">
                                <div>
                                  <span className="text-[9px] text-neutral-500 block">MATCHES</span>
                                  <span className="font-bold text-white">{m.matches}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-neutral-500 block">K/D</span>
                                  <span className="font-bold text-white">{m.kdRatio}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-neutral-500 block">HS%</span>
                                  <span className="font-bold text-white">{m.headshotPct}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-neutral-500 block">KILLS</span>
                                  <span className="font-bold text-white">{m.kills}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* FACEIT Match History Feed */}
                    <div className="space-y-3 pt-4">
                      <div className="flex items-center justify-between border-b border-[#1e232d] pb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                          <Flame className="w-4 h-4" /> FACEIT Match History ({recentFaceitMatches.length} Matches)
                        </span>
                        <span className="text-[11px] font-mono text-neutral-500">Official FACEIT 5v5 Queue Feed</span>
                      </div>

                      <div className="space-y-2 font-mono text-xs">
                        {recentFaceitMatches.map((m: any) => {
                          const score = m.results?.score;
                          const winner = m.results?.winner;
                          const isFaction1Winner = winner === "faction1";

                          return (
                            <div
                              key={m.matchId}
                              className="bg-[#13161c] border border-[#1e232d] hover:border-[#2b3341] rounded-xl p-4 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                              <div className="space-y-1.5 flex-1">
                                <div className="flex items-center gap-2.5">
                                  <span className="px-2 py-0.5 rounded bg-orange-950/40 border border-orange-800/40 text-orange-400 text-[10px] font-bold">
                                    {m.region || "SEA"} 5v5
                                  </span>
                                  <span className="text-neutral-400 text-[11px] flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-neutral-500" /> {formatDate(m.finishedAt || m.startedAt)}
                                  </span>
                                </div>

                                <div className="flex items-center gap-3 font-sans text-sm font-semibold">
                                  <span className={isFaction1Winner ? "text-emerald-400" : "text-neutral-300"}>
                                    {m.teams?.faction1?.nickname || "Faction 1"}
                                  </span>
                                  <span className="text-neutral-600 font-mono text-xs">VS</span>
                                  <span className={!isFaction1Winner ? "text-emerald-400" : "text-neutral-300"}>
                                    {m.teams?.faction2?.nickname || "Faction 2"}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-6 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-800">
                                {score && (
                                  <div className="text-right">
                                    <span className="text-lg font-black text-white">
                                      {score.faction1} : {score.faction2}
                                    </span>
                                  </div>
                                )}

                                <a
                                  href={m.faceitUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-3 py-1.5 rounded-lg bg-[#191e27] hover:bg-[#232b38] border border-[#232a37] text-orange-400 hover:text-white flex items-center gap-1.5 text-xs transition"
                                >
                                  Room <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* =================================================================== */}
            {/* TAB 2: STEAM & VALVE TRACK (Identifiers + Stats + Valve Replays)   */}
            {/* =================================================================== */}
            {activeTab === "steam" && (
              <div className="space-y-6">
                {/* Identifiers Matrix */}
                <div className="bg-[#13161c] border border-[#1e232d] rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2 border-b border-[#1e232d] pb-3">
                    <Fingerprint className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-bold tracking-wider uppercase text-neutral-200">Steam Identifiers Matrix</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                    {[
                      { label: "steamID", val: steam.identifiers.steamID },
                      { label: "steamID3", val: steam.identifiers.steamID3 },
                      { label: "steamID64", val: steam.identifiers.steamID64 },
                      { label: "customURL", val: steam.identifiers.customUrl },
                      { label: "accountID", val: steam.identifiers.accountId },
                      { label: "profileURL", val: steam.identifiers.profileUrl },
                    ].map(({ label, val }) => (
                      <div key={label} className="flex items-center justify-between p-3 rounded-xl bg-[#171b22] border border-[#212732]">
                        <div className="truncate mr-2">
                          <span className="text-neutral-500 uppercase text-[10px] block font-sans font-bold">{label}</span>
                          <span className="text-neutral-200 truncate">{val}</span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(val, label)}
                          className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition"
                        >
                          {copiedKey === label ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Steam Combat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                  <div className="bg-[#13161c] border border-[#1e232d] p-4 rounded-xl text-center">
                    <span className="text-[10px] text-neutral-500 uppercase block font-sans font-bold">Kills / Deaths</span>
                    <span className="text-xl font-bold text-white">{steam.combat.kills.toLocaleString()} / {steam.combat.deaths.toLocaleString()}</span>
                    <span className="text-[10px] text-emerald-400 block mt-1">{steam.combat.kdRatio} K/D</span>
                  </div>
                  <div className="bg-[#13161c] border border-[#1e232d] p-4 rounded-xl text-center">
                    <span className="text-[10px] text-neutral-500 uppercase block font-sans font-bold">Headshot Precision</span>
                    <span className="text-xl font-bold text-white">{steam.combat.headshotPercentage}</span>
                    <span className="text-[10px] text-neutral-400 block mt-1">{steam.combat.headshots.toLocaleString()} HS</span>
                  </div>
                  <div className="bg-[#13161c] border border-[#1e232d] p-4 rounded-xl text-center">
                    <span className="text-[10px] text-neutral-500 uppercase block font-sans font-bold">Total Wins</span>
                    <span className="text-xl font-bold text-white">{steam.combat.wins.toLocaleString()}</span>
                    <span className="text-[10px] text-neutral-400 block mt-1">{steam.combat.mvps.toLocaleString()} MVPs</span>
                  </div>
                  <div className="bg-[#13161c] border border-[#1e232d] p-4 rounded-xl text-center">
                    <span className="text-[10px] text-neutral-500 uppercase block font-sans font-bold">Time Tracked</span>
                    <span className="text-xl font-bold text-white">{steam.combat.timePlayedHours.toLocaleString()}h</span>
                    <span className="text-[10px] text-neutral-400 block mt-1">{steam.combat.roundsPlayed.toLocaleString()} Rounds</span>
                  </div>
                </div>

                {/* Weapon Arsenal */}
                <div className="bg-[#13161c] border border-[#1e232d] rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2 border-b border-[#1e232d] pb-3">
                    <Swords className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-bold tracking-wider uppercase text-neutral-200">Valve Lifetime Weapon Telemetry</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Object.values(steam.weapons).slice(0, 4).map((w) => (
                      <div key={w.name} className="bg-[#171b23] border border-[#212733] p-4 rounded-xl space-y-1 font-mono">
                        <span className="text-xs font-bold text-neutral-400 font-sans">{w.name}</span>
                        <p className="text-xl font-bold text-white">{w.kills.toLocaleString()}</p>
                        <p className="text-[10px] text-neutral-500">ACCURACY: {w.accuracy}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dedicated Valve Match History Section */}
                <div className="space-y-4 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#13161c] border border-[#1e232d] p-5 rounded-xl">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                        <History className="w-4 h-4" /> Official Valve Match History ({valveMatches.length} Synced)
                      </h3>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Matches retrieved directly from Valve servers via your personal Game Authentication Code.
                      </p>
                    </div>

                    <button
                      onClick={() => setShowSyncModal(true)}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 shrink-0 self-start sm:self-auto"
                    >
                      <Plus className="w-3.5 h-3.5" /> Sync Valve Matches
                    </button>
                  </div>

                  {valveMatches.length === 0 ? (
                    <div className="bg-[#13161c] border border-[#1e232d] rounded-xl p-8 text-center space-y-3">
                      <Key className="w-8 h-8 text-neutral-600 mx-auto" />
                      <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                        No Valve matches indexed for this account yet. Click sync to crawl matches using your Game Authentication Code.
                      </p>
                      <button
                        onClick={() => setShowSyncModal(true)}
                        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition"
                      >
                        Authenticate Valve History
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#1e232d] bg-[#13161c] border border-[#1e232d] rounded-xl p-4 font-mono text-xs space-y-1">
                      {valveMatches.map((vm: any) => (
                        <div key={vm.shareCode} className="py-3 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="text-blue-400 font-bold">{vm.shareCode}</span>
                            <div className="text-[10px] text-neutral-500 flex gap-4 mt-0.5">
                              <span>Match ID: {vm.decoded?.matchId}</span>
                              <span>Token: {vm.decoded?.tokenId}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => copyToClipboard(vm.shareCode, vm.shareCode)}
                            className="px-3 py-1 rounded bg-[#181d26] border border-[#222936] text-neutral-300 hover:text-white flex items-center gap-1 text-[11px] self-start sm:self-auto"
                          >
                            {copiedKey === vm.shareCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            Copy Share Code
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Valve Auth Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121217] border border-[#222834] rounded-2xl max-w-lg w-full p-6 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-400" /> Valve Match History Crawler
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Enter your Steam Game Authentication Key and any recent Match Sharing Code to index match replays.
              </p>
            </div>

            <form onSubmit={handleSyncValve} className="space-y-4 text-xs font-mono">
              <div className="space-y-1.5">
                <label className="text-neutral-400 font-sans font-bold">Game Authentication Code (steamidkey)</label>
                <input
                  type="text"
                  placeholder="e.g. AAAA-AAAAA-AAAA"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  className="w-full bg-[#18181f] border border-[#262e3d] rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-blue-500"
                  required
                />
                <a
                  href="https://help.steampowered.com/en/wizard/HelpWithGameIssue/?appid=730&issueid=128"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-blue-400 hover:underline flex items-center gap-1 font-sans"
                >
                  Generate key on Steam Help Portal <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="space-y-1.5">
                <label className="text-neutral-400 font-sans font-bold">Known Match Sharing Code (knowncode)</label>
                <input
                  type="text"
                  placeholder="e.g. CSGO-XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
                  value={knownCode}
                  onChange={(e) => setKnownCode(e.target.value)}
                  className="w-full bg-[#18181f] border border-[#262e3d] rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#1e232d]">
                <button
                  type="button"
                  onClick={() => setShowSyncModal(false)}
                  className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={syncing}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 text-white font-bold transition flex items-center gap-2"
                >
                  {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Start Sync"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
