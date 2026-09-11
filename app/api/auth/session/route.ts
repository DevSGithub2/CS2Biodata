import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const steamId = req.cookies.get("cs2_session_steamid")?.value;

  if (!steamId) {
    return NextResponse.json(
      { authenticated: false },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
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
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err) {
    return NextResponse.json(
      {
        authenticated: true,
        user: { steamId, personaName: "Player" },
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }
}
