"use client";

import { Edit2, Trash2, X } from "lucide-react";
import { useEffect } from "react";

export default function CommentActionMenu({
  onEdit,
  onDelete,
  onClose,
  position,
  isAuthor,
}) {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest("[data-comment-menu]")) {
        onClose();
      }
    };

    document.addEventListener("click", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [onClose]);

  // Calculate if menu should appear above or below based on position
  const screenHeight = typeof window !== "undefined" ? window.innerHeight : 0;
  const shouldShowAbove = position.y > screenHeight / 2;

  return (
    <div
      data-comment-menu
      className="fixed z-50 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-3 w-[200px] sm:w-[240px]"
      style={{
        top: position.y,
        left: position.x,
        transform: shouldShowAbove
          ? "translate(-50%, -110%)"
          : "translate(-50%, 10%)",
      }}
    >
      <div className="px-2">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
        {isAuthor && (
          <div className="space-y-1">
            <button
              onClick={() => {
                onEdit();
                onClose();
              }}
              className="flex items-center w-full px-4 py-3 text-base text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Edit2 className="w-5 h-5 mr-3" />
              Edit
            </button>
            <button
              onClick={() => {
                onDelete();
                onClose();
              }}
              className="flex items-center w-full px-4 py-3 text-base text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5 mr-3" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
