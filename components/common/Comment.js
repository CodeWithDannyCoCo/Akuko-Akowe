"use client";

import { useState } from "react";
import Image from "next/image";
import { User, Heart, MessageCircle, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getFullAvatarUrl } from "../../lib/api";
import ReactionPicker from "./ReactionPicker";
import ReactionCounts from "./ReactionCounts";

export default function Comment({
  comment,
  onReply,
  onLike,
  onUnlike,
  onReact,
  onRemoveReaction,
  currentUser,
  className = "",
}) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState({ x: 0, y: 0 });

  const handleReactionClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPickerPosition({
      x: rect.left,
      y: rect.bottom + window.scrollY,
    });
    setShowReactionPicker(true);
  };

  const handleReactionSelect = async (reactionType) => {
    await onReact(comment.id, reactionType.id);
    setShowReactionPicker(false);
  };

  const handleReactionRemove = async (reactionTypeId) => {
    await onRemoveReaction(comment.id, reactionTypeId);
  };

  const userReactions = comment.reactions?.filter(
    (reaction) => reaction.user.id === currentUser?.id
  );

  return (
    <div className={`flex gap-3 ${className}`}>
      {comment.user.avatar ? (
        <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
          <Image
            src={getFullAvatarUrl(comment.user.avatar)}
            alt={`${comment.user.username}'s avatar`}
            fill
            className="object-cover"
            sizes="32px"
          />
        </div>
      ) : (
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </div>
      )}

      <div className="flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="font-medium text-gray-900 dark:text-white">
              {comment.user.username}
            </span>
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(new Date(comment.created_at), {
                addSuffix: true,
              })}
            </span>
          </div>
          <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        <p className="text-gray-800 dark:text-gray-200">{comment.content}</p>

        <div className="flex items-center gap-4 text-sm">
          <button
            onClick={() =>
              comment.liked ? onUnlike(comment.id) : onLike(comment.id)
            }
            className={`flex items-center gap-1 ${
              comment.liked
                ? "text-red-500 dark:text-red-400"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>{comment.likes_count || ""}</span>
          </button>

          <button
            onClick={() => onReply(comment)}
            className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{comment.replies_count || ""}</span>
          </button>

          <button
            onClick={handleReactionClick}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            React
          </button>
        </div>

        {comment.reaction_counts && (
          <ReactionCounts
            reactionCounts={comment.reaction_counts}
            commentId={comment.id}
            className="mt-2"
          />
        )}
      </div>

      {showReactionPicker && (
        <ReactionPicker
          position={pickerPosition}
          onSelect={handleReactionSelect}
          onClose={() => setShowReactionPicker(false)}
          userReactions={userReactions}
          onRemoveReaction={handleReactionRemove}
        />
      )}
    </div>
  );
}
