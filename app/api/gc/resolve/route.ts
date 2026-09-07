import { NextResponse } from "next/server";
import { gcBot } from "@/lib/gc-bot";
import SteamID from "steamid";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const steamId = searchParams.get("steamId");
  const shareCode = searchParams.get("shareCode");

  if (!gcBot.isReady) {
    return NextResponse.json(
      { error: "Game Coordinator bot is initializing or offline." },
      { status: 503 }
    );
  }

  // 1. Resolve Match Download URL via shareCode if provided
  if (shareCode) {
    return new Promise((resolve) => {
      gcBot.csgo.requestGame(shareCode);

      const timeout = setTimeout(() => {
        resolve(
          NextResponse.json({ error: "Replay request timed out from Valve GC." }, { status: 504 })
        );
      }, 8000);

      gcBot.csgo.once("matchList", (matches) => {
        clearTimeout(timeout);
        return resolve(NextResponse.json({ success: true, matches }));
      });
    });
  }

  // 2. Resolve Live Player Profile (Premier / Comp Rank)
  if (steamId) {
    return new Promise((resolve) => {
      try {
        const sid = new SteamID(steamId);
        gcBot.csgo.requestPlayersProfile(sid.getSteamID64(), (profile: any) => {
          return resolve(NextResponse.json({ success: true, profile }));
        });
      } catch (err: any) {
        return resolve(NextResponse.json({ error: err.message }, { status: 400 }));
      }
    });
  }

  return NextResponse.json({ error: "Missing steamId or shareCode parameter." }, { status: 400 });
}
