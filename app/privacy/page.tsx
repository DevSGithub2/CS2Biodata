import React from "react";
import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";
import { TacticalGrid } from "@/components/ui/TacticalGrid";

export const metadata = {
  title: "Privacy Policy | CS2BioData",
  description: "CS2BioData Privacy Policy and telemetry data handling protocols.",
};

export default function PrivacyPage() {
  return (
    <main className="relative min-h-screen bg-[#04070a] text-gray-200 overflow-x-hidden font-mono flex flex-col justify-between">
      <TacticalGrid />
      <Navbar />

      <div className="relative z-10 max-w-4xl w-full mx-auto px-6 py-12 flex-1 space-y-8">
        <div className="border-b border-white/[0.08] pb-6">
          <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-white uppercase">
            Privacy Policy
          </h1>
          <p className="text-xs text-gray-400 mt-2">LAST REVISED: SEPTEMBER 2026 // PROTOCOL SEC-PRIVACY</p>
        </div>

        <section className="space-y-4 text-sm text-gray-300 leading-relaxed">
          <h2 className="text-base font-bold text-cyan-400 uppercase tracking-wide">1. Public Telemetry Ingestion</h2>
          <p>
            CS2BioData collects public statistical information directly from Valve Corporation via Steam Web APIs and Game Coordinator protocols. We only process public Steam IDs, competitive ratings, match stats, and inventory assets entered into our search queries.
          </p>

          <h2 className="text-base font-bold text-cyan-400 uppercase tracking-wide">2. Data Caching</h2>
          <p>
            Public records (including SteamID64, persona handles, rank tiers, and inventory metadata) are temporarily cached in high-speed buffers to minimize upstream rate limits and enhance platform performance. We do not store or process passwords, credentials, or private account data.
          </p>

          <h2 className="text-base font-bold text-cyan-400 uppercase tracking-wide">3. Cookies &amp; Storage</h2>
          <p>
            This application uses browser local storage exclusively for interface states, such as active category filters and display preferences. We do not use third-party tracking beacons.
          </p>

          <h2 className="text-base font-bold text-cyan-400 uppercase tracking-wide">4. External Services</h2>
          <p>
            Profiles contain external hyperlinks to official Valve community portals and third-party competitive platforms. We have no authority over external sites and assume no liability for their data practices.
          </p>
        </section>
      </div>

      <Footer />
    </main>
  );
}
