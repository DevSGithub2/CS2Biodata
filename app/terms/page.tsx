import React from "react";
import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";
import { TacticalGrid } from "@/components/ui/TacticalGrid";

export const metadata = {
  title: "Terms of Service | CS2BioData",
  description: "Terms and conditions governing the CS2BioData telemetry platform.",
};

export default function TermsPage() {
  return (
    <main className="relative min-h-screen bg-[#04070a] text-gray-200 overflow-x-hidden font-mono flex flex-col justify-between">
      <TacticalGrid />
      <Navbar />

      <div className="relative z-10 max-w-4xl w-full mx-auto px-6 py-12 flex-1 space-y-8">
        <div className="border-b border-white/[0.08] pb-6">
          <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-white uppercase">
            Terms of Service
          </h1>
          <p className="text-xs text-gray-400 mt-2">LAST REVISED: SEPTEMBER 2026 // PROTOCOL SEC-TERMS</p>
        </div>

        <section className="space-y-4 text-sm text-gray-300 leading-relaxed">
          <h2 className="text-base font-bold text-cyan-400 uppercase tracking-wide">1. Acceptance of Terms</h2>
          <p>
            By querying, browsing, or using CS2BioData, you agree to these Terms of Service and affirm full compliance with all relevant international and local laws.
          </p>

          <h2 className="text-base font-bold text-cyan-400 uppercase tracking-wide">2. Valve Corporation Disclaimer</h2>
          <p>
            Counter-Strike, CS2, Counter-Strike 2, and the Valve logo are trademarks and/or registered trademarks of Valve Corporation. CS2BioData is an independent statistics analysis utility and is not affiliated with, endorsed by, or operated by Valve Corporation.
          </p>

          <h2 className="text-base font-bold text-cyan-400 uppercase tracking-wide">3. Prohibited Use</h2>
          <p>
            You agree not to systematically scrape, crawl, overwhelm, or attempt denial-of-service vectors against our API endpoints. Automated abuse may trigger immediate system-level blocking.
          </p>

          <h2 className="text-base font-bold text-cyan-400 uppercase tracking-wide">4. Disclaimer of Warranty</h2>
          <p>
            All player dossiers, rank statistics, market pricing models, and combat metrics are provided &quot;as-is&quot; for informational and analytical purposes only. CS2BioData makes no warranties regarding the absolute accuracy of live third-party data.
          </p>
        </section>
      </div>

      <Footer />
    </main>
  );
}
