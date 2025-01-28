"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import BlogPostCard from "../components/BlogPostCard";
import CreatePostModal from "../components/CreatePostModal";
import { Plus } from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { api } from "../lib/api";
import BlogPostSkeleton from "../components/BlogPostSkeleton";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedType, setFeedType] = useState("general"); // 'general' or 'personalized'

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        let data;

        if (isAuthenticated && feedType === "personalized") {
          try {
            data = await api.getPersonalizedPosts();
          } catch (err) {
            console.error("Error fetching personalized feed:", err);
            // Fallback to general feed if personalized feed fails
            data = await api.getPosts();
            setFeedType("general");
          }
        } else {
          data = await api.getPosts();
        }

        // Sort posts by creation date in descending order (newest first)
        const sortedPosts = data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setPosts(sortedPosts);
        setError("");
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("Failed to load posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [feedType, isAuthenticated]);

  const openModal = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handlePostCreated = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
    closeModal();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
              {isAuthenticated && feedType === "personalized"
                ? "Your Feed"
                : "Latest Blog Posts"}
            </h1>
            {isAuthenticated && (
              <div className="flex w-full sm:w-auto space-x-2 sm:space-x-4">
                <button
                  onClick={() => setFeedType("general")}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm rounded transition-colors ${
                    feedType === "general"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  General Feed
                </button>
                <button
                  onClick={() => setFeedType("personalized")}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm rounded transition-colors ${
                    feedType === "personalized"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  Your Feed
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-8 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg">
              {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, index) => (
                <BlogPostSkeleton key={index} />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {isAuthenticated && feedType === "personalized"
                ? "No posts in your personalized feed yet. Try following some users!"
                : "No posts yet. Be the first to share your story!"}
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <BlogPostCard
                  key={post.id}
                  post={post}
                  currentUser={user}
                  onPostUpdated={(updatedPost) => {
                    setPosts((prevPosts) =>
                      prevPosts.map((p) =>
                        p.id === updatedPost.id
                          ? {
                              ...p,
                              likes_count: updatedPost.likes_count,
                              bookmarks_count: updatedPost.bookmarks_count,
                              is_liked: updatedPost.is_liked,
                              is_bookmarked: updatedPost.is_bookmarked,
                            }
                          : p
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

        <button
          onClick={openModal}
          className="fixed bottom-8 right-8 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors duration-200 z-10"
          title={isAuthenticated ? "Create new post" : "Login to create post"}
        >
          <Plus size={24} />
        </button>

        <CreatePostModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onPostCreated={handlePostCreated}
        />
      </main>
    </div>
  );
}
