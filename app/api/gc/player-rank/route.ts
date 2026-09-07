import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import * as Sentry from "@sentry/nextjs";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const steamId = searchParams.get("steamId");

  if (!steamId) {
    return NextResponse.json({ error: "steamId is required" }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const record = await client.db("cs2biodata").collection("gc_ranks").findOne({ steamId });

    if (!record) {
      return NextResponse.json({
        status: "pending_sync",
        message: "Rank telemetry is queued for GC daemon inspection.",
        steamId,
      });
    }

    return NextResponse.json({ success: true, data: record });
  } catch (error: any) {
    Sentry.captureException(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
