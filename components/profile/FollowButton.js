"use client";

import { useState, useCallback, useEffect } from "react";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../lib/AuthContext";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";

const FOLLOW_DEBOUNCE = 300; // ms

const FollowButton = ({
  username,
  initialIsFollowing = false,
  onFollowChange,
  size = "default", // "small" | "default" | "large"
  variant = "primary", // "primary" | "secondary" | "ghost"
  className = "",
}) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Reset following state when initialIsFollowing prop changes
  useEffect(() => {
    setIsFollowing(initialIsFollowing);
  }, [initialIsFollowing]);

  // Handle follow/unfollow with optimistic update
  const handleFollowToggle = useCallback(async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isLoading) return;

    setError("");
    setIsLoading(true);
    const wasFollowing = isFollowing;

    try {
      // Optimistic update
      setIsFollowing(!wasFollowing);
      if (onFollowChange) {
        onFollowChange(!wasFollowing);
      }

      // API call
      if (wasFollowing) {
        await api.unfollowUser(username);
      } else {
        await api.followUser(username);
      }
    } catch (err) {
      // Revert optimistic update on error
      setIsFollowing(wasFollowing);
      if (onFollowChange) {
        onFollowChange(wasFollowing);
      }
      setError(err.message || "Failed to update follow status");
      console.error("Error toggling follow:", err);
    } finally {
      setIsLoading(false);
    }
  }, [
    isFollowing,
    isLoading,
    isAuthenticated,
    username,
    onFollowChange,
    router,
  ]);

  // Size variants
  const sizeClasses = {
    small: "px-3 py-1 text-sm",
    default: "px-4 py-1.5 text-sm",
    large: "px-5 py-2 text-base",
  };

  // Variant styles
  const variantClasses = {
    primary: isFollowing
      ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
      : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30",
    secondary: isFollowing
      ? "border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
      : "border border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20",
    ghost: isFollowing
      ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
      : "text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20",
  };

  return (
    <motion.button
      onClick={handleFollowToggle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={isLoading}
      className={`
        inline-flex items-center justify-center rounded-lg font-medium
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-70 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
        ${isFollowing ? "focus:ring-red-500" : "focus:ring-blue-500"}
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center"
          >
            {isFollowing ? (
              <>
                <UserMinus className="w-4 h-4 mr-1.5" />
                <span>{isHovered ? "Unfollow" : "Following"}</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-1.5" />
                <span>Follow</span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full mt-2 text-sm text-red-500 dark:text-red-400 bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-lg"
        >
          {error}
        </motion.div>
      )}
    </motion.button>
  );
};

export default FollowButton;
