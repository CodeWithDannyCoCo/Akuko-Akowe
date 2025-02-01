"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useTransition,
  useMemo,
} from "react";
import { useAuth } from "../../lib/AuthContext";
import { useRealtime } from "../../lib/RealtimeContext";
import { api } from "../../lib/api";
import { Send, Clock, ThumbsUp } from "lucide-react";
import Comment from "./Comment";

const COMMENTS_PER_PAGE = 20;
const COMMENTS_CACHE_KEY = "post-comments-cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const SortOptions = {
  NEWEST: "newest",
  OLDEST: "oldest",
  MOST_LIKED: "most_liked",
};

// Enhanced comment button with better mobile interaction
const CommentButton = ({ onClick, disabled, children, icon: Icon }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium 
      transition-all duration-200 
      ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-gray-100 dark:hover:bg-gray-700/70"
      }
    `}
  >
    {Icon && <Icon className="w-4 h-4" />}
    {children}
  </button>
);

export default function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState(SortOptions.NEWEST);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { user, isAuthenticated } = useAuth();
  const { subscribe, emit, EVENTS } = useRealtime();
  const lastLoadTime = useRef(Date.now());
  const loadMoreRef = useRef(null);

  // Cache management
  const cacheKey = useMemo(() => {
    return `${COMMENTS_CACHE_KEY}-${postId}-${sortBy}`;
  }, [postId, sortBy]);

  const cacheComments = useCallback(
    (data) => {
      try {
        const cacheData = {
          timestamp: Date.now(),
          data,
          sortBy,
          page,
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      } catch (error) {
        console.error("Error caching comments:", error);
      }
    },
    [cacheKey, sortBy, page]
  );

  const getCachedComments = useCallback(() => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return null;

      const {
        timestamp,
        data,
        sortBy: cachedSortBy,
        page: cachedPage,
      } = JSON.parse(cached);
      if (Date.now() - timestamp > CACHE_DURATION || cachedSortBy !== sortBy) {
        localStorage.removeItem(cacheKey);
        return null;
      }

      return { data, page: cachedPage };
    } catch (error) {
      console.error("Error reading cached comments:", error);
      return null;
    }
  }, [cacheKey, sortBy]);

  // Fetch comments with caching
  const fetchComments = useCallback(
    async (pageNum = 1, append = false) => {
      try {
        setLoadingMore(append);
        if (!append) setLoading(true);

        // Try to get cached data for the first page
        if (pageNum === 1 && !append) {
          const cached = getCachedComments();
          if (cached) {
            setComments(cached.data);
            setPage(cached.page);
            setLoading(false);
            setLoadingMore(false);
            return;
          }
        }

        const params = new URLSearchParams({
          post: postId,
          page: pageNum,
          limit: COMMENTS_PER_PAGE,
          sort: sortBy,
        });

        const data = await api.getComments(postId, pageNum, COMMENTS_PER_PAGE);
        const commentsArray = Array.isArray(data) ? data : data?.comments || [];

        startTransition(() => {
          setComments((prev) => {
            const newComments = append
              ? [...prev, ...commentsArray]
              : commentsArray;

            // Cache first page results
            if (pageNum === 1) {
              cacheComments(newComments);
            }

            return newComments;
          });

          setHasMore(commentsArray.length >= COMMENTS_PER_PAGE);
        });

        setError("");
        lastLoadTime.current = Date.now();
      } catch (err) {
        console.error("Error fetching comments:", err);
        setError("Failed to load comments");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [postId, sortBy, cacheComments, getCachedComments]
  );

  // Load more comments when scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (
          first.isIntersecting &&
          hasMore &&
          !loadingMore &&
          !loading &&
          Date.now() - lastLoadTime.current > 1000
        ) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchComments(nextPage, true);
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef && hasMore) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, loadingMore, loading, page, fetchComments]);

  // Initial load
  useEffect(() => {
    setPage(1);
    fetchComments(1, false);
  }, [fetchComments, sortBy]);

  // Subscribe to real-time events
  useEffect(() => {
    if (!postId) return;

    const unsubscribeNew = subscribe(EVENTS.COMMENTS.NEW, (data) => {
      if (
        String(data.post_id) === String(postId) &&
        data.user_id !== user?.id
      ) {
        startTransition(() => {
          setComments((prev) => {
            if (prev.some((c) => c.id === data.comment.id)) return prev;
            return [data.comment, ...prev];
          });
        });
      }
    });

    const unsubscribeUpdate = subscribe(EVENTS.COMMENTS.UPDATE, (data) => {
      if (
        String(data.post_id) === String(postId) &&
        data.user_id !== user?.id
      ) {
        startTransition(() => {
          setComments((prev) =>
            prev.map((comment) =>
              comment.id === data.comment_id
                ? { ...comment, content: data.content }
                : comment
            )
          );
        });
      }
    });

    const unsubscribeDelete = subscribe(EVENTS.COMMENTS.DELETE, (data) => {
      if (
        String(data.post_id) === String(postId) &&
        data.user_id !== user?.id
      ) {
        startTransition(() => {
          setComments((prev) =>
            prev.filter((comment) => comment.id !== data.comment_id)
          );
        });
      }
    });

    return () => {
      unsubscribeNew();
      unsubscribeUpdate();
      unsubscribeDelete();
    };
  }, [
    postId,
    user?.id,
    subscribe,
    EVENTS.COMMENTS.NEW,
    EVENTS.COMMENTS.UPDATE,
    EVENTS.COMMENTS.DELETE,
  ]);

  // Handle comment submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const comment = await api.createComment(postId, newComment);

      startTransition(() => {
        setComments((prev) => [comment, ...prev]);
      });

      emit(EVENTS.COMMENTS.NEW, {
        post_id: postId,
        comment: comment,
        user_id: user.id,
      });

      setNewComment("");
    } catch (err) {
      console.error("Error creating comment:", err);
      setError("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle comment deletion
  const handleDelete = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;

    const previousComments = [...comments];
    startTransition(() => {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    });

    try {
      await api.deleteComment(commentId);
      emit(EVENTS.COMMENTS.DELETE, {
        post_id: postId,
        comment_id: commentId,
        user_id: user.id,
      });
    } catch (err) {
      console.error("Error deleting comment:", err);
      setError("Failed to delete comment");
      setComments(previousComments);
    }
  };

  // Handle comment updates
  const handleUpdate = (commentId) => (updates) => {
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, ...updates } : c))
    );
  };

  if (loading && !comments.length) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="flex space-x-3 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg"
          >
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sort Controls */}
      <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2 sm:mx-0 sm:px-0">
        <CommentButton
          onClick={() => setSortBy(SortOptions.NEWEST)}
          icon={Clock}
          disabled={sortBy === SortOptions.NEWEST}
        >
          Newest
        </CommentButton>
        <CommentButton
          onClick={() => setSortBy(SortOptions.OLDEST)}
          icon={Clock}
          disabled={sortBy === SortOptions.OLDEST}
        >
          Oldest
        </CommentButton>
        <CommentButton
          onClick={() => setSortBy(SortOptions.MOST_LIKED)}
          icon={ThumbsUp}
          disabled={sortBy === SortOptions.MOST_LIKED}
        >
          Most Liked
        </CommentButton>
      </div>

      {/* Comments List */}
      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <Comment
              key={comment.id}
              postId={postId}
              comment={comment}
              currentUser={user}
              onUpdate={handleUpdate(comment.id)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400">
            {error || "No comments yet. Be the first to comment!"}
          </p>
        </div>
      )}

      {/* Loading More Indicator */}
      {loadingMore && (
        <div className="text-center py-4">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        </div>
      )}

      {/* Comment Form */}
      {isAuthenticated && (
        <div className="bg-white dark:bg-gray-900 pt-4 pb-2 mt-4 border-t border-gray-100 dark:border-gray-800">
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                rows="3"
              />
            </div>
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className={`
                  inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium
                  ${
                    submitting || !newComment.trim()
                      ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
                      : "bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700"
                  }
                  text-white transition-colors duration-200
                `}
              >
                <Send className="w-4 h-4 mr-2" />
                {submitting ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
