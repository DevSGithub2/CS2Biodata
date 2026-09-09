"use client";

import React from "react";
import { Package, DollarSign } from "lucide-react";

export function InventoryGrid({ inventory }: { inventory: any }) {
  const items = inventory?.items || [];
  const totalItems = inventory?.totalItems ?? items.length;
  const valuation = inventory?.totalValuationUSD ?? 0;

  return (
    <div className="relative p-6 bg-[#080d14]/90 border border-cyan-800/40 shadow-[0_0_20px_rgba(0,255,204,0.08)] font-mono">
      <span className="absolute -top-0.5 -left-0.5 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
      <span className="absolute -bottom-0.5 -left-0.5 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

      {/* Header telemetry strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-4 border-b border-cyan-950 gap-2">
        <div className="flex items-center gap-2 text-cyan-400 font-bold tracking-wider uppercase text-xs">
          <Package className="w-4 h-4" />
          <span>CS2 Combat Inventory Telemetry</span>
          <span className="text-[10px] text-gray-500">({totalItems} Assets)</span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/40 border border-emerald-600/40 text-emerald-400 text-xs font-bold">
          <DollarSign className="w-3.5 h-3.5" />
          <span>PORTFOLIO VALUATION: ${valuation.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="py-12 text-center text-xs text-gray-500">
          INVENTORY PRIVATE OR EMPTY FOR THIS OPERATIVE.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {items.map((item: any, idx: number) => (
            <div
              key={idx}
              className="relative p-3 bg-[#05080c] border border-cyan-950 hover:border-cyan-500/50 transition-all group flex flex-col justify-between"
            >
              <div className="aspect-square relative flex items-center justify-center mb-2">
                {item.icon_url && (
                  <img
                    src={`https://community.cloudflare.steamstatic.com/economy/image/${item.icon_url}`}
                    alt={item.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                  />
                )}
              </div>
              <div className="text-[10px] font-bold text-gray-200 truncate">{item.name}</div>
              <div className="text-[9px] text-cyan-400 mt-1">
                {item.price ? `$${item.price}` : "Market Standard"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
