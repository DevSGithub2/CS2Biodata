import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  const steamId = req.cookies.get("cs2_session_steamid")?.value;

  if (!steamId) {
    return NextResponse.json({ authenticated: false });
  }

  try {
    const client = await clientPromise;
    const db = client.db("cs2biodata");
    const user = await db.collection("users").findOne({ steamId });

    return NextResponse.json({
      authenticated: true,
      user: user || { steamId, personaName: "Player" },
    });
  } catch (err) {
    return NextResponse.json({
      authenticated: true,
      user: { steamId, personaName: "Player" },
    });
  }
}
