import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST() {
  const cookieStore = await cookies();
  
  // 1. Delete all cookies currently received by the server
  for (const c of cookieStore.getAll()) {
    cookieStore.delete(c.name);
  }

  // 2. Explicitly target session cookies
  cookieStore.delete("cs2_session_steamid");
  cookieStore.delete("steam_session");

  const response = NextResponse.json({ success: true, timestamp: Date.now() });

  // 3. Force explicit zero-age headers for both host-only and apex domains
  const cookiesToKill = ["cs2_session_steamid", "steam_session"];
  for (const name of cookiesToKill) {
    response.cookies.set(name, "", { path: "/", maxAge: 0, expires: new Date(0) });
    response.cookies.set(name, "", { path: "/", domain: "cs2biotdata.me", maxAge: 0, expires: new Date(0) });
    response.cookies.set(name, "", { path: "/", domain: ".cs2biotdata.me", maxAge: 0, expires: new Date(0) });
  }

  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  return response;
}
