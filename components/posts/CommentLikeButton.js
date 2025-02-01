"use client";

import { useState } from "react";
import { ThumbsUp } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/AuthContext";
import { useRealtime } from "../../lib/RealtimeContext";
import { useRouter } from "next/navigation";

export default function CommentLikeButton({
  postId,
  commentId,
  initialLikes = 0,
  isLiked = false,
  onUpdate,
}) {
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { emit, EVENTS } = useRealtime();
  const router = useRouter();

  const handleLike = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (loading || !user?.id) return;
    setLoading(true);

    try {
      // Optimistic update
      if (onUpdate) {
        onUpdate((prev) => ({
          ...prev,
          likes_count: isLiked ? initialLikes - 1 : initialLikes + 1,
          is_liked: !isLiked,
        }));
      }

      // Make API call
      if (!isLiked) {
        await api.likeComment(commentId);
        // Emit real-time event
        emit(EVENTS.COMMENTS.LIKE, {
          post_id: postId,
          comment_id: commentId,
          user_id: user.id,
        });
      } else {
        await api.unlikeComment(commentId);
        // Emit real-time event
        emit(EVENTS.COMMENTS.UNLIKE, {
          post_id: postId,
          comment_id: commentId,
          user_id: user.id,
        });
      }
    } catch (err) {
      console.error("Error toggling comment like:", err);
      // Revert optimistic update on error
      if (onUpdate) {
        onUpdate((prev) => ({
          ...prev,
          likes_count: initialLikes,
          is_liked: isLiked,
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`
        flex items-center gap-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400 
        hover:text-blue-500 dark:hover:text-blue-400 transition-colors
        ${isLiked ? "text-blue-500 dark:text-blue-400" : ""}
      `}
      title={isLiked ? "Unlike" : "Like"}
    >
      <ThumbsUp
        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLiked ? "fill-current" : ""}`}
        strokeWidth={isLiked ? 2 : 1.5}
      />
      {initialLikes > 0 && <span>{initialLikes}</span>}
    </button>
  );
}
