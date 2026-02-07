"use client";

import { useState } from "react";

export function LikeButton({
  slug,
  initialCount,
}: {
  slug: string;
  initialCount: number;
}) {
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleLike = async () => {
    if (loading || done) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${slug}/like`, { method: "POST" });
      const data = await res.json();
      if (res.ok && typeof data.likeCount === "number") {
        setCount(data.likeCount);
        setDone(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={loading || done}
      className="text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 disabled:opacity-70"
    >
      {done ? "Liked" : "Like"} · {count} {count === 1 ? "like" : "likes"}
    </button>
  );
}
