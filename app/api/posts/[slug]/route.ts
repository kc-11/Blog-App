import { NextRequest, NextResponse } from "next/server";
import { getPostBySlug } from "@/lib/models/Post";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const post = await getPostBySlug(slug, true);
    if (!post) {
      return NextResponse.json(
        { error: "Post not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }
    return NextResponse.json(post);
  } catch (e) {
    console.error("GET /api/posts/[slug]", e);
    return NextResponse.json(
      { error: "Failed to fetch post", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
