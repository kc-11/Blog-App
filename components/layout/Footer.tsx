import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-stone-200 dark:border-stone-800 mt-auto">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <p className="text-sm text-stone-500 dark:text-stone-500">
          © {year}.{" "}
          <Link href="/" className="hover:text-stone-700 dark:hover:text-stone-300">
            Blog
          </Link>
          {" · "}
          <Link href="/feed.xml" className="hover:text-stone-700 dark:hover:text-stone-300">
            RSS
          </Link>
        </p>
      </div>
    </footer>
  );
}
