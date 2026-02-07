interface Comment {
  _id: string;
  authorName: string;
  body: string;
  createdAt: string;
}

export function CommentList({ comments }: { comments: Comment[] }) {
  if (comments.length === 0) {
    return <p className="text-stone-500 dark:text-stone-500 text-sm mt-4">No comments yet.</p>;
  }
  return (
    <ul className="mt-6 space-y-4">
      {comments.map((c) => (
        <li
          key={c._id}
          className="pl-4 border-l-2 border-stone-200 dark:border-stone-700"
        >
          <p className="font-medium text-stone-800 dark:text-stone-200">
            {c.authorName}
          </p>
          <p className="text-sm text-stone-500 dark:text-stone-500">
            {new Date(c.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
          <p className="mt-1 text-stone-700 dark:text-stone-300 whitespace-pre-wrap">
            {c.body}
          </p>
        </li>
      ))}
    </ul>
  );
}
