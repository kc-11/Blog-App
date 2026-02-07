import Link from "next/link";
import type { Metadata } from "next";
import { getPublishedPosts } from "@/lib/models/Post";
import { PostCard } from "@/components/blog/PostCard";

const POSTS_PER_PAGE = 12;

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Posts",
  description: "All blog posts.",
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tag?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const { posts, total, page: currentPage } = await getPublishedPosts({
    limit: POSTS_PER_PAGE,
    page,
    tag: params.tag ?? undefined,
    q: params.q ?? undefined,
  });
  const totalPages = Math.ceil(total / POSTS_PER_PAGE);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-serif text-3xl font-semibold text-stone-900 dark:text-stone-100 mb-8">
        Posts
      </h1>
      {posts.length === 0 ? (
        <p className="text-stone-500 dark:text-stone-500 font-serif">
          No posts found.
        </p>
      ) : (
        <>
          <ul className="space-y-8">
            {posts.map((post: { _id: { toString: () => string }; slug: string; title: string; description?: string; publishedAt?: string; readingTimeMinutes?: number; tags?: { slug: string; name: string }[] }) => (
              <li key={post._id.toString()}>
                <PostCard post={post} />
              </li>
            ))}
          </ul>
          {totalPages > 1 && (
            <nav className="mt-12 flex gap-4 justify-center" aria-label="Pagination">
              {currentPage > 1 && (
                <Link
                  href={`/blog?page=${currentPage - 1}${params.tag ? `&tag=${params.tag}` : ""}${params.q ? `&q=${params.q}` : ""}`}
                  className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                >
                  Previous
                </Link>
              )}
              <span className="text-stone-500 dark:text-stone-500">
                Page {currentPage} of {totalPages}
              </span>
              {currentPage < totalPages && (
                <Link
                  href={`/blog?page=${currentPage + 1}${params.tag ? `&tag=${params.tag}` : ""}${params.q ? `&q=${params.q}` : ""}`}
                  className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                >
                  Next
                </Link>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
