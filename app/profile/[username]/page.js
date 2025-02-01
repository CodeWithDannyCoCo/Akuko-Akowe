"use client";

import { useState, useEffect, Suspense } from "react";
import { Header } from "../../../components/core";
import { useAuth } from "../../../lib/AuthContext";
import { useRouter } from "next/navigation";
import { ProfileSkeleton } from "../../../components/skeletons";
import { useProfile } from "../../../lib/hooks/useProfile";
import ProfileHeader from "../../../components/profile/ProfileHeader";
import ProfileActivity from "../../../components/profile/ProfileActivity";
import ProfilePosts from "../../../components/profile/ProfilePosts";
import { motion } from "framer-motion";

// Loading fallbacks
const ActivityFallback = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 animate-pulse">
    <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center">
          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded mr-2"></div>
          <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      ))}
    </div>
  </div>
);

const PostsFallback = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 animate-pulse">
    <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
    <div className="space-y-4">
      {[...Array(2)].map((_, i) => (
        <div
          key={i}
          className="h-48 bg-gray-200 dark:bg-gray-700 rounded"
        ></div>
      ))}
    </div>
  </div>
);

export default function UserProfile({ params }) {
  const { user: currentUser, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const {
    profileData,
    posts,
    activities,
    loading,
    error,
    updateProfile,
    updatePosts,
    deletePost,
  } = useProfile(params.username || currentUser?.username);

  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (profileData) {
      setIsFollowing(profileData.is_followed);
    }
  }, [profileData]);

  const handleFollowChange = (newFollowState) => {
    setIsFollowing(newFollowState);
    updateProfile({
      ...profileData,
      followers_count: newFollowState
        ? profileData.followers_count + 1
        : profileData.followers_count - 1,
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <ProfileSkeleton />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto p-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 rounded-lg"
          >
            {error}
          </motion.div>
        </main>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center text-gray-600 dark:text-gray-400"
          >
            User not found
          </motion.div>
        </main>
      </div>
    );
  }

  const isOwnProfile = currentUser?.username === profileData.username;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <ProfileHeader
            profileData={profileData}
            isOwnProfile={isOwnProfile}
            isFollowing={isFollowing}
            onFollowToggle={handleFollowChange}
            onLogout={handleLogout}
          />
          <div className="space-y-4 sm:space-y-6">
            <Suspense fallback={<ActivityFallback />}>
              <ProfileActivity activities={activities} />
            </Suspense>
            <Suspense fallback={<PostsFallback />}>
              <ProfilePosts
                posts={posts}
                isOwnProfile={isOwnProfile}
                username={profileData.username}
                onPostUpdated={updatePosts}
                onPostDeleted={deletePost}
                onBackToFeed={() => router.push("/")}
              />
            </Suspense>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
