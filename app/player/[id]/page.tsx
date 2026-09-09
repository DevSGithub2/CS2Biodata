"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/home/Navbar";
import { TacticalGrid } from "@/components/ui/TacticalGrid";
import { Footer } from "@/components/home/Footer";
import { DossierToolbar } from "@/components/player/DossierToolbar";
import { DossierHero } from "@/components/player/DossierHero";
import { DossierTabs } from "@/components/player/DossierTabs";
import { Loader2, AlertTriangle } from "lucide-react";

export default function PlayerDossierPage() {
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAudit = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/player/audit?query=${encodeURIComponent(id)}`);
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Operative telemetry record not found.");
      }

      setData(result);
    } catch (err: any) {
      setError(err.message || "Failed to retrieve telemetry profile.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAudit();
  }, [fetchAudit]);

  return (
    <main className="relative min-h-screen bg-[#04070a] text-gray-200 overflow-x-hidden font-mono flex flex-col justify-between">
      <TacticalGrid />
      <Navbar />

      {/* GC Utility Toolbar */}
      {data && <DossierToolbar data={data} onSyncComplete={fetchAudit} />}

      <div className="relative z-10 max-w-[1700px] w-full mx-auto px-6 sm:px-12 py-8 flex-1 space-y-6">
        {loading && (
          <div className="h-[55vh] flex flex-col items-center justify-center gap-3 text-cyan-400">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-xs uppercase tracking-widest animate-pulse">
              INGESTING GC TELEMETRY FOR TARGET: {id}...
            </p>
          </div>
        )}

        {error && (
          <div className="h-[55vh] flex flex-col items-center justify-center gap-4 text-center max-w-md mx-auto">
            <AlertTriangle className="w-10 h-10 text-rose-500" />
            <div className="text-rose-400 text-sm uppercase font-bold">{error}</div>
            <p className="text-xs text-gray-500">
              Verify the SteamID64, profile link, or vanity username is correct and try again.
            </p>
          </div>
        )}

        {!loading && !error && data && (
          <>
            {/* Primary Hero Header */}
            <DossierHero data={data} />

            {/* Complete 6-Tab Modular Sub-System */}
            <DossierTabs data={data} />
          </>
        )}
      </div>

      <Footer />
    </main>
  );
}
