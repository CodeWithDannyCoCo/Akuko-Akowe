"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../lib/api";
import { BlogPostCard } from "../../../components/posts";
import { CommentSection } from "../../../components/posts";
import { LoadingSpinner } from "../../../components/ui";
import { ArrowLeft } from "lucide-react";
import { Header } from "../../../components/core";

export default function PostPage({ params }) {
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPost() {
      if (!params?.id) return;

      try {
        setLoading(true);
        const data = await api.getPost(params.id);
        if (data) {
          setPost(data);
          setError(null);
        } else {
          setError("Post not found");
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        setError(err.message || "Failed to load post");
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [params?.id]);

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-red-500">{error}</div>
          <button
            onClick={handleBack}
            className="mt-4 flex items-center text-blue-500 hover:text-blue-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Feed
          </button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div>Post not found</div>
          <button
            onClick={handleBack}
            className="mt-4 flex items-center text-blue-500 hover:text-blue-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <BlogPostCard post={post} isFullPost={true} />
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-1">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Comments ({post.comments_count || 0})
                </h2>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  on post by{" "}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {post.author?.username || "Unknown"}
                  </span>
                </span>
              </div>
              <button
                onClick={handleBack}
                className="text-sm text-blue-500 hover:text-blue-600 transition-colors"
              >
                ← Back to Feed
              </button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
              <CommentSection postId={params.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
