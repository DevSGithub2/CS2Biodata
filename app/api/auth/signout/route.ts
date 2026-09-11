import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

async function executeSignOut(req: NextRequest) {
  const cookieStore = await cookies();
  
  // Wipe all cookies present on request
  for (const c of cookieStore.getAll()) {
    cookieStore.delete(c.name);
  }

  // Determine current host so redirect lands on whatever domain the user is currently on
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "www.cs2biotdata.me";
  const proto = req.headers.get("x-forwarded-proto") || "https";
  const targetUrl = new URL("/", `${proto}://${host}`);
  targetUrl.searchParams.set("signed_out", Date.now().toString());

  const response = NextResponse.redirect(targetUrl, 303);

  const cookieNames = [
    "cs2_session_steamid",
    "steam_session",
    "better-auth.session_token",
    "session",
    "token",
    "credentials"
  ];

  // Expire cookies for all host and subdomain combinations
  const targetDomains = [
    undefined,
    "www.cs2biotdata.me",
    ".www.cs2biotdata.me",
    "cs2biotdata.me",
    ".cs2biotdata.me"
  ];

  for (const name of cookieNames) {
    for (const domain of targetDomains) {
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
  response.headers.set("Pragma", "no-cache");

  return response;
}

export async function GET(req: NextRequest) {
  return executeSignOut(req);
}

export async function POST(req: NextRequest) {
  return executeSignOut(req);
}
