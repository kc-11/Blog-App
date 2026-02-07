import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Post } from "@/lib/models/Post";
import { Tag } from "@/lib/models/Tag";
import { Comment } from "@/lib/models/Comment";
import { Like } from "@/lib/models/Like";
import { slugify } from "@/lib/utils/slugify";

const updatePostSchema = z.object({
  slug: z.string().min(1).max(200).optional(),
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(1000).optional(),
  content: z.unknown().optional(),
  status: z.enum(["draft", "published"]).optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().max(100).optional(),
  coverImage: z.string().url().optional().or(z.literal("")),
  ogImage: z.string().url().optional().or(z.literal("")),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid post ID", code: "INVALID_ID" },
        { status: 400 }
      );
    }
    await connectDB();
    const post = await Post.findById(id).populate("tags", "slug name").lean();
    if (!post) {
      return NextResponse.json(
        { error: "Post not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }
    return NextResponse.json(post);
  } catch (e) {
    console.error("GET /api/admin/posts/[id]", e);
    return NextResponse.json(
      { error: "Failed to fetch post", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid post ID", code: "INVALID_ID" },
        { status: 400 }
      );
    }
    const body = await request.json();
    const parsed = updatePostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", code: "VALIDATION_ERROR", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    await connectDB();
    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json(
        { error: "Post not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const data = parsed.data;
    const oldTagIds = post.tags ? post.tags.map((t: any) => t.toString()) : [];

    if (data.slug !== undefined) {
      const newSlug = data.slug.trim() ? slugify(data.slug) : slugify(post.title);
      const taken = await Post.findOne({ slug: newSlug, _id: { $ne: id } });
      if (taken) {
        return NextResponse.json(
          { error: "Slug already in use", code: "SLUG_EXISTS" },
          { status: 400 }
        );
      }
      post.slug = newSlug;
    }
    if (data.title !== undefined) post.title = data.title;
    if (data.description !== undefined) post.description = data.description;
    if (data.content !== undefined) post.content = data.content;
    if (data.status !== undefined) {
      post.status = data.status;
      if (data.status === "published" && !post.publishedAt) post.publishedAt = new Date();
      if (data.status === "draft") post.publishedAt = undefined;
    }
    if (data.category !== undefined) post.category = data.category;
    if (data.coverImage !== undefined) post.coverImage = data.coverImage;
    if (data.ogImage !== undefined) post.ogImage = data.ogImage;

    if (data.tags !== undefined) {
      const tagIds: import("mongoose").Types.ObjectId[] = [];
      for (const t of data.tags) {
        const name = typeof t === "string" ? t : (t as { name?: string }).name ?? "";
        const slugTag = slugify(name);
        let tag = await Tag.findOne({ slug: slugTag });
        if (!tag) tag = await Tag.create({ slug: slugTag, name: name || slugTag });
        tagIds.push(tag._id);
      }
      post.tags = tagIds;
      const newTagIds = tagIds.map((x) => x.toString());
      const toInc = newTagIds.filter((x) => !oldTagIds.includes(x));
      const toDec = oldTagIds.filter((x: string) => !newTagIds.includes(x));
      if (toInc.length) await Tag.updateMany({ _id: { $in: toInc } }, { $inc: { postCount: 1 } });
      if (toDec.length) await Tag.updateMany({ _id: { $in: toDec } }, { $inc: { postCount: -1 } });
    }

    await post.save();
    const updated = await Post.findById(id).populate("tags", "slug name").lean();
    return NextResponse.json(updated);
  } catch (e) {
    console.error("PATCH /api/admin/posts/[id]", e);
    return NextResponse.json(
      { error: "Failed to update post", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid post ID", code: "INVALID_ID" },
        { status: 400 }
      );
    }
    await connectDB();
    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json(
        { error: "Post not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }
    const tagIds = post.tags ?? [];
    await Post.findByIdAndDelete(id);
    await Comment.deleteMany({ postId: id });
    await Like.deleteMany({ postId: id });
    if (tagIds.length) {
      await Tag.updateMany({ _id: { $in: tagIds } }, { $inc: { postCount: -1 } });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/admin/posts/[id]", e);
    return NextResponse.json(
      { error: "Failed to delete post", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
