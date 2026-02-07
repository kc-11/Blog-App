"use client";

import Link from "next/link";
import { useState } from "react";
import { LogoutButton } from "./LogoutButton";

export function MobileMenu({ showAdmin }: { showAdmin: boolean }) {
    const [isOpen, setIsOpen] = useState(false);

    // Close menu when a link is clicked
    const handleLinkClick = () => {
        setIsOpen(false);
    };

    return (
        <div className="sm:hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                aria-label="Toggle menu"
            >
                {isOpen ? (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                ) : (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                        />
                    </svg>
                )}
            </button>

            {isOpen && (
                <div className="absolute top-16 left-0 right-0 bg-white dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 p-4 shadow-lg z-50">
                    <nav className="flex flex-col gap-4">
                        <Link
                            href="/blog"
                            onClick={handleLinkClick}
                            className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                        >
                            Posts
                        </Link>
                        {showAdmin ? (
                            <>
                                <Link
                                    href="/admin"
                                    onClick={handleLinkClick}
                                    className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/admin/posts/new"
                                    onClick={handleLinkClick}
                                    className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                                >
                                    Write
                                </Link>
                                <div onClick={handleLinkClick}>
                                    <LogoutButton />
                                </div>
                            </>
                        ) : (
                            <Link
                                href="/admin/login"
                                onClick={handleLinkClick}
                                className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                            >
                                Login
                            </Link>
                        )}
                    </nav>
                </div>
            )}
        </div>
    );
}
