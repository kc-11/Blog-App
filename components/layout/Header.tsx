"use client";

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { LogoutButton } from "./LogoutButton";
import { MobileMenu } from "./MobileMenu";
import { useEffect, useState } from "react";

export function Header() {
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((res) => res.json())
      .then((data) => setShowAdmin(data.isAdmin))
      .catch(() => setShowAdmin(false));
  }, []);

  return (
    <header className="border-b border-stone-200 dark:border-stone-800">
      <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="font-serif text-lg font-semibold text-stone-900 dark:text-stone-100 hover:opacity-80"
        >
          Blog
        </Link>
        <nav className="hidden sm:flex items-center gap-5 sm:gap-6">
          <Link
            href="/blog"
            className="text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
          >
            Posts
          </Link>
          {showAdmin ? (
            <>
              <Link
                href="/admin"
                className="text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/posts/new"
                className="text-sm font-medium px-3 py-1.5 rounded-md bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 hover:opacity-90 transition-opacity"
              >
                Write
              </Link>
              <LogoutButton />
            </>
          ) : (
            <Link
              href="/admin/login"
              className="text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
            >
              Login
            </Link>
          )}
          <ThemeToggle />
        </nav>
        <MobileMenu showAdmin={showAdmin} />
      </div>
    </header>
  );
}
