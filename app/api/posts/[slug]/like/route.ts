import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Post } from "@/lib/models/Post";
import { Like } from "@/lib/models/Like";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await connectDB();
    const post = await Post.findOne({ slug, status: "published" });
    if (!post) {
      return NextResponse.json(
        { error: "Post not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }
    const fingerprint =
      request.headers.get("x-fingerprint") ??
      request.cookies.get("like_fp")?.value ??
      "anonymous";
    const existing = await Like.findOne({ postId: post._id, fingerprint });
    if (existing) {
      const updated = await Post.findById(post._id).select("likeCount").lean();
      return NextResponse.json({ likeCount: (updated as any)?.likeCount ?? (post as any).likeCount });
    }
    await Like.create({ postId: post._id, fingerprint });
    const updated = await Post.findByIdAndUpdate(
      post._id,
      { $inc: { likeCount: 1 } },
      { new: true }
    ).select("likeCount");
    return NextResponse.json({ likeCount: (updated as any)?.likeCount ?? 0 });
  } catch (e) {
    console.error("POST /api/posts/[slug]/like", e);
    return NextResponse.json(
      { error: "Failed to like post", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
