"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, User, LayoutDashboard, MessageSquare } from "lucide-react";
import { useAuth } from "../../lib/AuthContext";
import { getFullAvatarUrl } from "../../lib/api";
import { Logo } from "./";

export default function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const handleClick = (e, path) => {
    console.log("Link clicked:", path);
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-sm shadow-sm mb-8 bg-white/80 dark:bg-gray-800/80">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Logo variant="name" className="hidden sm:flex" />
            <Logo variant="icon" className="sm:hidden flex" />
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className={`text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                pathname === "/"
                  ? "font-semibold text-blue-600 dark:text-blue-400"
                  : ""
              }`}
            >
              Home
            </Link>

            {isAuthenticated ? (
              <>
                {user?.is_staff && (
                  <Link
                    href="/admin"
                    className={`flex items-center px-3 py-1.5 rounded-lg transition-colors ${
                      pathname.startsWith("/admin")
                        ? "bg-blue-500 text-white"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    <span>Admin</span>
                  </Link>
                )}

                <Link
                  href="/messages"
                  className={`flex items-center px-3 py-1.5 rounded-lg transition-colors ${
                    pathname.startsWith("/messages")
                      ? "bg-blue-500 text-white"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  <span>Messages</span>
                </Link>

                <Link
                  href={`/profile/${user.username}`}
                  className="group relative flex items-center"
                >
                  <div className="relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-white dark:ring-gray-700 group-hover:ring-blue-500 dark:group-hover:ring-blue-400 transition-all">
                    {user.avatar ? (
                      <Image
                        src={getFullAvatarUrl(user.avatar)}
                        alt={user.username}
                        fill
                        className="object-cover"
                        sizes="36px"
                        priority
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={(e) => handleClick(e, "/login")}
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={(e) => handleClick(e, "/signup")}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="absolute left-0 right-0 mt-2 px-4 pt-2 pb-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700 md:hidden">
            <div className="space-y-3">
              <Link
                href="/"
                className={`block px-3 py-2 rounded-lg transition-colors ${
                  pathname === "/"
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                Home
              </Link>

              {isAuthenticated ? (
                <>
                  {user?.is_staff && (
                    <Link
                      href="/admin"
                      className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                        pathname.startsWith("/admin")
                          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Admin Dashboard
                    </Link>
                  )}

                  <Link
                    href="/messages"
                    className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                      pathname.startsWith("/messages")
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Messages
                  </Link>

                  <Link
                    href={`/profile/${user.username}`}
                    className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                      pathname.startsWith("/profile")
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2">
                      {user.avatar ? (
                        <Image
                          src={getFullAvatarUrl(user.avatar)}
                          alt={user.username}
                          fill
                          className="object-cover"
                          sizes="32px"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        </div>
                      )}
                    </div>
                    Profile
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={(e) => handleClick(e, "/login")}
                    className="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={(e) => handleClick(e, "/signup")}
                    className="block px-3 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
