import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Always redirect to www canonical domain with cache buster
  const redirectUrl = new URL("https://www.cs2biotdata.me/");
  redirectUrl.searchParams.set("signed_out", Date.now().toString());

  const response = NextResponse.redirect(redirectUrl, 302);

  const cookieNames = [
    "cs2_session_steamid",
    "steam_session",
    "better-auth.session_token",
    "session",
    "token"
  ];

  // Specific host targets where the cookie was observed in DevTools
  const domains = [
    "www.cs2biotdata.me",
    ".cs2biotdata.me",
    "cs2biotdata.me",
    undefined
  ];

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

  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  return response;
}

export async function POST(req: NextRequest) {
  return GET(req);
}
