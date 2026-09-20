import React from "react";
import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";
import { TacticalGrid } from "@/components/ui/TacticalGrid";

export const metadata = {
  title: "About | CS2BioData",
  description: "About CS2BioData tactical telemetry and analytics engine.",
};

export default function AboutPage() {
  return (
    <main className="relative min-h-screen bg-[#04070a] text-gray-200 overflow-x-hidden font-mono flex flex-col justify-between">
      <TacticalGrid />
      <Navbar />

      <div className="relative z-10 max-w-4xl w-full mx-auto px-6 py-12 flex-1 space-y-8">
        <div className="border-b border-white/[0.08] pb-6">
          <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-white uppercase">
            About CS2BioData
          </h1>
          <p className="text-xs text-cyan-400 mt-2">AUTONOMOUS COUNTER-STRIKE 2 TELEMETRY DOSSIER</p>
        </div>

        <section className="space-y-4 text-sm text-gray-300 leading-relaxed">
          <p>
            CS2BioData is a comprehensive analytics suite and combat telemetry utility built for Counter-Strike 2. The platform aggregates Valve Game Coordinator rankings, per-map competitive skill groups, FACEIT stats, friend VAC audits, and weapon inventory classifications into an integrated tactical profile.
          </p>

          <h2 className="text-base font-bold text-cyan-400 uppercase tracking-wide">Core Architectural Modules</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-400">
            <li>Dynamic Game Coordinator resolution for live Premier seasons and calibration boundaries.</li>
            <li>Real-time FACEIT ELO ingestion, player tiers, and match performance breakdown.</li>
            <li>Full item classification, wear metrics, and pricing heuristics for Steam CS2 inventories.</li>
            <li>Direct match telemetry parsing and share code archiving.</li>
          </ul>

          <p className="pt-4 text-xs text-gray-500">
            Designed and maintained as an independent CS2 analytics platform.
          </p>
        </section>
      </div>

      <Footer />
    </main>
  );
}
