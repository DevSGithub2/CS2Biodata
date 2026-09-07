import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const steamId = req.cookies.get("steam_session")?.value;

  if (!steamId) {
    return NextResponse.json({ authenticated: false, steamId: null, profile: null });
  }

  const apiKey = process.env.STEAM_API_KEY || "242B8BD87C9C03CC0DC885D34003605D";
  let profile = {
    personaname: "Player",
    avatar: "https://avatars.steamstatic.com/0249d253b6e245d84ad20d00f192cb0a6677dc12_full.jpg",
  };

  try {
    const res = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId}`,
      { cache: "no-store" }
    );
    if (res.ok) {
      const data = await res.json();
      const p = data.response?.players?.[0];
      if (p) {
        profile = {
          personaname: p.personaname || "Player",
          avatar: p.avatarfull || p.avatarmedium || p.avatar || profile.avatar,
        };
      }
    }
  } catch (err) {
    console.error("Steam profile fetch error:", err);
  }

  return NextResponse.json({
    authenticated: true,
    steamId,
    profile,
  });
}
