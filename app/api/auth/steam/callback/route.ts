import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const searchParams = url.searchParams;

  const validationParams = new URLSearchParams();
  searchParams.forEach((value, key) => {
    validationParams.append(key, value);
  });
  validationParams.set("openid.mode", "check_authentication");

  try {
    const steamVerifyRes = await fetch("https://steamcommunity.com/openid/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: validationParams.toString(),
      cache: "no-store",
    });

    const responseText = await steamVerifyRes.text();
    const isValid = responseText.includes("is_valid:true");

    if (!isValid) {
      return NextResponse.redirect(new URL("/?auth=failed", req.url));
    }

    const claimedId = searchParams.get("openid.claimed_id") || "";
    const match = claimedId.match(/\/id\/(\d+)$/);
    const steamId64 = match ? match[1] : null;

    if (!steamId64) {
      return NextResponse.redirect(new URL("/?auth=invalid_steam_id", req.url));
    }

    // Save to DB
    try {
      const client = await clientPromise;
      const db = client.db("cs2pulse");
      await db.collection("users").updateOne(
        { steamId64 },
        { 
          $set: { steamId64, lastLoginAt: new Date() }, 
          $setOnInsert: { createdAt: new Date(), role: "user" } 
        },
        { upsert: true }
      );
    } catch (e) {
      console.error("DB User save err:", e);
    }

    const host = req.headers.get("host") || "cs2pulse.live";
    const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
    const protocol = isLocal ? "http" : "https";
    const redirectUrl = `${protocol}://${host}/?q=${steamId64}`;

    const res = NextResponse.redirect(redirectUrl);

    // Explicit Cookie Configuration for Heroku HTTPS
    res.cookies.set("steam_session", steamId64, {
      httpOnly: false, // Accessible to client session checking
      secure: !isLocal,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return res;
  } catch (err: any) {
    console.error("OpenID verification error:", err);
    return NextResponse.redirect(new URL("/?auth=error", req.url));
  }
}
