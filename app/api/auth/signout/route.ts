import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set("cs2_session_steamid", "", {
    path: "/",
    expires: new Date(0),
    maxAge: 0,
    httpOnly: true,
  });

  response.cookies.set("cs2_session_steamid", "", {
    path: "/",
    domain: ".cs2biotdata.me",
    expires: new Date(0),
    maxAge: 0,
    httpOnly: true,
  });

  for (const name of ["token", "credentials", "session", "better-auth.session_token"]) {
    response.cookies.set(name, "", { path: "/", expires: new Date(0), maxAge: 0 });
    response.cookies.set(name, "", { path: "/", domain: ".cs2biotdata.me", expires: new Date(0), maxAge: 0 });
  }

  return response;
}
