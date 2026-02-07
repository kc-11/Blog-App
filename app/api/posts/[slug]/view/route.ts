import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Post } from "@/lib/models/Post";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await connectDB();
    const result = await Post.findOneAndUpdate(
      { slug, status: "published" },
      { $inc: { viewCount: 1 } },
      { new: true }
    ).select("viewCount");
    if (!result) {
      return NextResponse.json(
        { error: "Post not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }
    return NextResponse.json({ viewCount: result.viewCount });
  } catch (e) {
    console.error("POST /api/posts/[slug]/view", e);
    return NextResponse.json(
      { error: "Failed to increment view", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
