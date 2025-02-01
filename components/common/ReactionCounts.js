"use client";

import { useState } from "react";
import { api } from "../../lib/api";
import Image from "next/image";
import { User } from "lucide-react";
import { getFullAvatarUrl } from "../../lib/api";

export default function ReactionCounts({
  reactionCounts,
  commentId,
  className = "",
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipUsers, setTooltipUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadReactionUsers = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const reactions = await api.getCommentReactions(commentId);
      setTooltipUsers(reactions);
    } catch (error) {
      console.error("Error loading reactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMouseEnter = () => {
    setShowTooltip(true);
    loadReactionUsers();
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  if (!reactionCounts || Object.keys(reactionCounts).length === 0) {
    return null;
  }

  return (
    <div
      className={`relative inline-flex items-center gap-0.5 ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {Object.entries(reactionCounts).map(([emoji, count], index) => (
        <div
          key={emoji}
          className={`
            flex items-center
            ${index > 0 ? "-ml-1" : ""}
            px-1.5 py-0.5 text-sm
            bg-gray-100 dark:bg-gray-800
            border border-gray-200 dark:border-gray-700
            rounded-full
          `}
        >
          <span className="mr-1">{emoji}</span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {count}
          </span>
        </div>
      ))}

      {showTooltip && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 z-50">
          {loading ? (
            <div className="animate-pulse space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {tooltipUsers.map((reaction) => (
                <div key={reaction.id} className="flex items-center gap-2">
                  {reaction.user.avatar ? (
                    <div className="relative w-8 h-8 rounded-full overflow-hidden">
                      <Image
                        src={getFullAvatarUrl(reaction.user.avatar)}
                        alt={`${reaction.user.username}'s avatar`}
                        fill
                        className="object-cover"
                        sizes="32px"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {reaction.user.username}
                  </span>
                  <span className="text-lg ml-auto">
                    {reaction.reaction_type.emoji}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
