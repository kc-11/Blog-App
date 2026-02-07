"use client";

import { useEffect } from "react";

export function ViewCount({
  slug,
  initialCount,
}: {
  slug: string;
  initialCount: number;
}) {
  useEffect(() => {
    fetch(`/api/posts/${slug}/view`, { method: "POST" }).catch(() => {});
  }, [slug]);
  return <span>{initialCount} views</span>;
}
