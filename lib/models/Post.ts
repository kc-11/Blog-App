import mongoose, { model, models } from "mongoose";
import { contentPlain } from "@/lib/utils/contentPlain";
import { readingTimeMinutes } from "@/lib/utils/readingTime";
import { connectDB } from "@/lib/db";
import { Tag } from "./Tag";

const postSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    content: { type: mongoose.Schema.Types.Mixed, required: true },
    contentPlain: { type: String, default: "" },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    publishedAt: { type: Date, default: null },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
    category: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    ogImage: { type: String, default: "" },
    readingTimeMinutes: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// slug index is already created by unique: true on the field
postSchema.index({ status: 1, publishedAt: -1 });
postSchema.index({ tags: 1 });

postSchema.pre("save", function (next) {
  if (this.isModified("content")) {
    this.contentPlain = contentPlain(this.content);
    this.readingTimeMinutes = readingTimeMinutes(this.contentPlain);
  }
  next();
});

export const Post = models.Post ?? model("Post", postSchema);

export interface ListPostsOptions {
  tag?: string;
  category?: string;
  q?: string;
  page?: number;
  limit?: number;
  status?: "draft" | "published";
}

export async function getPublishedPosts(options: ListPostsOptions = {}) {
  await connectDB();
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(50, Math.max(1, options.limit ?? 10));
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { status: "published" };
  if (options.tag) {
    const tag = await Tag.findOne({ slug: options.tag }).select("_id").lean();
    if (tag) filter["tags"] = (tag as any)._id;
  }
  if (options.category) filter["category"] = options.category;
  if (options.q && options.q.trim()) {
    const q = options.q.trim();
    filter["$or"] = [
      { title: new RegExp(q, "i") },
      { description: new RegExp(q, "i") },
      { contentPlain: new RegExp(q, "i") },
    ];
  }

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("tags", "slug name")
      .lean(),
    Post.countDocuments(filter),
  ]);

  return { posts, total, page };
}

export async function getPostBySlug(slug: string, publishedOnly = true) {
  await connectDB();
  const filter: Record<string, unknown> = { slug };
  if (publishedOnly) {
    filter["status"] = "published";
  }
  return Post.findOne(filter).populate("tags", "slug name").lean();
}

export async function getPostById(id: string) {
  await connectDB();
  return Post.findById(id).populate("tags", "slug name").lean();
}

export async function getAllPublishedSlugs(): Promise<{ slug: string; updatedAt: string }[]> {
  await connectDB();
  const list = await Post.find({ status: "published" })
    .select("slug updatedAt")
    .lean();
  return list.map((p) => ({ slug: p.slug, updatedAt: p.updatedAt?.toISOString() ?? "" }));
}
