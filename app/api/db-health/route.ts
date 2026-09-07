import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    await db.command({ ping: 1 });
    return NextResponse.json({ status: "connected", database: db.databaseName });
  } catch (error: any) {
    return NextResponse.json({ status: "disconnected", error: error.message }, { status: 500 });
  }
}
