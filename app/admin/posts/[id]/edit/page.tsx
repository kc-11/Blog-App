import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Post } from "@/lib/models/Post";
import { EditPostForm } from "@/components/admin/EditPostForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: PageProps) {
  const { id } = await params;
  await connectDB();
  const post = await Post.findById(id).populate("tags", "slug name").lean();
  if (!post) notFound();

  const serialized = {
    _id: (post as any)._id.toString(),
    slug: (post as any).slug,
    title: (post as any).title,
    description: (post as any).description,
    content: (post as any).content,
    status: (post as any).status,
    publishedAt: (post as any).publishedAt?.toISOString() ?? null,
    tags: ((post as any).tags ?? []).map((t: { _id: unknown; slug: string; name: string }) => ({
      slug: t.slug,
      name: t.name,
    })),
    category: (post as any).category,
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-6">
        Edit post
      </h1>
      <EditPostForm initialPost={serialized} />
    </div>
  );
}
