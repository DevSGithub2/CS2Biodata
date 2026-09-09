"use client";

import React, { useState } from "react";
import { RefreshCw, UserPlus, CheckCircle2 } from "lucide-react";

interface DossierToolbarProps {
  data: any;
  onSyncComplete?: () => void;
}

const GC_BOT_URL = "https://steamcommunity.com/id/unabashe58648dwarshi";

export function DossierToolbar({ data, onSyncComplete }: DossierToolbarProps) {
  const [syncing, setSyncing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const steam = data?.steam || {};
  const steamId64 = steam?.steamId64 || data?.steamId64 || "";

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

      setStatusMsg("SYNCHRONIZED");
      if (onSyncComplete) onSyncComplete();
    } catch {
      setStatusMsg("QUEUED");
    } finally {
      setSyncing(false);
      setTimeout(() => setStatusMsg(null), 3500);
    }
  };

  return (
    <div className="w-full bg-[#05080e]/95 border-b border-cyan-950/70 backdrop-blur-md font-mono select-none relative z-20">
      <div className="max-w-[1700px] w-full mx-auto px-6 sm:px-12 py-2.5 flex items-center justify-between gap-4">
        
        {/* Left: GC Bot Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-bold tracking-wider uppercase">GC BOT ONLINE</span>
          </div>

          <span className="text-gray-700 hidden sm:inline">•</span>
          <span className="text-xs text-gray-400 tracking-wider hidden sm:inline">
            APPID 730 PROTOCOL
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5">
          {statusMsg && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {statusMsg}
            </span>
          )}

          <a
            href={GC_BOT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.1] hover:border-cyan-400/40 text-gray-300 hover:text-white transition-all text-xs font-semibold"
          >
            <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Add GC Bot</span>
          </a>

          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-cyan-200 transition-all text-xs font-bold active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            <span>{syncing ? "Syncing..." : "Sync Telemetry"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
