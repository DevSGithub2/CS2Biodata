import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category, rating, message, email } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Feedback message cannot be empty." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("cs2pulse");

    await db.collection("feedback").insertOne({
      category: category || "Feedback",
      rating: Number(rating) || 5,
      message: message.trim(),
      email: email ? String(email).trim() : null,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Feedback submission error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to save feedback." },
      { status: 500 }
    );
  }
}
