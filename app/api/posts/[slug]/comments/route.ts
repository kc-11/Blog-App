import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Post } from "@/lib/models/Post";
import { getApprovedCommentsByPostId } from "@/lib/models/Comment";
import { Comment } from "@/lib/models/Comment";
import { connectDB } from "@/lib/db";

const createCommentSchema = z.object({
  authorName: z.string().min(1).max(200),
  authorEmail: z.string().email(),
  body: z.string().min(1).max(5000),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    // Optimize: fetch only _id, don't populate tags or fetch content
    await connectDB();
    const post = await Post.findOne({ slug, status: "published" }).select("_id").lean();
    if (!post) {
      return NextResponse.json(
        { error: "Post not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }
    const comments = await getApprovedCommentsByPostId((post as any)._id.toString());
    return NextResponse.json(comments);
  } catch (e) {
    console.error("GET /api/posts/[slug]/comments", e);
    return NextResponse.json(
      { error: "Failed to fetch comments", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    // Optimize: fetch only _id
    await connectDB();
    const post = await Post.findOne({ slug, status: "published" }).select("_id").lean();
    if (!post) {
      return NextResponse.json(
        { error: "Post not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }
    const body = await request.json();
    const parsed = createCommentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", code: "VALIDATION_ERROR", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    await connectDB();
    const comment = await Comment.create({
      postId: (post as any)._id,
      authorName: parsed.data.authorName,
      authorEmail: parsed.data.authorEmail,
      body: parsed.data.body,
      status: "approved",
    });

    // Revalidate the blog post page so the new comment appears immediately
    revalidatePath(`/blog/${slug}`);

    return NextResponse.json({
      data: {
        _id: comment._id,
        authorName: comment.authorName,
        body: comment.body,
        status: comment.status,
        createdAt: comment.createdAt,
      },
    });
  } catch (e) {
    console.error("POST /api/posts/[slug]/comments", e);
    return NextResponse.json(
      { error: "Failed to create comment", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
