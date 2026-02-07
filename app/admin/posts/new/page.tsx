import { NewPostForm } from "@/components/admin/NewPostForm";

export const dynamic = "force-dynamic";

export default function NewPostPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-6">
        New post
      </h1>
      <NewPostForm />
    </div>
  );
}
