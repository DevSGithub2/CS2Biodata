import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const steamId = req.cookies.get("cs2_session_steamid")?.value;

  const noCacheHeaders = {
    "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    "Pragma": "no-cache"
  };

  if (!steamId) {
    return NextResponse.json({ authenticated: false, user: null }, { headers: noCacheHeaders });
  }

  try {
    const client = await clientPromise;
    const db = client.db("cs2biodata");
    const user = await db.collection("users").findOne({ steamId });

    return NextResponse.json(
      {
        authenticated: true,
        user: user || { steamId, personaName: "Player" },
      },
      { headers: noCacheHeaders }
    );
  } catch (err) {
    return NextResponse.json(
      {
        authenticated: true,
        user: { steamId, personaName: "Player" },
      },
      { headers: noCacheHeaders }
    );
  }
}
