"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { type JSONContent } from "@tiptap/react";
import { PostEditor } from "./PostEditor";
import { slugify } from "@/lib/utils/slugify";

const emptyContent: JSONContent = { type: "doc", content: [] };

export function NewPostForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState<JSONContent>(emptyContent);
  const [tagsStr, setTagsStr] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const uploadImage = async (file: File): Promise<string> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Upload failed");
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const tags = tagsStr.split(",").map((t) => t.trim()).filter(Boolean);
    try {
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || "Untitled",
          slug: slug || slugify(title || "untitled"),
          description: description || "",
          content,
          status: "draft",
          tags,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create post");
      router.push(`/admin/posts/${data._id}/edit`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (!slug || slug === slugify(title)) setSlug(slugify(e.target.value));
          }}
          className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
          placeholder="Post title"
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
          placeholder="url-slug"
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
          placeholder="Short description for SEO"
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
          placeholder="tech, ideas, learning"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
          Content
        </label>
        <PostEditor content={content} onChange={setContent} onImageUpload={uploadImage} />
      </div>
      {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="px-4 py-2 bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 rounded text-sm font-medium hover:opacity-90 disabled:opacity-50"
      >
        {saving ? "Creating…" : "Create draft"}
      </button>
    </form>
  );
}
