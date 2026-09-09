"use client";

import React, { useState, useEffect } from "react";
import { Terminal, ShieldCheck, Activity, Cpu } from "lucide-react";

export function Footer() {
  const [ping, setPing] = useState(14);
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateMetrics = () => {
      setPing(Math.floor(12 + Math.random() * 5));
      const now = new Date();
      setTime(now.toISOString().slice(11, 19) + " UTC");
    };
    updateMetrics();
    const interval = setInterval(updateMetrics, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="relative z-20 w-full border-t border-cyan-950/60 bg-[#030508]/95 backdrop-blur-md px-6 sm:px-12 py-3 font-mono text-[11px] text-gray-400 select-none">
      <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Left: Engine & Service Network State */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>VALVE GC [730]: ACTIVE</span>
          </div>

          <span className="text-gray-700 hidden sm:inline">|</span>

          <div className="flex items-center gap-1.5 text-cyan-300">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>FACEIT V4 PIPELINE: SYNCED</span>
          </div>

          <span className="text-gray-700 hidden sm:inline">|</span>

          <div className="flex items-center gap-1.5 text-gray-400">
            <Cpu className="w-3.5 h-3.5 text-amber-400/80" />
            <span>ATLAS TTL CACHE: OK</span>
          </div>
        </div>

        {/* Right: Military Spec Classification & Telemetry Diagnostics */}
        <div className="flex items-center gap-4 text-gray-500 text-[10px] tracking-widest">
          <div className="hidden lg:flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-cyan-950/50 border border-cyan-800/40 text-cyan-400 rounded-xs">
              SUB-TICK ENGINE
            </span>
            <span>PING: <strong className="text-gray-300 font-normal">{ping}ms</strong></span>
          </div>

          <span className="text-gray-700 hidden lg:inline">|</span>

          <span className="text-gray-400 font-medium">
            {time || "SYS_READY"}
          </span>

          <span className="text-gray-700 hidden sm:inline">|</span>

          <div className="flex items-center gap-1.5 text-cyan-400/80">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>PROTOCOL // BIODATA-v2.4</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
