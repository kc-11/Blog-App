import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPostById } from "@/lib/models/Post";
import { PostContent } from "@/components/blog/PostContent";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: "noindex, nofollow",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminPreviewPage({ params }: PageProps) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();

  return (
    <article className="max-w-2xl mx-auto px-4 py-12">
      <header className="mb-10">
        <p className="text-sm text-amber-600 dark:text-amber-400 mb-2">Draft preview</p>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-stone-900 dark:text-stone-100">
          {(post as any).title}
        </h1>
        <div className="mt-4 text-sm text-stone-500 dark:text-stone-500">
          {(post as any).readingTimeMinutes > 0 && <span>{(post as any).readingTimeMinutes} min read</span>}
        </div>
      </header>
      <PostContent content={(post as any).content} />
    </article>
  );
}
