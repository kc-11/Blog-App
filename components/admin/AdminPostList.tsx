"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface PostItem {
  _id: string;
  slug: string;
  title: string;
  status: string;
  updatedAt: string;
}

const VALID_STATUS = ["", "draft", "published"] as const;

export function AdminPostList({ initialStatus = "" }: { initialStatus?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFromUrl = searchParams.get("status") ?? "";
  const initial = VALID_STATUS.includes(statusFromUrl as (typeof VALID_STATUS)[number])
    ? statusFromUrl
    : initialStatus && VALID_STATUS.includes(initialStatus as (typeof VALID_STATUS)[number])
      ? initialStatus
      : "";

  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>(initial);

  const fetchPosts = useCallback(async (status: string) => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    try {
      const res = await fetch(`/api/admin/posts?${params}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load posts");
        return;
      }
      setPosts(data.posts ?? []);
    } catch {
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(statusFilter);
  }, [statusFilter, fetchPosts]);

  useEffect(() => {
    const urlStatus = searchParams.get("status") ?? "";
    if (VALID_STATUS.includes(urlStatus as (typeof VALID_STATUS)[number]) && urlStatus !== statusFilter) {
      setStatusFilter(urlStatus);
    }
  }, [searchParams, statusFilter]);

  const setFilter = (status: string) => {
    setStatusFilter(status);
    const q = status ? `?status=${encodeURIComponent(status)}` : "";
    router.push(`/admin/posts${q}`, { scroll: false });
  };

  if (loading && posts.length === 0) return <p className="text-stone-500">Loading…</p>;
  if (error)
    return (
      <p className="text-stone-500">
        {error}. <Link href="/admin/posts" className="underline">Try again</Link>.
      </p>
    );

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setFilter("")}
          className={`px-3 py-1 text-sm rounded ${!statusFilter ? "bg-stone-200 dark:bg-stone-700" : "bg-transparent"}`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setFilter("draft")}
          className={`px-3 py-1 text-sm rounded ${statusFilter === "draft" ? "bg-stone-200 dark:bg-stone-700" : "bg-transparent"}`}
        >
          Drafts
        </button>
        <button
          type="button"
          onClick={() => setFilter("published")}
          className={`px-3 py-1 text-sm rounded ${statusFilter === "published" ? "bg-stone-200 dark:bg-stone-700" : "bg-transparent"}`}
        >
          Published
        </button>
      </div>
      {posts.length === 0 ? (
        <p className="text-stone-500 py-4">
          No {statusFilter === "draft" ? "drafts" : statusFilter === "published" ? "published posts" : "posts"}.
          <Link href="/admin/posts/new" className="underline ml-1">Create one</Link>.
        </p>
      ) : (
        <ul className="border border-stone-200 dark:border-stone-800 rounded-lg overflow-hidden">
          {posts.map((post) => (
            <li
              key={post._id}
              className="flex items-center justify-between px-4 py-3 border-b border-stone-200 dark:border-stone-800 last:border-0 bg-white dark:bg-stone-900"
            >
              <Link
                href={`/admin/posts/${post._id}/edit`}
                className="font-medium text-stone-900 dark:text-stone-100 hover:underline"
              >
                {post.title}
              </Link>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs px-2 py-0.5 rounded ${post.status === "published"
                      ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                      : "bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-400"
                    }`}
                >
                  {post.status}
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-500">
                  {new Date(post.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
