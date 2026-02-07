import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Post } from "@/lib/models/Post";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await connectDB();
  const [draftCount, publishedCount] = await Promise.all([
    Post.countDocuments({ status: "draft" }),
    Post.countDocuments({ status: "published" }),
  ]);
  const recent = await Post.find()
    .sort({ updatedAt: -1 })
    .limit(5)
    .select("_id slug title status updatedAt")
    .lean();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-6">
        Dashboard
      </h1>
      <div className="grid gap-4 sm:grid-cols-2 mb-10">
        <Link
          href="/admin/posts?status=draft"
          className="p-4 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-300 dark:hover:border-stone-700 transition-colors block"
        >
          <p className="text-sm text-stone-500 dark:text-stone-500">Drafts</p>
          <p className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
            {draftCount}
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-500 mt-1">View drafts →</p>
        </Link>
        <Link
          href="/admin/posts?status=published"
          className="p-4 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-300 dark:hover:border-stone-700 transition-colors block"
        >
          <p className="text-sm text-stone-500 dark:text-stone-500">Published</p>
          <p className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
            {publishedCount}
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-500 mt-1">View published →</p>
        </Link>
      </div>
      <section>
        <h2 className="text-lg font-medium text-stone-800 dark:text-stone-200 mb-4">
          Recent posts
        </h2>
        {recent.length === 0 ? (
          <p className="text-stone-500 dark:text-stone-500 text-sm">
            No posts yet.{" "}
            <Link href="/admin/posts/new" className="underline">
              Create one
            </Link>
            .
          </p>
        ) : (
          <ul className="space-y-2">
            {recent.map((post) => (
              <li key={post._id.toString()}>
                <Link
                  href={`/admin/posts/${post._id}/edit`}
                  className="flex items-center justify-between py-2 px-3 rounded hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  <span className="font-medium text-stone-900 dark:text-stone-100">
                    {post.title}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      post.status === "published"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                        : "bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-400"
                    }`}
                  >
                    {post.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
