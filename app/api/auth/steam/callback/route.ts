
function getBaseUrl(req: NextRequest): string {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "https";
  if (host && !host.includes("localhost")) {
    return `${proto}://${host}`;
  }
  return process.env.NEXT_PUBLIC_APP_URL || "https://www.cs2biotdata.me";
}

import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const claimedId = url.searchParams.get("openid.claimed_id");

  if (!claimedId) {
    return NextResponse.redirect(new URL("/?error=auth_failed", getBaseUrl(req)));
  }

  const steamIdMatches = claimedId.match(/\/id\/(\d+)/);
  const steamId = steamIdMatches ? steamIdMatches[1] : null;

  if (!steamId) {
    return NextResponse.redirect(new URL("/?error=invalid_steam_id", getBaseUrl(req)));
  }

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

  // Save/Upsert directly to MongoDB Atlas
  try {
    const client = await clientPromise;
    const db = client.db("cs2biodata");
    await db.collection("users").updateOne(
      { steamId },
      {
        $set: {
          steamId,
          personaName,
          avatar,
          profileUrl,
          lastLogin: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
          hasAuthCode: false,
        }
      },
      { upsert: true }
    );
  } catch (dbErr) {
    console.error("Failed to save user in MongoDB:", dbErr);
  }

  const response = NextResponse.redirect(new URL(`/player/${steamId}`, getBaseUrl(req)));

  response.cookies.set("cs2_session_steamid", steamId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return response;
}
