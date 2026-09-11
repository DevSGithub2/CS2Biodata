import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  
  // 1. Delete all cookies received on this request
  for (const c of cookieStore.getAll()) {
    cookieStore.delete(c.name);
  }
  cookieStore.delete("cs2_session_steamid");
  cookieStore.delete("steam_session");

  // 2. Redirect to canonical host
  const host = req.headers.get("host") || "";
  const baseUrl = host.includes("localhost") ? "http://localhost:3000" : "https://www.cs2biotdata.me";
  const target = new URL("/", baseUrl);
  target.searchParams.set("logout", Date.now().toString());

  const response = NextResponse.redirect(target, { status: 302 });

  // 3. Clear every hostname permutation
  const targets = ["cs2_session_steamid", "steam_session", "token", "credentials", "session"];
  const domains = [undefined, ".cs2biotdata.me", "cs2biotdata.me", "www.cs2biotdata.me"];

  for (const name of targets) {
    for (const d of domains) {
      response.cookies.set(name, "", {
        path: "/",
        domain: d,
        expires: new Date(0),
        maxAge: 0,
        httpOnly: true,
        secure: !host.includes("localhost"),
        sameSite: "lax",
      });
      response.cookies.set(name, "", {
        path: "/",
        domain: d,
        expires: new Date(0),
        maxAge: 0,
        httpOnly: false,
        secure: !host.includes("localhost"),
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
