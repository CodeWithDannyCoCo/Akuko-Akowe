"use client";

import { useState, useCallback, useMemo, useTransition } from "react";
import { BlogPostCard } from "../posts";
import debounce from "lodash/debounce";
import { Search, ArrowUpDown } from "lucide-react";

const POST_SPACING = "space-y-6 sm:space-y-8"; // Consistent spacing between posts
const SORT_OPTIONS = {
  NEWEST: "newest",
  OLDEST: "oldest",
  MOST_LIKED: "most_liked",
};

// Enhanced sort button with better mobile interaction
const SortButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
      ${
        active
          ? "bg-blue-500 text-white shadow-sm hover:bg-blue-600"
          : "bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600/50"
      }
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900
    `}
  >
    {children}
  </button>
);

function ProfilePosts({
  posts,
  isOwnProfile,
  username,
  onPostUpdated,
  onPostDeleted,
  onBackToFeed,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState(SORT_OPTIONS.NEWEST);
  const [isPending, startTransition] = useTransition();

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

  // Process and sort posts
  const processedPosts = useMemo(() => {
    let filtered = [...posts];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title?.toLowerCase().includes(query) ||
          post.content?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    switch (sortBy) {
      case SORT_OPTIONS.OLDEST:
        filtered.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
        break;
      case SORT_OPTIONS.MOST_LIKED:
        filtered.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
        break;
      case SORT_OPTIONS.NEWEST:
      default:
        filtered.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
    }

    return filtered;
  }, [posts, searchQuery, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {isOwnProfile ? "Your Posts" : `${username}'s Posts`}
        </h2>
        <button
          onClick={onBackToFeed}
          className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
        >
          ← Back to Feed
        </button>
      </div>

      {/* Search and Sort Controls */}
      <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 pt-2 pb-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search posts by title or content..."
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                transition-colors duration-200"
            />
          </div>

          {/* Sort Buttons */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {Object.entries(SORT_OPTIONS).map(([key, value]) => (
              <SortButton
                key={key}
                active={sortBy === value}
                onClick={() => handleSortChange(value)}
              >
                {key.charAt(0) + key.slice(1).toLowerCase().replace("_", " ")}
              </SortButton>
            ))}
          </div>
        </div>
      </div>

      {/* Posts List */}
      {isPending ? (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
          Updating...
        </div>
      ) : processedPosts.length === 0 ? (
        <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery
              ? "No posts found matching your search"
              : isOwnProfile
              ? "You haven't created any posts yet"
              : `${username} hasn't created any posts yet`}
          </p>
        </div>
      ) : (
        <div className={POST_SPACING}>
          {processedPosts.map((post) => (
            <div
              key={post.id}
              className="transform transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              <BlogPostCard
                post={post}
                onPostUpdated={onPostUpdated}
                onPostDeleted={onPostDeleted}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProfilePosts;
