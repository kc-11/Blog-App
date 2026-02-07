import type { MetadataRoute } from "next";
import { getAllPublishedSlugs } from "@/lib/models/Post";
import { connectDB } from "@/lib/db";
import { Tag } from "@/lib/models/Tag";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDB();
  const [posts, tags] = await Promise.all([
    getAllPublishedSlugs(),
    Tag.find().select("slug").lean(),
  ]);

  const postEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const tagEntries: MetadataRoute.Sitemap = tags.map((t) => ({
    url: `${BASE_URL}/tag/${t.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily" as const, priority: 1 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
    ...postEntries,
    ...tagEntries,
  ];
}
