import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getPostBySlug, getAllPublishedSlugs } from "@/lib/models/Post";
import { getApprovedCommentsByPostId } from "@/lib/models/Comment";
import { PostContent } from "@/components/blog/PostContent";
import { CommentForm } from "@/components/blog/CommentForm";
import { CommentList } from "@/components/blog/CommentList";
import { LikeButton } from "@/components/blog/LikeButton";
import { ViewCount } from "@/components/blog/ViewCount";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllPublishedSlugs();
  return slugs.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug, true);
  if (!post) return { title: "Post not found" };
  const title = post.title;
  const description = post.description ?? post.contentPlain?.slice(0, 160) ?? "";
  const ogImage = post.ogImage || post.coverImage || undefined;
  const url = `${BASE_URL}/blog/${post.slug}`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "article",
      publishedTime: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical: url },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug, true);
  if (!post) notFound();

  const [comments] = await Promise.all([
    getApprovedCommentsByPostId(post._id.toString()),
  ]);

  return (
    <article className="max-w-2xl mx-auto px-4 py-12">
      <header className="mb-10">
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-stone-900 dark:text-stone-100">
          {post.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-500 dark:text-stone-500">
          {post.publishedAt && (
            <time dateTime={new Date(post.publishedAt).toISOString()}>
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          )}
          {post.readingTimeMinutes > 0 && (
            <span>{post.readingTimeMinutes} min read</span>
          )}
          <ViewCount slug={slug} initialCount={post.viewCount} />
          {post.tags && post.tags.length > 0 && (
            <span className="flex gap-2">
              {post.tags.map((tag: { slug: string; name: string }) => (
                <Link
                  key={tag.slug}
                  href={`/tag/${tag.slug}`}
                  className="hover:text-stone-700 dark:hover:text-stone-300"
                >
                  {tag.name}
                </Link>
              ))}
            </span>
          )}
        </div>
      </header>
      <PostContent content={post.content} />
      <footer className="mt-12 pt-8 border-t border-stone-200 dark:border-stone-800">
        <LikeButton slug={slug} initialCount={post.likeCount} />
        <section className="mt-10" aria-label="Comments">
          <h2 className="font-serif text-xl font-semibold text-stone-900 dark:text-stone-100 mb-4">
            Comments
          </h2>
          <CommentForm slug={slug} />
          <CommentList comments={comments} />
        </section>
      </footer>
    </article>
  );
}
