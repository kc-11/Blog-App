import Link from "next/link";
import { getPublishedPosts } from "@/lib/models/Post";
import { connectDB } from "@/lib/db";
import { Tag } from "@/lib/models/Tag";
import { PostCard } from "@/components/blog/PostCard";
import { notFound } from "next/navigation";

const POSTS_PER_PAGE = 12;

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function TagPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10));

  await connectDB();
  const tag = await Tag.findOne({ slug }).lean();
  if (!tag) notFound();

  const { posts, total, page: currentPage } = await getPublishedPosts({
    tag: slug,
    limit: POSTS_PER_PAGE,
    page,
  });
  const totalPages = Math.ceil(total / POSTS_PER_PAGE);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-serif text-3xl font-semibold text-stone-900 dark:text-stone-100 mb-2">
        Tag: {tag.name}
      </h1>
      <p className="text-stone-500 dark:text-stone-500 text-sm mb-8">
        {total} {total === 1 ? "post" : "posts"}
      </p>
      {posts.length === 0 ? (
        <p className="text-stone-500 dark:text-stone-500 font-serif">No posts in this tag.</p>
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
                  href={`/tag/${slug}?page=${currentPage - 1}`}
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
                  href={`/tag/${slug}?page=${currentPage + 1}`}
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
