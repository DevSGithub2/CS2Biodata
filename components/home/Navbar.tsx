"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Trophy, Search, CheckCircle2 } from "lucide-react";
import { TacticalLogo } from "@/components/ui/TacticalLogo";

export function Navbar() {
        const handleSignOut = async () => {
    try {
      const res = await fetch("/api/auth/signout", {
        method: "POST",
        credentials: "include",
        headers: { "Cache-Control": "no-cache" },
      });
      await res.json().catch(() => ({}));
    } catch (e) {
      console.error("Signout request failed:", e);
    }
    setUser(null);
    window.location.replace("/?signed_out=" + Date.now());
  };

  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [user, setUser] = useState<form action="/api/auth/signout" method="POST" className="inline m-0 p-0">
  <button
    type="submit"
    className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-red-950/60 border border-red-800/80 text-red-300 hover:bg-red-900 transition-colors cursor-pointer inline-flex items-center"
  >
    Sign Out
  </button>
</form>
            </div>
          ) : (
            <a
              href="/api/auth/steam/login"
              className="flex items-center gap-2 rounded-lg bg-[#1a243d] border border-sky-500/30 px-3.5 py-1.5 text-xs font-bold text-sky-400 hover:bg-sky-500/20 hover:border-sky-400 transition cursor-pointer"
            >
              <span className="tracking-widest">SIGN IN</span>
            </a>
          )}
        </div>
      
</div>
    </header>
  );
}
