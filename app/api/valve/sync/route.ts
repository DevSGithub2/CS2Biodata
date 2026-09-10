import { NextRequest, NextResponse } from "next/server";
import { syncValveMatches } from "@/lib/services/valve-sync";
import dbConnect from "@/lib/db";
import { ValveMatch } from "@/lib/models/valve";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { steamId, authCode, shareCode } = body;

    if (!steamId || !authCode || !shareCode) {
      return NextResponse.json(
        { error: "Missing steamId, authCode (Authentication Code), or shareCode (Recent Match Code)" },
        { status: 400 }
      );
    }

    const result = await syncValveMatches(steamId, authCode.trim(), shareCode.trim());
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    console.error("Sync API error:", err);
    return NextResponse.json({ error: err.message || "Failed to sync Valve matches" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const steamId = searchParams.get("steamId");

    if (!steamId) {
      return NextResponse.json({ error: "steamId is required" }, { status: 400 });
    }

    const matches = await ValveMatch.find({ playerSteamIds: { $in: [steamId] } })
      .sort({ matchTime: -1 })
      .limit(30)
      .lean();

    return NextResponse.json({ matches });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
