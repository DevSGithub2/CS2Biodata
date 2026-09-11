import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true, timestamp: Date.now() });

  const cookieNames = [
    "cs2_session_steamid",
    "steam_session",
    "better-auth.session_token",
    "session",
    "token",
    "credentials"
  ];

  const domains = [undefined, "cs2biotdata.me", ".cs2biotdata.me", "www.cs2biotdata.me"];

  for (const name of cookieNames) {
    for (const domain of domains) {
      response.cookies.set(name, "", {
        path: "/",
        domain: domain,
        expires: new Date(0),
        maxAge: 0,
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      });
      // Fallback for non-httpOnly variants
      response.cookies.set(name, "", {
        path: "/",
        domain: domain,
        expires: new Date(0),
        maxAge: 0,
        httpOnly: false,
        secure: true,
        sameSite: "lax",
      });
    }
  }

  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}
