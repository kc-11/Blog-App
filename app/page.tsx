import Link from "next/link";
import { getPublishedPosts } from "@/lib/models/Post";
import { isAdmin } from "@/lib/auth";

const POSTS_PER_PAGE = 6;

export const revalidate = 60;

export default async function HomePage() {
  const [{ posts }, showAdmin] = await Promise.all([
    getPublishedPosts({ limit: POSTS_PER_PAGE, page: 1 }),
    isAdmin(),
  ]);
  return (
    <div className="max-w-2xl mx-auto px-4 py-14 sm:py-20">
      {/* Hero */}
      <section className="mb-20 sm:mb-24">
        <p className="text-sm font-medium text-stone-500 dark:text-stone-500 uppercase tracking-wider mb-3">
          A place to think
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-stone-900 dark:text-stone-100 mb-5 leading-tight tracking-tight">
          {showAdmin ? "Hi Kushagra" : "Welcome"}
        </h1>
        <p className="text-stone-600 dark:text-stone-400 font-serif text-lg sm:text-xl leading-relaxed max-w-xl">
          Long-form writing on technology, society, ideas, and learning.
        </p>
        <div className="mt-8 pt-8 border-t border-stone-200 dark:border-stone-800">
          <div className="flex flex-wrap gap-3">
            <Link
              href="/blog"
              className="text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
            >
              Read posts →
            </Link>
            {showAdmin && (
              <>
                <span className="text-stone-300 dark:text-stone-600">·</span>
                <Link
                  href="/admin"
                  className="text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                >
                  Dashboard
                </Link>
                <span className="text-stone-300 dark:text-stone-600">·</span>
                <Link
                  href="/admin/posts/new"
                  className="text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                >
                  Write a post
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Latest posts */}
      <section>
        <h2 className="font-serif text-2xl font-semibold text-stone-800 dark:text-stone-200 mb-8">
          Latest posts
        </h2>
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/30 p-8 sm:p-10 text-center">
            <p className="text-stone-500 dark:text-stone-500 font-serif text-lg mb-6">
              {showAdmin
                ? "No posts yet. Start writing or open your dashboard to manage content."
                : "No posts yet. Check back soon."}
            </p>
            {showAdmin && (
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/admin/posts/new"
                  className="inline-flex items-center font-medium px-5 py-2.5 rounded-lg bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 hover:opacity-90 transition-opacity"
                >
                  Start writing
                </Link>
                <Link
                  href="/admin"
                  className="inline-flex items-center font-medium px-5 py-2.5 rounded-lg border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  Dashboard
                </Link>
              </div>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-stone-100 dark:divide-stone-800/80">
            {posts.map((post: any) => (
              <li key={post._id.toString()}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block py-6"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-serif text-xl font-semibold text-stone-900 dark:text-stone-100 group-hover:text-stone-600 dark:group-hover:text-stone-400 transition-colors">
                      {post.title}
                    </h3>
                    <span className="text-stone-500 dark:text-stone-500 text-sm">
                      {post.publishedAt &&
                        new Date(post.publishedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      {post.readingTimeMinutes > 0 && (
                        <span className="ml-2">· {post.readingTimeMinutes} min</span>
                      )}
                    </span>
                  </div>
                  {post.description && (
                    <p className="mt-1.5 text-stone-600 dark:text-stone-400 font-serif text-sm line-clamp-2">
                      {post.description}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
        {posts.length >= POSTS_PER_PAGE && (
          <p className="mt-10">
            <Link
              href="/blog"
              className="inline-flex items-center text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
            >
              View all posts →
            </Link>
          </p>
        )}
      </section>
    </div>
  );
}
