"use client";

import React, { useEffect, useState } from "react";
import { Package, Lock, Search, Sparkles, Filter, ExternalLink } from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  type: string;
  rarity: string;
  rarityColor: string;
  iconUrl: string | null;
  isStatTrak: boolean;
  isSouvenir: boolean;
  wear: string | null;
  tradable: boolean;
}

export default function InventoryViewer({ steamId64 }: { steamId64: string }) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  useEffect(() => {
    async function loadInventory() {
      setLoading(true);
      try {
        const res = await fetch(`/api/inventory?steamId64=${steamId64}`);
        const data = await res.json();
        if (data.success) {
          setIsPrivate(data.isPrivate || false);
          setItems(data.items || []);
        }
      } catch (e) {
        console.error("Failed to load inventory:", e);
      } finally {
        setLoading(false);
      }
    }
    if (steamId64) loadInventory();
  }, [steamId64]);

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (selectedFilter === "knives") return item.type?.toLowerCase().includes("knife") || item.name.includes("Knife") || item.name.includes("Karambit") || item.name.includes("Bayonet");
    if (selectedFilter === "gloves") return item.type?.toLowerCase().includes("gloves") || item.name.includes("Gloves") || item.name.includes("Wraps");
    if (selectedFilter === "stattrak") return item.isStatTrak;
    if (selectedFilter === "stickers") return item.type?.toLowerCase().includes("sticker") || item.name.includes("Sticker");
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-14 bg-[#0c101c]/80 border border-slate-800 rounded-2xl gap-3">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-slate-400 text-sm font-medium">Querying Valve Steam Inventory...</span>
      </div>
    );
  }

  if (isPrivate) {
    return (
      <div className="flex flex-col items-center justify-center p-14 bg-[#0c101c]/80 border border-slate-800 rounded-2xl text-center">
        <Lock className="w-10 h-10 text-amber-500 mb-2" />
        <h4 className="text-slate-200 font-bold text-base">Private Steam Inventory</h4>
        <p className="text-slate-500 text-xs mt-1 max-w-sm">
          This user has configured their Steam Community inventory privacy to Friends-Only or Private.
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-14 bg-[#0c101c]/80 border border-slate-800 rounded-2xl text-center">
        <Package className="w-10 h-10 text-slate-600 mb-2" />
        <h4 className="text-slate-200 font-bold text-base">No CS2 Items Found</h4>
        <p className="text-slate-500 text-xs mt-1">This inventory currently contains no Counter-Strike 2 assets.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header bar with filters and search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0c101c]/90 border border-slate-800/90 p-3.5 rounded-xl">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-emerald-400" />
          <span className="text-slate-200 font-bold text-sm tracking-wide">CS2 INVENTORY</span>
          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
            {items.length} Items
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Filters */}
          <div className="flex items-center gap-1 bg-[#070b14] p-1 rounded-lg border border-slate-800 text-xs">
            {[
              { id: "all", label: "All" },
              { id: "knives", label: "Knives" },
              { id: "gloves", label: "Gloves" },
              { id: "stattrak", label: "StatTrak™" },
              { id: "stickers", label: "Stickers" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  selectedFilter === f.id
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter skin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#070b14] border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Skin Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filteredItems.map((item, idx) => (
          <div
            key={`${item.id}-${idx}`}
            className="group relative bg-[#0c101c]/90 rounded-xl p-3 border border-slate-800/80 hover:border-slate-700 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/40"
            style={{ borderBottomColor: item.rarityColor, borderBottomWidth: "3px" }}
          >
            {/* Top Tag Badges */}
            <div className="flex items-center justify-between gap-1 mb-1">
              {item.isStatTrak ? (
                <span className="text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded">
                  StatTrak™
                </span>
              ) : item.isSouvenir ? (
                <span className="text-[9px] font-black uppercase tracking-wider bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-1.5 py-0.5 rounded">
                  Souvenir
                </span>
              ) : (
                <span className="text-[9px] font-semibold text-slate-500 truncate">{item.type}</span>
              )}

              {item.wear && (
                <span className="text-[9px] font-bold text-slate-400 bg-slate-900/90 px-1.5 py-0.5 rounded border border-slate-800">
                  {item.wear.split(" ")[0]}
                </span>
              )}
            </div>

            {/* Skin Render */}
            <div className="h-28 flex items-center justify-center my-1 relative">
              {item.iconUrl ? (
                <img
                  src={item.iconUrl}
                  alt={item.name}
                  className="max-h-24 max-w-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform duration-200"
                  loading="lazy"
                />
              ) : (
                <Package className="w-12 h-12 text-slate-700" />
              )}
            </div>

            {/* Skin Name & Rarity */}
            <div className="pt-2 border-t border-slate-800/60">
              <h5 className="text-white font-bold text-xs truncate" title={item.name}>
                {item.name}
              </h5>
              <p className="text-[10px] font-medium truncate mt-0.5" style={{ color: item.rarityColor }}>
                {item.rarity}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
