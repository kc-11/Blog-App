import Link from "next/link";
import { AdminPostList } from "@/components/admin/AdminPostList";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AdminPostsPage({ searchParams }: Props) {
  const { status } = await searchParams;
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
          Posts
        </h1>
        <Link
          href="/admin/posts/new"
          className="px-4 py-2 bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 rounded text-sm font-medium hover:opacity-90"
        >
          New post
        </Link>
      </div>
      <AdminPostList initialStatus={status ?? ""} />
    </div>
  );
}
