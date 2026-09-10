import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { User } from "@/lib/models/user";
import { ValveToken } from "@/lib/models/valve";
import { syncValveMatches } from "@/lib/services/valve-sync";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const claimedId = url.searchParams.get("openid.claimed_id");

  if (!claimedId) {
    return NextResponse.redirect(new URL("/?error=auth_failed", req.url));
  }

  // Steam claimed_id format: https://steamcommunity.com/openid/id/76561198xxxxxxxx
  const steamIdMatches = claimedId.match(/\/id\/(\d+)/);
  const steamId = steamIdMatches ? steamIdMatches[1] : null;

  if (!steamId) {
    return NextResponse.redirect(new URL("/?error=invalid_steam_id", req.url));
  }

  await dbConnect();

  // Fetch Steam Profile Info via Steam API
  let personaName = "CS2 Operative";
  let avatar = "";
  let profileUrl = `https://steamcommunity.com/profiles/${steamId}`;

  const apiKey = process.env.STEAM_API_KEY;
  if (apiKey) {
    try {
      const summaryRes = await fetch(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId}`
      );
      const summaryData = await summaryRes.json();
      const player = summaryData?.response?.players?.[0];
      if (player) {
        personaName = player.personaname;
        avatar = player.avatarfull || player.avatar;
        profileUrl = player.profileurl;
      }
    } catch (e) {
      console.error("Steam Profile Fetch error:", e);
    }
  }

  // Upsert user into database
  await User.findOneAndUpdate(
    { steamId },
    {
      personaName,
      avatar,
      profileUrl,
      lastLogin: new Date(),
    },
    { upsert: true, new: true }
  );

  // Check if user had a pending Game Auth Code in cookies before signing in
  const pendingAuth = req.cookies.get("pending_game_auth")?.value;
  const pendingShare = req.cookies.get("pending_share_code")?.value || "";

  if (pendingAuth) {
    try {
      await syncValveMatches(steamId, pendingAuth, pendingShare);
      await User.findOneAndUpdate({ steamId }, { hasAuthCode: true });
    } catch (err) {
      console.error("Auto-sync pending code failed:", err);
    }
  }

  // Set session cookie and redirect directly to their player stat page
  const response = NextResponse.redirect(new URL(`/player/${steamId}`, req.url));

  response.cookies.set("cs2_session_steamid", steamId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  // Clear pending token cookies
  response.cookies.delete("pending_game_auth");
  response.cookies.delete("pending_share_code");

  return response;
}
