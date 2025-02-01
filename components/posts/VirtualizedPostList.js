"use client";

import {
  Suspense,
  lazy,
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
  useTransition,
} from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import debounce from "lodash/debounce";

// Lazy load BlogPostCard
const BlogPostCard = lazy(() => import("./BlogPostCard"));

// Cache key for posts
const POSTS_CACHE_KEY = "feed-posts-cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const POST_SPACING = 16;
const MOBILE_CONTROLS_HEIGHT = 140; // Increased to accommodate enhanced controls
const HEADER_HEIGHT = 64;

// Loading fallback for individual posts
const PostCardFallback = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 animate-pulse">
    <div className="flex items-center space-x-4 mb-4">
      <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      <div className="space-y-2 flex-1">
        <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-3 w-1/6 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
    <div className="space-y-3">
      <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  </div>
);

// Post wrapper component to handle spacing
const PostWrapper = ({ children, isLast }) => (
  <div className={`${!isLast ? "mb-4" : ""}`}>{children}</div>
);

const SortOptions = {
  NEWEST: "newest",
  OLDEST: "oldest",
  MOST_LIKED: "most_liked",
};

// Add a custom hook for viewport height
const useViewportHeight = () => {
  const [height, setHeight] = useState(
    typeof window !== "undefined" ? window.innerHeight : 800
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial measurement

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return height;
};

// Add a new SortButton component for better aesthetics
const SortButton = ({ active, onClick, children, icon }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium 
      transition-all duration-200 whitespace-nowrap min-w-[100px] justify-center
      ${
        active
          ? "bg-blue-500 text-white shadow-md hover:bg-blue-600"
          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/70 border border-gray-200 dark:border-gray-700"
      }
    `}
  >
    {icon}
    {children}
  </button>
);

export default function VirtualizedPostList({
  posts,
  currentUser,
  onPostUpdated,
  onPostDeleted,
}) {
  const viewportHeight = useViewportHeight();
  const [sortBy, setSortBy] = useState(SortOptions.NEWEST);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const parentRef = useRef(null);

  // Cache management
  const cacheKey = useMemo(() => {
    return `${POSTS_CACHE_KEY}-${currentUser?.id || "guest"}`;
  }, [currentUser?.id]);

  const cachePosts = useCallback(
    (data) => {
      try {
        const cacheData = {
          timestamp: Date.now(),
          data,
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      } catch (error) {
        console.error("Error caching posts:", error);
      }
    },
    [cacheKey]
  );

  const getCachedPosts = useCallback(() => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return null;

      const { timestamp, data } = JSON.parse(cached);
      if (Date.now() - timestamp > CACHE_DURATION) {
        localStorage.removeItem(cacheKey);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error reading cached posts:", error);
      return null;
    }
  }, [cacheKey]);

  // Process and filter posts
  const processedPosts = useMemo(() => {
    let filtered = [...posts];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title?.toLowerCase().includes(query) ||
          post.content?.toLowerCase().includes(query) ||
          post.author?.username.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    switch (sortBy) {
      case SortOptions.OLDEST:
        filtered.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
        break;
      case SortOptions.MOST_LIKED:
        filtered.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
        break;
      case SortOptions.NEWEST:
      default:
        filtered.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
    }

    return filtered;
  }, [posts, searchQuery, sortBy]);

  // Virtual list setup with spacing
  const virtualizer = useVirtualizer({
    count: processedPosts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 400 + POST_SPACING, // Height + spacing
    overscan: 5,
    measureElement: (element) => {
      const height = element.getBoundingClientRect().height;
      return height + POST_SPACING; // Add spacing to each measurement
    },
  });

  // Update cache when posts change
  useEffect(() => {
    if (posts.length > 0) {
      cachePosts(posts);
    }
  }, [posts, cachePosts]);

  // Debounced search handler
  const handleSearch = debounce((value) => {
    startTransition(() => {
      setSearchQuery(value);
    });
  }, 300);

  // Handle sort change
  const handleSortChange = useCallback((option) => {
    startTransition(() => {
      setSortBy(option);
    });
  }, []);

  // Calculate list height based on viewport
  const listHeight = useMemo(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
    const offset = isMobile ? MOBILE_CONTROLS_HEIGHT : 80; // Less offset on desktop
    return viewportHeight - HEADER_HEIGHT - offset;
  }, [viewportHeight]);

  return (
    <div className="space-y-4">
      {/* Enhanced Search and Sort Controls */}
      <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 pt-3 pb-4">
        <div className="flex flex-col gap-4">
          {/* Enhanced Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search posts by title, content, or author..."
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                dark:text-white text-base placeholder-gray-400 dark:placeholder-gray-500
                transition-colors duration-200"
            />
          </div>

          {/* Enhanced Sort Buttons */}
          <div className="flex gap-2 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0 scrollbar-hide">
            <SortButton
              active={sortBy === SortOptions.NEWEST}
              onClick={() => handleSortChange(SortOptions.NEWEST)}
              icon={
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                  />
                </svg>
              }
            >
              Newest
            </SortButton>
            <SortButton
              active={sortBy === SortOptions.OLDEST}
              onClick={() => handleSortChange(SortOptions.OLDEST)}
              icon={
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4h13M3 8h9m-9 4h6m4 0l4 4m0 0l4-4m-4 4v-12"
                  />
                </svg>
              }
            >
              Oldest
            </SortButton>
            <SortButton
              active={sortBy === SortOptions.MOST_LIKED}
              onClick={() => handleSortChange(SortOptions.MOST_LIKED)}
              icon={
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              }
            >
              Most Liked
            </SortButton>
          </div>
        </div>
      </div>

      {processedPosts.length === 0 ? (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          {searchQuery ? "No posts found matching your search" : "No posts yet"}
        </div>
      ) : (
        <div
          ref={parentRef}
          className="overflow-auto"
          style={{
            height: `${listHeight}px`,
            contain: "strict",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const post = processedPosts[virtualRow.index];
              const isLast = virtualRow.index === processedPosts.length - 1;

              return (
                <div
                  key={post.id}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                  className="absolute top-0 left-0 w-full px-2 sm:px-0"
                  style={{
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <PostWrapper isLast={isLast}>
                    <Suspense fallback={<PostCardFallback />}>
        <BlogPostCard
          post={post}
          onPostUpdated={onPostUpdated}
          onPostDeleted={onPostDeleted}
        />
                    </Suspense>
                  </PostWrapper>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Loading indicator - Made more mobile-friendly */}
      {isPending && (
        <div className="fixed bottom-20 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
          Updating...
        </div>
      )}
    </div>
  );
}
