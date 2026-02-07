"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEditor, EditorContent, type JSONContent } from "@tiptap/react";
import { PostEditor } from "./PostEditor";
import { useAutosave } from "@/hooks/useAutosave";
import { slugify } from "@/lib/utils/slugify";

interface EditPostFormProps {
  initialPost: {
    _id: string;
    slug: string;
    title: string;
    description?: string;
    content: unknown;
    status: string;
    publishedAt: string | null;
    tags: { slug: string; name: string }[];
    category?: string;
  };
}

export function EditPostForm({ initialPost }: EditPostFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialPost.title);
  const [slug, setSlug] = useState(initialPost.slug);
  const [description, setDescription] = useState(initialPost.description ?? "");
  const [content, setContent] = useState<JSONContent>(
    typeof initialPost.content === "object" && initialPost.content !== null
      ? (initialPost.content as JSONContent)
      : { type: "doc", content: [] }
  );
  const [tagsStr, setTagsStr] = useState(
    initialPost.tags?.map((t) => t.name).join(", ") ?? ""
  );
  const [status, setStatus] = useState(initialPost.status);

  const savePayload = useCallback(async () => {
    const tags = tagsStr.split(",").map((t) => t.trim()).filter(Boolean);
    const res = await fetch(`/api/admin/posts/${initialPost._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title || "Untitled",
        slug: slug || slugify(title || "untitled"),
        description: description || "",
        content,
        tags,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? "Save failed");
    }
  }, [initialPost._id, title, slug, description, content, tagsStr]);

  const { status: saveStatus } = useAutosave({
    data: { title, slug, description, content, tagsStr },
    onSave: savePayload,
    delayMs: 2000,
    enabled: true,
  });

  const uploadImage = async (file: File): Promise<string> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Upload failed");
    return data.url;
  };

  const handlePublish = async () => {
    const tags = tagsStr.split(",").map((t) => t.trim()).filter(Boolean);
    const res = await fetch(`/api/admin/posts/${initialPost._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title || "Untitled",
        slug: slug || slugify(title || "untitled"),
        description,
        content,
        tags,
        status: status === "published" ? "draft" : "published",
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setStatus(data.status ?? status);
      router.refresh();
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/posts/${initialPost._id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.push("/admin/posts");
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 text-sm">
        {saveStatus === "saving" && <span className="text-stone-500">Saving…</span>}
        {saveStatus === "saved" && <span className="text-green-600 dark:text-green-400">Saved</span>}
        {saveStatus === "error" && <span className="text-red-600 dark:text-red-400">Error saving</span>}
        <Link
          href={status === "published" ? `/blog/${initialPost.slug}` : `/admin/preview/${initialPost._id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-stone-600 dark:text-stone-400 hover:underline"
        >
          {status === "published" ? "View post" : "Preview draft"}
        </Link>
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
          Slug
        </label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
          Description (meta)
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          value={tagsStr}
          onChange={(e) => setTagsStr(e.target.value)}
          className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
          Content
        </label>
        <PostEditor content={content} onChange={setContent} onImageUpload={uploadImage} />
      </div>
      <div className="flex flex-wrap gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
        <button
          type="button"
          onClick={handlePublish}
          className="px-4 py-2 bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 rounded text-sm font-medium hover:opacity-90"
        >
          {status === "published" ? "Unpublish" : "Publish"}
        </button>
        <Link
          href={status === "published" ? `/blog/${initialPost.slug}` : `/admin/preview/${initialPost._id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 border border-stone-300 dark:border-stone-600 rounded text-sm font-medium hover:bg-stone-100 dark:hover:bg-stone-800"
        >
          {status === "published" ? "View post" : "Preview"}
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          className="px-4 py-2 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 rounded text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
