import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Post } from "@/lib/models/Post";
import { Tag } from "@/lib/models/Tag";
import { slugify } from "@/lib/utils/slugify";

const createPostSchema = z.object({
  slug: z.string().min(1).max(200).optional(),
  title: z.string().min(1).max(500),
  description: z.string().max(1000).optional(),
  content: z.unknown(),
  status: z.enum(["draft", "published"]).optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().max(100).optional(),
  coverImage: z.string().url().optional().or(z.literal("")),
  ogImage: z.string().url().optional().or(z.literal("")),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") ?? undefined;
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "20", 10);
    const skip = (page - 1) * limit;

    await connectDB();
    const filter = status ? { status: status as "draft" | "published" } : {};
    const [posts, total] = await Promise.all([
      Post.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit).populate("tags", "slug name").lean(),
      Post.countDocuments(filter),
    ]);
    return NextResponse.json({ posts, total, page });
  } catch (e) {
    console.error("GET /api/admin/posts", e);
    return NextResponse.json(
      { error: "Failed to list posts", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createPostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", code: "VALIDATION_ERROR", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const data = parsed.data;
    await connectDB();

    const slug = data.slug?.trim() ? slugify(data.slug) : slugify(data.title);
    const existing = await Post.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { error: "A post with this slug already exists", code: "SLUG_EXISTS" },
        { status: 400 }
      );
    }

    const tagIds: import("mongoose").Types.ObjectId[] = [];
    if (data.tags?.length) {
      for (const t of data.tags) {
        const name = typeof t === "string" ? t : (t as { name?: string }).name ?? "";
        const slugTag = slugify(name);
        let tag = await Tag.findOne({ slug: slugTag });
        if (!tag) tag = await Tag.create({ slug: slugTag, name: name || slugTag });
        tagIds.push(tag._id);
      }
    }

    const publishedAt = data.status === "published" ? new Date() : null;
    const post = await Post.create({
      slug,
      title: data.title,
      description: data.description ?? "",
      content: data.content ?? { type: "doc", content: [] },
      status: data.status ?? "draft",
      publishedAt,
      tags: tagIds,
      category: data.category ?? "",
      coverImage: data.coverImage ?? "",
      ogImage: data.ogImage ?? "",
    });

    await updateTagPostCounts(tagIds, 1);
    const created = await Post.findById(post._id).populate("tags", "slug name").lean();
    return NextResponse.json(created);
  } catch (e) {
    console.error("POST /api/admin/posts", e);
    return NextResponse.json(
      { error: "Failed to create post", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

async function updateTagPostCounts(tagIds: import("mongoose").Types.ObjectId[], delta: number) {
  if (tagIds.length === 0) return;
  await Tag.updateMany({ _id: { $in: tagIds } }, { $inc: { postCount: delta } });
}
