import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function handleSignOut(req: NextRequest) {
  // Construct clean target url on the canonical www host
  const targetUrl = new URL("/", "https://www.cs2biotdata.me");
  targetUrl.searchParams.set("ts", Date.now().toString());

  const res = NextResponse.redirect(targetUrl, { status: 302 });

  const cookieNames = [
    "cs2_session_steamid",
    "steam_session",
    "better-auth.session_token",
    "session",
    "token",
    "credentials"
  ];

  // Expire cookies on every hostname variant
  const domains = ["", "cs2biotdata.me", ".cs2biotdata.me", "www.cs2biotdata.me", ".www.cs2biotdata.me"];

  for (const name of cookieNames) {
    for (const d of domains) {
      const opts: any = {
        path: "/",
        expires: new Date(0),
        maxAge: 0,
        httpOnly: true,
        secure: true,
        sameSite: "lax" as const,
      };
      if (d) opts.domain = d;
      res.cookies.set(name, "", opts);

      // Non-httpOnly variant
      opts.httpOnly = false;
      res.cookies.set(name, "", opts);
    }
  }

  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
  res.headers.set("Pragma", "no-cache");
  return res;
}

export async function GET(req: NextRequest) {
  return handleSignOut(req);
}

export async function POST(req: NextRequest) {
  return handleSignOut(req);
}
