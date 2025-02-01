"use client";

import { useState, useEffect } from "react";
import { UserAvatar } from "../ui";
import { Settings, LogOut, UserPlus, UserMinus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getFullAvatarUrl } from "../../lib/api";
import { motion } from "framer-motion";
import FollowButton from "./FollowButton";

// Shimmer effect for loading state
const ShimmerEffect = () => (
  <div className="animate-shimmer">
    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
  </div>
);

// Enhanced avatar component with blur placeholder and loading states
const EnhancedAvatar = ({ user, className }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const avatarUrl = user?.avatar ? getFullAvatarUrl(user.avatar) : null;

  return (
    <div className={`relative rounded-full overflow-hidden ${className}`}>
      {avatarUrl ? (
        <>
          <Image
            src={avatarUrl}
            alt={`${user.username}'s avatar`}
            width={128}
            height={128}
            className={`object-cover transition-opacity duration-300 w-[88px] h-[88px] sm:w-[128px] sm:h-[128px] ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoadingComplete={() => setImageLoaded(true)}
            priority={true}
            sizes="(max-width: 640px) 88px, 128px"
          />
          {!imageLoaded && <ShimmerEffect />}
        </>
      ) : (
        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <span className="text-2xl font-medium text-gray-500 dark:text-gray-400">
            {user?.username?.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
};

// Stats item component
const StatItem = ({ label, value }) => (
  <div className="text-center sm:text-left">
    <span className="block text-lg sm:text-base font-semibold text-gray-900 dark:text-white transition-colors">
      {value.toLocaleString()}
    </span>
    <span className="block text-xs sm:text-sm text-gray-500 dark:text-gray-400 transition-colors">
      {label}
    </span>
  </div>
);

const ProfileHeader = ({
  profileData,
  isOwnProfile,
  isFollowing,
  onFollowToggle,
  onLogout,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 transition-all duration-500 ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {isOwnProfile && (
        <div className="flex items-center justify-end gap-2 mb-4 sm:hidden">
          <Link
            href="/settings"
            className="flex items-center px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
          </Link>
          <button
            onClick={onLogout}
            className="flex items-center px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col items-center sm:items-start sm:flex-row sm:space-x-6">
        <div className="flex flex-col items-center mb-6 sm:mb-0 w-full sm:w-auto">
          <div className="relative w-[88px] h-[88px] sm:w-32 sm:h-32 flex-shrink-0 mb-4">
            <EnhancedAvatar user={profileData} className="w-full h-full" />
          </div>
          <div className="text-center sm:hidden w-full px-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">
              {profileData.username}
            </h1>
            {profileData.bio && (
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 max-w-[280px] mx-auto transition-colors">
                {profileData.bio}
              </p>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0 w-full">
          <div className="flex flex-col space-y-4">
            <div className="hidden sm:flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex flex-col sm:items-start">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-0 transition-colors">
                  {profileData.username}
                </h1>
                {profileData.bio && (
                  <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base max-w-md transition-colors">
                    {profileData.bio}
                  </p>
                )}
              </div>

              <div className="hidden sm:flex items-center justify-end space-x-3 flex-shrink-0">
                {isOwnProfile ? (
                  <>
                    <Link
                      href="/settings"
                      className="flex items-center px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Settings className="w-4 h-4 mr-1.5" />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={onLogout}
                      className="flex items-center px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-1.5" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <FollowButton
                    username={profileData.username}
                    initialIsFollowing={isFollowing}
                    onFollowChange={onFollowToggle}
                    variant="secondary"
                  />
                )}
              </div>
            </div>

            {!isOwnProfile && (
              <div className="flex sm:hidden items-center justify-center w-full mb-4">
                <FollowButton
                  username={profileData.username}
                  initialIsFollowing={isFollowing}
                  onFollowChange={onFollowToggle}
                  size="large"
                  variant="primary"
                  className="w-full max-w-[200px]"
                />
              </div>
            )}

            <div className="grid grid-cols-3 w-full sm:flex sm:flex-wrap justify-center sm:justify-start gap-6 sm:gap-8 text-sm border-t border-gray-100 dark:border-gray-700 pt-4 mt-2">
              <StatItem label="posts" value={profileData.posts_count} />
              <StatItem label="followers" value={profileData.followers_count} />
              <StatItem label="following" value={profileData.following_count} />
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400 text-center sm:text-left border-t border-gray-100 dark:border-gray-700 pt-4 mt-2 transition-colors">
              Joined{" "}
              {profileData.date_joined
                ? new Date(profileData.date_joined).toLocaleDateString(
                    "en-US",
                    {
                      month: "long",
                      year: "numeric",
                    }
                  )
                : "Unknown date"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
