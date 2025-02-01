"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { User } from "lucide-react";
import { getFullAvatarUrl } from "../../lib/api";
import CommentLikeButton from "./CommentLikeButton";
import CommentEditButton from "./CommentEditButton";
import CommentActionMenu from "./CommentActionMenu";
import CommentReplies from "./CommentReplies";

// Global state to track active menu
let activeMenuId = null;

export default function Comment({
  postId,
  comment,
  currentUser,
  onUpdate,
  onDelete,
  isReply = false,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const commentRef = useRef(null);
  const timeoutRef = useRef(null);

  // Close menu when another comment's menu is opened
  useEffect(() => {
    if (activeMenuId && activeMenuId !== comment.id) {
      setShowMenu(false);
    }
  }, [comment.id]);

  const handleTouchStart = useCallback(
    (event) => {
      event.preventDefault();
      const touch = event.touches[0];
      const element = commentRef.current;

      if (!element) return;

      timeoutRef.current = setTimeout(() => {
        // Close any other open menu
        if (activeMenuId && activeMenuId !== comment.id) {
          const prevMenu = document.querySelector(
            `[data-comment-id="${activeMenuId}"]`
          );
          if (prevMenu) {
            prevMenu.dispatchEvent(new CustomEvent("closemenu"));
          }
        }

        // Set this as the active menu
        activeMenuId = comment.id;

        // Calculate position based on the touch position
        const rect = element.getBoundingClientRect();
        const scrollY = window.scrollY || window.pageYOffset;

        setMenuPosition({
          x: touch.clientX,
          y: touch.clientY + scrollY,
        });

        setShowMenu(true);
      }, 500);
    },
    [comment.id]
  );

  const handleTouchEnd = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const handleCloseMenu = useCallback(() => {
    setShowMenu(false);
    if (activeMenuId === comment.id) {
      activeMenuId = null;
    }
  }, [comment.id]);

  // Listen for close menu events
  useEffect(() => {
    const element = commentRef.current;
    if (element) {
      element.addEventListener("closemenu", handleCloseMenu);
      return () => {
        element.removeEventListener("closemenu", handleCloseMenu);
      };
    }
  }, [handleCloseMenu]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const renderAvatar = () => {
    const avatarUrl = comment.author?.avatar
      ? getFullAvatarUrl(comment.author.avatar)
      : null;

    if (avatarUrl) {
      return (
        <div className="relative w-8 h-8 rounded-full overflow-hidden">
          <Image
            src={avatarUrl}
            alt={`${comment.author.username}'s avatar`}
            fill
            className="object-cover"
            sizes="32px"
          />
        </div>
      );
    }

    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
        <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </div>
    );
  };

  return (
    <>
      <div
        ref={commentRef}
        data-comment-id={comment.id}
        className={`relative flex space-x-2 sm:space-x-3 bg-gray-50/50 hover:bg-gray-50/80 dark:bg-gray-800/50 dark:hover:bg-gray-800/80 p-3 sm:p-4 rounded-lg transition-colors duration-200 backdrop-blur-sm border border-gray-100 dark:border-gray-700/50 touch-manipulation select-none ${
          showMenu ? "bg-gray-100/80 dark:bg-gray-700/80" : ""
        }`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <div className="flex-shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8">{renderAvatar()}</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start sm:items-center justify-between mb-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
              <Link
                href={`/profile/${comment.author.username}`}
                className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 break-words"
                onClick={(e) => e.stopPropagation()}
              >
                {comment.author.username}
              </Link>
              <span className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
                {new Date(comment.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="flex items-center">
              <CommentLikeButton
                postId={postId}
                commentId={comment.id}
                initialLikes={comment.likes_count || 0}
                isLiked={comment.is_liked || false}
                onUpdate={onUpdate}
              />
            </div>
          </div>
          {isEditing ? (
            <CommentEditButton
              postId={postId}
              commentId={comment.id}
              initialContent={comment.content}
              onUpdate={(updates) => {
                onUpdate(updates);
                setIsEditing(false);
              }}
            />
          ) : (
            <p className="text-[13px] sm:text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          )}

          {/* Only show replies section for top-level comments */}
          {!isReply && (
            <div className="relative mt-3 transition-all duration-200 ease-in-out">
              <CommentReplies
                postId={postId}
                comment={comment}
                onUpdate={onUpdate}
              />
            </div>
          )}
        </div>
      </div>

      {showMenu && (
        <CommentActionMenu
          position={menuPosition}
          isAuthor={currentUser?.username === comment.author.username}
          onEdit={() => {
            setIsEditing(true);
            handleCloseMenu();
          }}
          onDelete={() => {
            onDelete(comment.id);
            handleCloseMenu();
          }}
          onClose={handleCloseMenu}
        />
      )}
    </>
  );
}
