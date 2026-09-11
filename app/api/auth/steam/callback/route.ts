import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const claimedId = url.searchParams.get("openid.claimed_id");

  const baseUrl = "https://www.cs2biotdata.me";

  if (!claimedId) {
    return NextResponse.redirect(new URL("/?error=auth_failed", baseUrl));
  }

  const steamIdMatches = claimedId.match(/\/id\/(\d+)/);
  const steamId = steamIdMatches ? steamIdMatches[1] : null;

  if (!steamId) {
    return NextResponse.redirect(new URL("/?error=invalid_steam_id", baseUrl));
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

  const response = NextResponse.redirect(new URL(`/player/${steamId}`, baseUrl));

  // Set shared cookie across both cs2biotdata.me and www.cs2biotdata.me
  const cookieOpts = {
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };

  response.cookies.set("cs2_session_steamid", steamId, cookieOpts);
  response.cookies.set("cs2_session_steamid", steamId, { ...cookieOpts, domain: ".cs2biotdata.me" });

  return response;
}
