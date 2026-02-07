import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Tag } from "@/lib/models/Tag";

export async function GET() {
  try {
    await connectDB();
    const tags = await Tag.find().sort({ name: 1 }).lean();
    return NextResponse.json(tags);
  } catch (e) {
    console.error("GET /api/tags", e);
    return NextResponse.json(
      { error: "Failed to fetch tags", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
