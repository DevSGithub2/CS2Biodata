"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, RefreshCw, Key, ShieldCheck, ExternalLink, ChevronDown, ChevronUp, Radio } from "lucide-react";

interface ValveTelemetrySyncProps {
  steamId?: string;
  currentProfileSteamId?: string;
  isOwner?: boolean;
  [key: string]: any;
}

export function ValveTelemetrySync(props: ValveTelemetrySyncProps) {
  const steamId = props.steamId || props.currentProfileSteamId || "";
  const isOwner = props.isOwner ?? true;
  const [authCode, setAuthCode] = useState("");
  const [shareCode, setShareCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<{ connected: boolean; lastCode?: string; lastChecked?: string } | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (!steamId) return;
    fetch(`/api/valve/tokens?steamId=${steamId}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.hasToken) {
          setTokenStatus({
            connected: true,
            lastCode: data.lastKnownMatchCode,
            lastChecked: data.lastCheckedAt
          });
        }
      })
      .catch(() => {});
  }, [steamId]);

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authCode) return;
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/valve/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steamId, authCode, shareCode })
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to link Valve credentials");
      }

      setFeedback({ type: "success", message: "Autonomous sync enabled. Match crawler actively monitoring." });
      setTokenStatus({
        connected: true,
        lastCode: shareCode || "Active",
        lastChecked: new Date().toISOString()
      });
      setExpanded(false);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to connect Valve telemetry" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative mb-6 overflow-hidden rounded-xl border border-cyan-500/20 bg-gradient-to-r from-zinc-950 via-zinc-900/90 to-zinc-950 p-4 shadow-xl backdrop-blur-md">
      {/* Background cyber grid accents */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.08),transparent_60%)]" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left Side Info */}
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Radio className="h-5 w-5 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                Autonomous Valve Telemetry Pipeline
              </span>
              <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                {tokenStatus?.connected ? "CRAWLER ONLINE" : "AWAITING AUTH"}
              </span>
            </div>

            <h3 className="text-base font-black tracking-tight text-white font-mono">
              Official Valve CS2 Telemetry Sync
            </h3>
            <p className="text-xs text-zinc-400">
              {tokenStatus?.connected ? (
                <>Active Checkpoint: <span className="font-mono text-zinc-300 font-semibold">{tokenStatus.lastCode || "Ingesting matches automatically"}</span></>
              ) : (
                <>Link your Valve Authentication Code once to store scoreboards and stats automatically.</>
              )}
            </p>
          </div>
        </div>

        {/* Right Side Action / Status Toggle */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {tokenStatus?.connected ? (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-300 transition-all hover:border-cyan-500/40 hover:text-white"
            >
              <Key className="h-3.5 w-3.5 text-cyan-400" />
              <span>Update Token</span>
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          ) : (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 rounded-lg border border-cyan-500/40 bg-cyan-500/15 px-4 py-2 text-xs font-black uppercase tracking-wider text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)] transition-all hover:bg-cyan-500 hover:text-black"
            >
              <span>{expanded ? "Close Setup" : "Connect Telemetry"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Expanded Credentials Form Drawer */}
      {expanded && (
        <form onSubmit={handleSync} className="relative z-10 mt-4 border-t border-white/[0.08] pt-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] font-bold tracking-wider text-zinc-300 uppercase">
                Game Authentication Code <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                placeholder="e.g. 6KAK-XU3HZ-5F3L"
                className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 font-mono text-xs text-white placeholder-zinc-600 outline-none transition-all focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold tracking-wider text-zinc-300 uppercase">
                Latest Match Sharing Code <span className="text-zinc-500 text-[10px] lowercase">(optional seed)</span>
              </label>
              <input
                type="text"
                value={shareCode}
                onChange={(e) => setShareCode(e.target.value)}
                placeholder="e.g. CSGO-YxZmA-8J3CR-nf3bi-5BkfV-yadyC"
                className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 font-mono text-xs text-white placeholder-zinc-600 outline-none transition-all focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30"
              />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <a
              href="https://steamcommunity.com/my/gcpd/730/?tab=matchhistorytournament"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 hover:underline"
            >
              <span>Get your CS2 Auth & Match Code from Valve Steam Support</span>
              <ExternalLink className="h-3 w-3" />
            </a>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/50 bg-cyan-500 px-4 py-2 text-xs font-black uppercase tracking-wider text-black transition-all hover:bg-cyan-400 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Save & Activate Daemon</span>
                </>
              )}
            </button>
          </div>

          {feedback && (
            <div className={`mt-3 rounded-lg border px-3 py-2 text-xs font-semibold ${
              feedback.type === "success"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                : "border-rose-500/40 bg-rose-500/10 text-rose-300"
            }`}>
              {feedback.message}
            </div>
          )}
        </form>
      )}
    </div>
  );
}

export const ValveAuthBanner = ValveTelemetrySync;
export default ValveTelemetrySync;
