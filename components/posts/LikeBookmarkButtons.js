"use client";

import { useState, useEffect } from "react";
import { Heart, Bookmark } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/AuthContext";
import { useRealtime } from "../../lib/RealtimeContext";
import { useRouter } from "next/navigation";

export default function LikeBookmarkButtons({
  postId,
  initialLikes = 0,
  initialBookmarks = 0,
  isLiked = false,
  isBookmarked = false,
  onUpdate,
}) {
  const [likes, setLikes] = useState(initialLikes);
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [liked, setLiked] = useState(isLiked);
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { subscribe, EVENTS } = useRealtime();
  const router = useRouter();

  // Subscribe to real-time like/unlike events
  useEffect(() => {
    if (!postId) return;

    const unsubscribeLike = subscribe(EVENTS.POSTS.LIKE, (data) => {
      if (data.postId === postId && data.userId !== user?.id) {
        setLikes((prevLikes) => {
          const newLikes = prevLikes + 1;
          if (onUpdate) {
            onUpdate((prevState) => ({
              ...prevState,
              likes_count: newLikes,
            }));
          }
          return newLikes;
        });
      }
    });

    const unsubscribeUnlike = subscribe(EVENTS.POSTS.UNLIKE, (data) => {
      if (data.postId === postId && data.userId !== user?.id) {
        setLikes((prevLikes) => {
          const newLikes = prevLikes - 1;
          if (onUpdate) {
            onUpdate((prevState) => ({
              ...prevState,
              likes_count: newLikes,
            }));
          }
          return newLikes;
        });
      }
    });

    return () => {
      unsubscribeLike();
      unsubscribeUnlike();
    };
  }, [
    postId,
    user?.id,
    subscribe,
    EVENTS.POSTS.LIKE,
    EVENTS.POSTS.UNLIKE,
    onUpdate,
  ]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      // Optimistic update
      const newLiked = !liked;
      const newLikes = liked ? likes - 1 : likes + 1;

      setLiked(newLiked);
      setLikes(newLikes);

      if (onUpdate) {
        onUpdate((prevState) => ({
          ...prevState,
          likes_count: newLikes,
          is_liked: newLiked,
        }));
      }

      // API call
      if (liked) {
        await api.unlikePost(postId);
      } else {
        await api.likePost(postId);
      }
    } catch (err) {
      // Revert on error
      setLiked(liked);
      setLikes(likes);
      if (onUpdate) {
        onUpdate((prevState) => ({
          ...prevState,
          likes_count: likes,
          is_liked: liked,
        }));
      }
      console.error("Error toggling like:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      if (bookmarked) {
        await api.unbookmarkPost(postId);
        setBookmarks((prev) => prev - 1);
        setBookmarked(false);
      } else {
        await api.bookmarkPost(postId);
        setBookmarks((prev) => prev + 1);
        setBookmarked(true);
      }

      if (onUpdate) {
        onUpdate({
          likes_count: likes,
          bookmarks_count: bookmarked ? bookmarks - 1 : bookmarks + 1,
          is_liked: liked,
          is_bookmarked: !bookmarked,
        });
      }
    } catch (err) {
      console.error("Error toggling bookmark:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={handleLike}
        disabled={loading}
        className={`flex items-center text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors ${
          liked ? "text-red-500 dark:text-red-400" : ""
        }`}
        title={liked ? "Unlike" : "Like"}
      >
        <Heart
          className={`w-5 h-5 mr-1.5 ${liked ? "fill-current" : ""}`}
          strokeWidth={liked ? 2 : 1.5}
        />
        <span className="text-sm">{likes}</span>
      </button>

      <button
        onClick={handleBookmark}
        disabled={loading}
        className={`flex items-center text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors ${
          bookmarked ? "text-blue-500 dark:text-blue-400" : ""
        }`}
        title={bookmarked ? "Remove bookmark" : "Bookmark"}
      >
        <Bookmark
          className={`w-5 h-5 mr-1.5 ${bookmarked ? "fill-current" : ""}`}
          strokeWidth={bookmarked ? 2 : 1.5}
        />
        <span className="text-sm">{bookmarks}</span>
      </button>
    </div>
  );
}
