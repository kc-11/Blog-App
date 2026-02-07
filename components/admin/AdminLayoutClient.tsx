"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <header className="border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/admin"
            className="font-semibold text-stone-900 dark:text-stone-100"
          >
            Admin
          </Link>
          <nav className="flex gap-4 text-sm items-center">
            <Link
              href="/admin"
              className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/posts"
              className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
            >
              Posts
            </Link>
            <Link
              href="/admin/posts/new"
              className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
            >
              New post
            </Link>
            <Link
              href="/"
              className="text-stone-500 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
            >
              View site
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="text-stone-500 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
            >
              Log out
            </button>
          </nav>
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-4 py-8">{children}</div>
    </div>
  );
}
