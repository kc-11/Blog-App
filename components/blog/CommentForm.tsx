"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CommentForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch(`/api/posts/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorName, authorEmail, body }),
      });
      const data = await res.json();
      if (res.ok) {
        setAuthorName("");
        setAuthorEmail("");
        setBody("");
        setStatus("success");
        setMessage("Comment submitted successfully.");
        router.refresh();
      } else {
        setStatus("error");
        setMessage(data.error ?? "Failed to submit comment.");
      }
    } catch {
      setStatus("error");
      setMessage("Failed to submit comment.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="comment-name" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
          Name
        </label>
        <input
          id="comment-name"
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          required
          maxLength={200}
          className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
        />
      </div>
      <div>
        <label htmlFor="comment-email" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
          Email
        </label>
        <input
          id="comment-email"
          type="email"
          value={authorEmail}
          onChange={(e) => setAuthorEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
        />
      </div>
      <div>
        <label htmlFor="comment-body" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
          Comment
        </label>
        <textarea
          id="comment-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={4}
          maxLength={5000}
          className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
        />
      </div>
      {message && (
        <p className={`text-sm ${status === "error" ? "text-red-600 dark:text-red-400" : "text-stone-600 dark:text-stone-400"}`}>
          {message}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "loading"}
        className="px-4 py-2 bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 rounded text-sm font-medium hover:opacity-90 disabled:opacity-50"
      >
        {status === "loading" ? "Submitting…" : "Submit comment"}
      </button>
    </form>
  );
}
