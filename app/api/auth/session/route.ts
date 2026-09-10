import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { User } from "@/lib/models/user";

export async function GET(req: NextRequest) {
  const steamId = req.cookies.get("cs2_session_steamid")?.value;

  if (!steamId) {
    return NextResponse.json({ authenticated: false });
  }

  await dbConnect();
  const user = await User.findOne({ steamId }).lean();

  return NextResponse.json({
    authenticated: true,
    user: user || { steamId },
  });
}

// Stash pending auth codes if user is not logged in yet
export async function POST(req: NextRequest) {
  const { authCode, shareCode } = await req.json();

  const res = NextResponse.json({ success: true });
  if (authCode) {
    res.cookies.set("pending_game_auth", authCode.trim(), {
      path: "/",
      maxAge: 600, // 10 minutes
    });
  }
  if (shareCode) {
    res.cookies.set("pending_share_code", shareCode.trim(), {
      path: "/",
      maxAge: 600,
    });
  }

  return res;
}
