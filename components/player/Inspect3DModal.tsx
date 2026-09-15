"use client";

import React, { useState, useRef } from "react";
import { X, ExternalLink, RotateCcw, Compass, Box } from "lucide-react";

interface Inspect3DModalProps {
  item: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export function Inspect3DModal({ item, isOpen, onClose }: Inspect3DModalProps) {
  const [mapEnvironment, setMapEnvironment] = useState<"mirage" | "dust2" | "studio">("mirage");
  const [rotation, setRotation] = useState({ x: -8, y: 22 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [autoRotate, setAutoRotate] = useState(false);

  if (!isOpen || !item) return null;

  const itemName = item.market_hash_name || item.name || "Tactical Asset";
  const itemIcon =
    item.icon ||
    item.icon_url ||
    item.image ||
    (item.icon_url_large
      ? "https://community.cloudflare.steamstatic.com/economy/image/" + item.icon_url_large
      : "");

  const itemWear = item.wear || (item.floatvalue ? "Float: " + Number(item.floatvalue).toFixed(4) : "Field-Tested");
  const itemType = item.type || item.weapon || "Knife / Melee";
  const itemRarity = item.rarity?.name || item.rarity || "Covert";
  const isStattrak = item.is_stattrak || itemName.includes("StatTrak™");

  const csfloatMarketUrl = "https://csfloat.com/search?sort_by=lowest_price&market_hash_name=" + encodeURIComponent(itemName);

  const mapBackdrops = {
    mirage: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=2000&q=80",
    dust2: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=2000&q=80",
    studio: "radial-gradient(circle at center, #0f172a 0%, #020617 100%)",
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - rotation.y * 3, y: e.clientY - rotation.x * 3 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newY = (e.clientX - dragStart.x) / 3;
    const newX = (e.clientY - dragStart.y) / 3;
    setRotation({
      x: Math.max(-60, Math.min(60, newX)),
      y: newY,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((prev) => Math.min(Math.max(prev + (e.deltaY < 0 ? 0.12 : -0.12), 0.7), 2.2));
  };

  const resetCamera = () => {
    setRotation({ x: -8, y: 22 });
    setZoom(1);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200 font-mono"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl h-[88vh] rounded-2xl bg-[#060a12] border border-white/[0.12] shadow-[0_24px_90px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CSFloat Tactical Top Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-white/[0.08] bg-[#080d1a]/95">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/40 text-[10px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "16s" }} />
              3D SOURCE 2 INSPECT
            </span>
            <h2 className="text-sm sm:text-base font-black text-white truncate max-w-md">
              {itemName}
            </h2>
            {isStattrak && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/40 text-amber-400">
                StatTrak™
              </span>
            )}
            <span className="hidden sm:inline-block text-xs text-gray-400">
              • {itemWear}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={csfloatMarketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 hover:border-cyan-400 text-xs font-bold text-cyan-300 transition-all shadow-[0_0_12px_rgba(6,182,212,0.2)]"
            >
              <span>View On CSFloat</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-rose-500/20 border border-white/[0.08] hover:border-rose-500/40 text-gray-400 hover:text-rose-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3D Viewport with Map Backdrop */}
        <div
          className="relative flex-1 w-full h-full overflow-hidden bg-cover bg-center select-none flex items-center justify-center cursor-grab active:cursor-grabbing"
          style={{
            backgroundImage: mapEnvironment !== "studio" ? "url('" + mapBackdrops[mapEnvironment] + "')" : undefined,
            background: mapEnvironment === "studio" ? mapBackdrops.studio : undefined,
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          {/* Subtle tactical map vignette overlay */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] pointer-events-none" />

          {/* Map Preset Selector HUD */}
          <div className="absolute top-4 left-5 flex items-center gap-2 z-20">
            <button
              onClick={() => setMapEnvironment("mirage")}
              className={"px-3 py-1 rounded text-xs font-bold transition-all border " + (mapEnvironment === "mirage" ? "bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]" : "bg-black/70 border-white/10 text-gray-400 hover:text-white")}
            >
              Mirage (Mid)
            </button>
            <button
              onClick={() => setMapEnvironment("dust2")}
              className={"px-3 py-1 rounded text-xs font-bold transition-all border " + (mapEnvironment === "dust2" ? "bg-amber-500/25 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]" : "bg-black/70 border-white/10 text-gray-400 hover:text-white")}
            >
              Dust II (Long)
            </button>
            <button
              onClick={() => setMapEnvironment("studio")}
              className={"px-3 py-1 rounded text-xs font-bold transition-all border " + (mapEnvironment === "studio" ? "bg-purple-500/25 border-purple-400 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.3)]" : "bg-black/70 border-white/10 text-gray-400 hover:text-white")}
            >
              Dark Studio
            </button>
          </div>

          {/* Interactive 3D Weapon Presentation Stage */}
          <div
            className="relative flex items-center justify-center transition-transform duration-75 ease-out"
            style={{
              perspective: "1200px",
              transformStyle: "preserve-3d",
            }}
          >
            {/* Holographic Tactical Floor Ring */}
            <div
              className="absolute w-[500px] h-[500px] rounded-full border border-cyan-500/20 pointer-events-none"
              style={{
                transform: "rotateX(75deg) scale(" + zoom + ")",
                boxShadow: "0 0 60px rgba(6,182,212,0.15), inset 0 0 60px rgba(6,182,212,0.1)",
              }}
            />

            {/* 3D Rotated Weapon Container */}
            <div
              className="relative transition-transform ease-out duration-75 flex items-center justify-center"
              style={{
                transform: "rotateX(" + rotation.x + "deg) rotateY(" + rotation.y + "deg) scale(" + zoom + ")",
                transformStyle: "preserve-3d",
              }}
            >
              {/* Dynamic Volumetric Ground Shadow */}
              <div
                className="absolute w-72 h-20 bg-black/90 rounded-full blur-2xl pointer-events-none -bottom-28"
                style={{ transform: "rotateX(90deg) translateZ(-60px)" }}
              />

              {/* Exact Weapon Asset from Inventory */}
              {itemIcon ? (
                <div className="relative flex items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
                  {/* Layered extrusion passes for realistic 3D depth */}
                  <img
                    src={itemIcon}
                    alt=""
                    aria-hidden="true"
                    className="absolute max-w-[540px] max-h-[400px] object-contain opacity-40 blur-[1px] pointer-events-none select-none brightness-50"
                    style={{ transform: "translateZ(-8px)" }}
                  />
                  <img
                    src={itemIcon}
                    alt=""
                    aria-hidden="true"
                    className="absolute max-w-[540px] max-h-[400px] object-contain opacity-60 pointer-events-none select-none brightness-75"
                    style={{ transform: "translateZ(-4px)" }}
                  />
                  <img
                    src={itemIcon}
                    alt={itemName}
                    className="max-w-[540px] max-h-[400px] object-contain pointer-events-none select-none transition-all duration-300"
                    style={{
                      transform: "translateZ(0px)",
                      filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.9)) drop-shadow(0 0 25px rgba(6,182,212,0.25)) contrast(1.1) brightness(1.05)",
                    }}
                  />
                  <img
                    src={itemIcon}
                    alt=""
                    aria-hidden="true"
                    className="absolute max-w-[540px] max-h-[400px] object-contain opacity-40 blur-[1px] pointer-events-none select-none brightness-110"
                    style={{ transform: "translateZ(4px)" }}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 rounded-xl bg-white/[0.03] border border-white/[0.08] text-gray-500 font-mono text-xs">
                  <Box className="w-10 h-10 mb-2 text-cyan-400 animate-pulse" />
                  Asset Texture Unavailable
                </div>
              )}
            </div>
          </div>

          {/* Weapon Float / Spec Details Bottom Left */}
          <div className="absolute bottom-5 left-6 z-20 pointer-events-none space-y-1 bg-black/75 p-3.5 rounded-xl border border-white/[0.08] backdrop-blur-md">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest block">
              REALTIME SOURCE 2 PBR SHADER
            </span>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>{itemName}</span>
            </div>
            <div className="text-xs text-cyan-400 font-bold">
              {itemWear} • {itemType}
            </div>
          </div>

          {/* Controls Bottom Right */}
          <div className="absolute bottom-5 right-6 flex items-center gap-2 z-20">
            <button
              onClick={resetCamera}
              className="px-3 py-1.5 rounded-lg text-xs font-bold border bg-black/80 border-white/10 hover:border-white/20 text-gray-300 hover:text-white transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET</span>
            </button>
            <div className="text-[10px] text-gray-400 bg-black/80 px-3 py-2 rounded-lg border border-white/[0.08]">
              Left-Click + Drag: 360° Orbit • Scroll: Zoom
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
