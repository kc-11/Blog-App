import { NextRequest, NextResponse } from "next/server";
import { getPublishedPosts } from "@/lib/models/Post";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get("tag") ?? undefined;
    const category = searchParams.get("category") ?? undefined;
    const q = searchParams.get("q") ?? undefined;
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "10", 10);

    const result = await getPublishedPosts({ tag, category, q, page, limit });
    return NextResponse.json(result);
  } catch (e) {
    console.error("GET /api/posts", e);
    return NextResponse.json(
      { error: "Failed to fetch posts", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
