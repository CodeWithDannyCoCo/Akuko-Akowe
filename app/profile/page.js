"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/AuthContext";
import { api } from "../../lib/api";
import { Header } from "../../components/core";
import { BlogPostCard } from "../../components/posts";
import { Settings } from "lucide-react";
import Link from "next/link";
import { UserAvatar } from "../../components/ui";

export default function Profile() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        const [userPosts, userActivity] = await Promise.all([
          api.getUserPosts(user.username),
          api.getUserActivity(user.username),
        ]);
        const sortedPosts = userPosts.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setPosts(sortedPosts);
        setActivity(userActivity);
        setError("");
      } catch (err) {
        setError("Failed to load user data");
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchUserData();
    }
  }, [user, isAuthenticated, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400 animate-pulse">
            Loading...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center text-gray-600 dark:text-gray-400 animate-pulse">
            Loading...
          </div>
        ) : error ? (
          <div className="max-w-3xl mx-auto p-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 rounded-lg text-sm">
            {error}
          </div>
        ) : user ? (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 mb-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start">
                <div className="w-32 h-32 ring-4 ring-white dark:ring-gray-700 rounded-full overflow-hidden flex-shrink-0">
                  <UserAvatar
                    user={user}
                    size={128}
                    className="w-full h-full"
                  />
                </div>
                <div className="flex-1 mt-4 sm:mt-0 sm:ml-8 text-center sm:text-left">
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                      {user.username}
                    </h1>
                    <Link
                      href="/settings"
                      className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
                      title="Settings"
                    >
                      <Settings size={24} />
                    </Link>
                  </div>
                  {user.bio && (
                    <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-xl">
                      {user.bio}
                    </p>
                  )}
                  <div className="mt-4 inline-flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <span>
                      Joined{" "}
                      {new Date(user.date_joined).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 border-t border-gray-100 dark:border-gray-700 pt-8">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {posts.length}
                  </div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Posts
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {activity?.likes?.length || 0}
                  </div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Likes
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {activity?.comments?.length || 0}
                  </div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Comments
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {activity?.bookmarks?.length || 0}
                  </div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Bookmarks
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Your Posts
              </h2>
              {loading ? (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400 animate-pulse">
                  Loading posts...
                </div>
              ) : error ? (
                <div className="p-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 rounded-lg text-sm">
                  {error}
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                  You haven't created any posts yet.
                </div>
              ) : (
                <div className="space-y-6">
                  {posts.map((post) => (
                    <BlogPostCard
                      key={post.id}
                      post={post}
                      onPostUpdated={(updatedPost) => {
                        setPosts((prevPosts) =>
                          prevPosts.map((p) =>
                            p.id === updatedPost.id ? updatedPost : p
                          )
                        );
                      }}
                      onPostDeleted={(deletedPostId) => {
                        setPosts((prevPosts) =>
                          prevPosts.filter((p) => p.id !== deletedPostId)
                        );
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
