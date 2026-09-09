"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Crosshair, Zap, Activity } from "lucide-react";

export function CTWidget() {
  const [latency, setLatency] = useState(7.81);
  const [packets, setPackets] = useState(128);

  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(Number((7.5 + Math.random() * 0.7).toFixed(2)));
      setPackets(Math.random() > 0.1 ? 128 : 127);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      animate={{ y: [-4, 5, -4] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      className="relative w-80 p-5 bg-[#080d14]/90 border border-cyan-700/50 shadow-[0_0_25px_rgba(0,255,204,0.12)] backdrop-blur-md overflow-hidden group"
    >
      {/* Dynamic Laser Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent h-12 w-full animate-scan-line opacity-50" />

      {/* Sci-Fi Corner Brackets */}
      <span className="absolute -top-0.5 -left-0.5 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-400 group-hover:scale-110 transition-transform" />
      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-400 group-hover:scale-110 transition-transform" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-cyan-950/80 text-xs">
        <span className="flex items-center gap-2 text-cyan-400 font-bold tracking-wider">
          <Shield className="w-4 h-4 animate-pulse" /> COUNTER-TERRORIST
        </span>
        <div className="relative flex items-center justify-center">
          <span className="absolute w-3.5 h-3.5 rounded-full bg-cyan-400/40 animate-ping" />
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(0,255,204,0.9)]" />
        </div>
      </div>

      {/* Telemetry rows */}
      <div className="space-y-2.5 text-xs text-gray-400 font-mono">
        <div className="flex justify-between items-center">
          <span>Server Sync:</span>
          <span className="text-cyan-300 font-bold tracking-wide">
            {packets} Tick <span className="text-[10px] text-cyan-400/70">({latency}ms)</span>
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span>Anti-Cheat:</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            VAC Live Active
          </span>
        </div>
        <div className="pt-2.5 border-t border-cyan-950/80 flex items-center justify-between text-[10px] text-cyan-500">
          <span className="tracking-widest">MONITORING: PREMIER QUEUE</span>
          <Activity className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
        </div>
      </div>
    </motion.div>
  );
}

export function TWidget() {
  const maps = ["Mirage", "Inferno", "Nuke", "Dust II", "Anubis", "Ancient"];
  const [currentMap, setCurrentMap] = useState("Mirage");
  const [activeQueues, setActiveQueues] = useState(1420);

  useEffect(() => {
    const mapTimer = setInterval(() => {
      setCurrentMap(maps[Math.floor(Math.random() * maps.length)]);
      setActiveQueues(Math.floor(1380 + Math.random() * 120));
    }, 3200);
    return () => clearInterval(mapTimer);
  }, []);

  return (
    <motion.div
      animate={{ y: [4, -5, 4] }}
      transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
      className="relative w-80 p-5 bg-[#080d14]/90 border border-amber-700/50 shadow-[0_0_25px_rgba(255,153,0,0.12)] backdrop-blur-md overflow-hidden group"
    >
      {/* Dynamic Laser Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-amber-400/10 to-transparent h-12 w-full animate-scan-line opacity-50" />

      {/* Sci-Fi Corner Brackets */}
      <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 border-t-2 border-r-2 border-amber-400 group-hover:scale-110 transition-transform" />
      <span className="absolute -bottom-0.5 -left-0.5 w-3.5 h-3.5 border-b-2 border-l-2 border-amber-400 group-hover:scale-110 transition-transform" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-amber-950/80 text-xs">
        <span className="flex items-center gap-2 text-amber-400 font-bold tracking-wider">
          <Crosshair className="w-4 h-4 animate-spin [animation-duration:12s]" /> TERRORIST FORCE
        </span>
        <div className="relative flex items-center justify-center">
          <span className="absolute w-3.5 h-3.5 rounded-full bg-amber-400/40 animate-ping" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(255,153,0,0.9)]" />
        </div>
      </div>

      {/* Telemetry rows */}
      <div className="space-y-2.5 text-xs text-gray-400 font-mono">
        <div className="flex justify-between items-center">
          <span>Active Mode:</span>
          <span className="text-amber-300 font-bold tracking-wide">
            {currentMap} <span className="text-[10px] text-amber-400/70">(Premier)</span>
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span>FACEIT Elo Sync:</span>
          <span className="text-amber-400 font-bold">
            Level 1–10 <span className="text-[10px] text-amber-500 font-normal">({activeQueues} live)</span>
          </span>
        </div>
        <div className="pt-2.5 border-t border-amber-950/80 flex items-center justify-between text-[10px] text-amber-500">
          <span className="tracking-widest">ANALYZING TELEMETRY</span>
          <Zap className="w-3.5 h-3.5 animate-bounce text-amber-400" />
        </div>
      </div>
    </motion.div>
  );
}
