"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface TacticalCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  badge?: string;
  status?: "ONLINE" | "STANDBY" | "ALERT";
  children: React.ReactNode;
}

export function TacticalCard({
  title,
  badge,
  status = "ONLINE",
  className,
  children,
  ...props
}: TacticalCardProps) {
  const statusColors = {
    ONLINE: "bg-emerald-500 text-emerald-400 border-emerald-500/40",
    STANDBY: "bg-amber-500 text-amber-400 border-amber-500/40",
    ALERT: "bg-rose-500 text-rose-400 border-rose-500/40",
  };

  return (
    <div
      className={cn(
        "relative group bg-cs-surface border border-cs-border font-mono p-4 transition-all duration-300",
        "hover:border-cs-accent/50 hover:shadow-amber-glow",
        className
      )}
      {...props}
    >
      {/* Sci-Fi Corner Brackets */}
      <span className="absolute -top-[1px] -left-[1px] w-2.5 h-2.5 border-t-2 border-l-2 border-cs-accent transition-all group-hover:w-3.5 group-hover:h-3.5" />
      <span className="absolute -top-[1px] -right-[1px] w-2.5 h-2.5 border-t-2 border-r-2 border-cs-accent transition-all group-hover:w-3.5 group-hover:h-3.5" />
      <span className="absolute -bottom-[1px] -left-[1px] w-2.5 h-2.5 border-b-2 border-l-2 border-cs-accent transition-all group-hover:w-3.5 group-hover:h-3.5" />
      <span className="absolute -bottom-[1px] -right-[1px] w-2.5 h-2.5 border-b-2 border-r-2 border-cs-accent transition-all group-hover:w-3.5 group-hover:h-3.5" />

      {/* Header telemetry strip */}
      {(title || badge) && (
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-cs-border text-xs tracking-wider">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-cs-accent inline-block animate-pulse" />
            <span className="font-bold text-gray-200 uppercase">{title}</span>
          </div>

          <div className="flex items-center gap-2">
            {badge && (
              <span className="text-[10px] px-1.5 py-0.5 border border-cs-border text-gray-400">
                {badge}
              </span>
            )}
            <span
              className={cn(
                "text-[9px] px-1.5 py-0.5 border uppercase font-bold",
                statusColors[status]
              )}
            >
              {status}
            </span>
          </div>
        </div>
      )}

      {/* Main payload */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
