"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Heart, MessageSquare, Bookmark, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ITEMS_PER_PAGE = 5;
const CACHE_KEY = "profile-activities-cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Activity type components with animations
const ActivityItem = ({ icon: Icon, label, date, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    whileHover={{ scale: 1.02 }}
    onClick={onClick}
    className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded-lg cursor-pointer transition-colors group"
  >
    <div className="mr-3 p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors">
      <Icon className="w-4 h-4" />
    </div>
    <div className="flex-1 min-w-0">
      <span className="block truncate">{label}</span>
      <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
        {new Date(date).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })}
      </span>
    </div>
  </motion.div>
);

function ProfileActivity({ activities }) {
  const router = useRouter();
  const [visibleActivities, setVisibleActivities] = useState({
    likes: [],
    comments: [],
    bookmarks: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const observerRef = useRef();
  const loadingRef = useRef();

  // Cache management with error handling
  const cacheActivities = useCallback((data) => {
    try {
      const cacheData = {
        timestamp: Date.now(),
        data,
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn("Failed to cache activities:", error);
    }
  }, []);

  const getCachedActivities = useCallback(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const { timestamp, data } = JSON.parse(cached);
      if (Date.now() - timestamp > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      return data;
    } catch (error) {
      console.warn("Error reading cache:", error);
      return null;
    }
  }, []);

  // Intersection Observer for infinite scroll with cleanup
  const lastElementRef = useCallback(
    (node) => {
      if (isLoading) return;

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) {
        observerRef.current.observe(node);
      }
    },
    [isLoading, hasMore]
  );

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Filter activities based on active tab
  const filteredActivities = useMemo(() => {
    const allActivities = [];

    if (activeTab === "all" || activeTab === "likes") {
      allActivities.push(
        ...visibleActivities.likes.map((item) => ({ ...item, type: "like" }))
      );
    }
    if (activeTab === "all" || activeTab === "comments") {
      allActivities.push(
        ...visibleActivities.comments.map((item) => ({
          ...item,
          type: "comment",
        }))
      );
    }
    if (activeTab === "all" || activeTab === "bookmarks") {
      allActivities.push(
        ...visibleActivities.bookmarks.map((item) => ({
          ...item,
          type: "bookmark",
        }))
      );
    }

    return allActivities.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
  }, [visibleActivities, activeTab]);

  // Load activities progressively
  useEffect(() => {
    if (activities) {
      const loadActivities = async () => {
        setIsLoading(true);

        try {
          // Try to load from cache first
          const cached = getCachedActivities();
          if (cached && page === 1) {
            setVisibleActivities(cached);
            setIsLoading(false);
            return;
          }

          // Calculate slice ranges
          const start = 0;
          const end = page * ITEMS_PER_PAGE;

          // Update visible activities
          const newActivities = {
            likes: activities.likes?.slice(start, end) || [],
            comments: activities.comments?.slice(start, end) || [],
            bookmarks: activities.bookmarks?.slice(start, end) || [],
          };

          setVisibleActivities(newActivities);

          // Cache first page
          if (page === 1) {
            cacheActivities(newActivities);
          }

          // Check if we have more items to load
          setHasMore(
            (activities.likes?.length || 0) > end ||
              (activities.comments?.length || 0) > end ||
              (activities.bookmarks?.length || 0) > end
          );
        } catch (error) {
          console.error("Error loading activities:", error);
        } finally {
          setIsLoading(false);
        }
      };

      loadActivities();
    }
  }, [activities, page, cacheActivities, getCachedActivities]);

  const handleActivityClick = (activity) => {
    if (activity.post_id) {
      router.push(`/post/${activity.post_id}`);
    }
  };

  // Loading skeleton with animation
  if (isLoading && page === 1) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h3>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center animate-pulse">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full mr-3"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mt-2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Activity
        </h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              activeTab === "all"
                ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab("likes")}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              activeTab === "likes"
                ? "bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50"
            }`}
          >
            Likes
          </button>
          <button
            onClick={() => setActiveTab("comments")}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              activeTab === "comments"
                ? "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50"
            }`}
          >
            Comments
          </button>
          <button
            onClick={() => setActiveTab("bookmarks")}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              activeTab === "bookmarks"
                ? "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50"
            }`}
          >
            Bookmarks
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {filteredActivities.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-8"
          >
            <Clock className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No recent activity
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            {filteredActivities.map((activity, index) => {
              let icon, label;
              switch (activity.type) {
                case "like":
                  icon = Heart;
                  label = "Liked a post";
                  break;
                case "comment":
                  icon = MessageSquare;
                  label = "Commented on a post";
                  break;
                case "bookmark":
                  icon = Bookmark;
                  label = "Bookmarked a post";
                  break;
                default:
                  return null;
              }

              return (
                <ActivityItem
                  key={`${activity.type}-${activity.id}`}
                  icon={icon}
                  label={label}
                  date={activity.created_at}
                  onClick={() => handleActivityClick(activity)}
                  ref={
                    index === filteredActivities.length - 1
                      ? lastElementRef
                      : null
                  }
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading && page > 1 && (
        <div ref={loadingRef} className="flex justify-center py-4">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}

export default ProfileActivity;
