import { connectDB } from "@/lib/db";
import { Post } from "@/lib/models/Post";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const SITE_TITLE = "Blog";
const SITE_DESCRIPTION = "Personal and professional writing on technology, society, and ideas.";

export async function GET() {
  await connectDB();
  const posts = await Post.find({ status: "published" })
    .sort({ publishedAt: -1 })
    .limit(20)
    .select("slug title description contentPlain publishedAt updatedAt")
    .lean();

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${BASE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    ${posts
      .map(
        (p) => `
    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${BASE_URL}/blog/${p.slug}</link>
      <description>${escapeXml((p.description ?? p.contentPlain ?? "").slice(0, 500))}</description>
      <pubDate>${new Date((p.publishedAt ?? p.updatedAt) ?? Date.now()).toUTCString()}</pubDate>
      <guid isPermaLink="true">${BASE_URL}/blog/${p.slug}</guid>
    </item>`
      )
      .join("")}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
