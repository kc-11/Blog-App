import Link from "next/link";

interface PostCardProps {
  post: {
    slug: string;
    title: string;
    description?: string;
    publishedAt?: string;
    readingTimeMinutes?: number;
    tags?: { slug: string; name: string }[];
  };
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article>
      <Link href={`/blog/${post.slug}`} className="group block">
        <h2 className="font-serif text-xl font-semibold text-stone-900 dark:text-stone-100 group-hover:text-stone-600 dark:group-hover:text-stone-400 transition-colors">
          {post.title}
        </h2>
        {post.description && (
          <p className="mt-1 text-stone-600 dark:text-stone-400 font-serif text-sm line-clamp-2">
            {post.description}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-500 dark:text-stone-500">
          {post.publishedAt && (
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          )}
          {post.readingTimeMinutes != null && post.readingTimeMinutes > 0 && (
            <span>{post.readingTimeMinutes} min read</span>
          )}
          {post.tags && post.tags.length > 0 && (
            <span className="flex gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag.slug}
                  href={`/tag/${tag.slug}`}
                  className="hover:text-stone-700 dark:hover:text-stone-300"
                  onClick={(e) => e.stopPropagation()}
                >
                  {tag.name}
                </Link>
              ))}
            </span>
          )}
        </div>
      </Link>
    </article>
  );
}
