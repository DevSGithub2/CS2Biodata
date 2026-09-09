import { NextResponse } from "next/server";
import { decodeMatchShareCode } from "@/lib/services/matchCodeDecoder";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { shareCode, steamId64 } = body;

    if (!shareCode) {
      return NextResponse.json({ error: "Missing shareCode" }, { status: 400 });
    }

    const decoded = decodeMatchShareCode(shareCode.trim());
    if (!decoded) {
      return NextResponse.json({ error: "Invalid CS2 share code format" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("cs2biodata");

    // Upsert into matches collection
    await db.collection("matches").updateOne(
      { matchId: decoded.matchId },
      {
        $set: {
          matchId: decoded.matchId,
          shareCode: shareCode.trim(),
          reservationId: decoded.reservationId,
          tvPort: decoded.tvPort,
          submittedBy: steamId64 || "anonymous",
          status: "queued_for_telemetry",
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      matchId: decoded.matchId,
      status: "queued_for_telemetry"
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
