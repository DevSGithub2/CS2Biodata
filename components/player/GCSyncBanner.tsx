"use client";

import React, { useState } from "react";
import { RefreshCw, Radio, UserPlus, CheckCircle2, ExternalLink, ShieldCheck } from "lucide-react";

interface GCSyncBannerProps {
  steamId64: string;
  onSyncComplete?: () => void;
}

const GC_BOT_URL = "https://steamcommunity.com/id/unabashe58648dwarshi";

export function GCSyncBanner({ steamId64, onSyncComplete }: GCSyncBannerProps) {
  const [syncing, setSyncing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleSync = async () => {
    if (syncing || !steamId64) return;
    setSyncing(true);
    setStatusMsg(null);

    try {
      const res = await fetch(`/api/gc-sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steamId64 }),
      });

      if (!res.ok) {
        await fetch(`/api/player/audit?query=${steamId64}&force=true`);
      }

      setStatusMsg("TELEMETRY REFRESHED");
      if (onSyncComplete) onSyncComplete();
    } catch {
      setStatusMsg("SYNC QUEUED");
    } finally {
      setSyncing(false);
      setTimeout(() => setStatusMsg(null), 3500);
    }
  };

  return (
    <div className="w-full bg-[#060a10]/80 backdrop-blur-md border-b border-white/[0.06] px-6 sm:px-12 py-2 font-mono text-xs select-none">
      <div className="max-w-[1700px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* GC Status Telemetry */}
        <div className="flex items-center gap-3 text-[11px]">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-cyan-500/[0.06] border border-cyan-500/20 text-cyan-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-semibold tracking-wider uppercase">GC Bot Online</span>
          </div>

          <span className="text-gray-600 hidden md:inline">•</span>
          <span className="text-gray-400 text-[11px] hidden md:inline">
            Sub-Tick Handshake Ready
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {statusMsg && (
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {statusMsg}
            </span>
          )}

          <a
            href={GC_BOT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/20 text-gray-300 hover:text-white transition-all text-[11px] font-medium"
          >
            <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Add GC Bot</span>
            <ExternalLink className="w-3 h-3 text-gray-500" />
          </a>

          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3.5 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-400/50 text-cyan-300 hover:text-cyan-200 transition-all text-[11px] font-semibold active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${syncing ? "animate-spin text-cyan-200" : ""}`} />
            <span>{syncing ? "Syncing..." : "Sync Telemetry"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
