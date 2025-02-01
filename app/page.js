"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { Header } from "../components/core";
import { BlogPostSkeleton } from "../components/skeletons";
import { api } from "../lib/api";
import { useAuth } from "../lib/AuthContext";
import { CreatePostModal, VirtualizedPostList } from "../components/posts";
import { Plus } from "lucide-react";

// Cache duration for posts
const POSTS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const POSTS_PER_PAGE = 20;

// Update the feed type buttons to be more mobile-friendly
const FeedTypeButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`flex-1 sm:flex-none px-4 py-2.5 text-sm rounded-lg transition-colors ${
      active
        ? "bg-blue-500 text-white font-medium"
        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
    }`}
  >
    {children}
  </button>
);

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedType, setFeedType] = useState("general");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isPending, startTransition] = useTransition();
  const loaderRef = useRef(null);
  const lastLoadTime = useRef(Date.now());

  // Memoized cache key based on user and feed type
  const cacheKey = useMemo(() => {
    return `feed-${feedType}-${user?.id || "guest"}`;
  }, [feedType, user?.id]);

  const loadPosts = useCallback(
    async (pageNum = 1, append = false) => {
      try {
        setLoadingMore(append);
        if (!append) setLoading(true);

        // Check cache for first page
        if (pageNum === 1 && !append) {
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            const { timestamp, data } = JSON.parse(cached);
            if (Date.now() - timestamp < POSTS_CACHE_DURATION) {
              setPosts(data.posts);
              setHasMore(data.hasMore);
              setLoading(false);
              return;
            }
            localStorage.removeItem(cacheKey);
          }
        }

        let data;
        if (isAuthenticated && feedType === "personalized") {
          try {
            data = await api.getPersonalizedPosts(pageNum, POSTS_PER_PAGE);
          } catch (err) {
            console.error("Error fetching personalized feed:", err);
            data = await api.getPosts(pageNum, POSTS_PER_PAGE);
            startTransition(() => setFeedType("general"));
          }
        } else {
          data = await api.getPosts(pageNum, POSTS_PER_PAGE);
        }

        // Update posts with transition for smooth UI
        startTransition(() => {
          setPosts((prevPosts) =>
            append ? [...prevPosts, ...data.posts] : data.posts
          );
          setHasMore(data.hasMore);
        });

        // Cache first page results
        if (pageNum === 1) {
          localStorage.setItem(
            cacheKey,
            JSON.stringify({
              timestamp: Date.now(),
              data,
            })
          );
        }

        setError("");
        lastLoadTime.current = Date.now();
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("Failed to load posts. Please try again later.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [feedType, isAuthenticated, cacheKey]
  );

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (
          first.isIntersecting &&
          hasMore &&
          !loadingMore &&
          !loading &&
          Date.now() - lastLoadTime.current > 1000 // Throttle loading
        ) {
          const nextPage = page + 1;
          setPage(nextPage);
          loadPosts(nextPage, true);
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [hasMore, loadingMore, loading, page, loadPosts]);

  // Load initial posts
  useEffect(() => {
    setPage(1);
    loadPosts(1, false);
  }, [feedType, isAuthenticated, loadPosts]);

  const openModal = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handlePostCreated = useCallback((newPost) => {
    startTransition(() => {
      setPosts((prevPosts) => [newPost, ...prevPosts]);
    });
    closeModal();
  }, []);

  const handlePostUpdated = useCallback((updatedPost) => {
    startTransition(() => {
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
    });
  }, []);

  const handlePostDeleted = useCallback((deletedPostId) => {
    startTransition(() => {
      setPosts((prevPosts) => prevPosts.filter((p) => p.id !== deletedPostId));
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
            <div className="w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white leading-tight">
                {isAuthenticated && user ? (
                  feedType === "personalized" ? (
                    <>Your Personal Feed, {user.username}</>
                  ) : (
                    <>Explore Posts, {user.username}</>
                  )
                ) : (
                  "Latest Blog Posts"
                )}
              </h1>
              {isAuthenticated && user && (
                <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-400">
                  {feedType === "personalized"
                    ? "Here are the latest posts from people you follow"
                    : "Discover stories from all our writers"}
                </p>
              )}
            </div>
            {isAuthenticated && (
              <div className="flex w-full sm:w-auto gap-2 sm:gap-3">
                <FeedTypeButton
                  active={feedType === "general"}
                  onClick={() => setFeedType("general")}
                >
                  General Feed
                </FeedTypeButton>
                <FeedTypeButton
                  active={feedType === "personalized"}
                  onClick={() => setFeedType("personalized")}
                >
                  Your Feed
                </FeedTypeButton>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}

          {loading && posts.length === 0 ? (
            <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
              {[...Array(3)].map((_, index) => (
                <BlogPostSkeleton key={index} />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                {isAuthenticated && feedType === "personalized"
                  ? "No posts in your personalized feed yet. Try following some users!"
                  : "No posts yet. Be the first to share your story!"}
              </p>
            </div>
          ) : (
            <>
              <VirtualizedPostList
                posts={posts}
                currentUser={user}
                onPostUpdated={handlePostUpdated}
                onPostDeleted={handlePostDeleted}
              />
              {/* Infinite scroll loader */}
              <div ref={loaderRef} className="py-4 px-2 sm:px-0">
                {loadingMore && (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-500"></div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <button
          onClick={openModal}
          className="fixed bottom-6 right-4 sm:bottom-8 sm:right-8 bg-blue-500 text-white p-3 sm:p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors duration-200 z-10"
          title={isAuthenticated ? "Create new post" : "Login to create post"}
        >
          <Plus size={22} className="sm:w-6 sm:h-6" />
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
