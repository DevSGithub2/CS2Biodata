import { NextResponse } from "next/server";

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing match share code" }, { status: 400 });
  }

  try {
    return NextResponse.json({
      status: "queued",
      code,
      message: "GC resolution request submitted",
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
