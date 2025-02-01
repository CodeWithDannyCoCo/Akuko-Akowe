"use client";

import { useState } from "react";
import { Edit2, Check, X } from "lucide-react";
import { api } from "../../lib/api";
import { useRealtime } from "../../lib/RealtimeContext";

export default function CommentEditButton({
  postId,
  commentId,
  initialContent,
  onUpdate,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [loading, setLoading] = useState(false);
  const { emit, EVENTS } = useRealtime();

  const handleEdit = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    if (loading || content === initialContent) {
      setIsEditing(false);
      setContent(initialContent);
      return;
    }

    setLoading(true);
    try {
      await api.updateComment(commentId, content);

      // Emit real-time event
      emit(EVENTS.COMMENTS.UPDATE, {
        post_id: postId,
        comment_id: commentId,
        content: content,
      });

      // Update parent component
      if (onUpdate) {
        onUpdate((prev) => ({
          ...prev,
          content: content,
        }));
      }

      setIsEditing(false);
    } catch (err) {
      console.error("Error updating comment:", err);
      // Revert on error
      setContent(initialContent);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setContent(initialContent);
  };

  if (isEditing) {
    return (
      <div className="flex flex-col space-y-2 w-full">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
          disabled={loading}
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="p-1 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            onClick={handleEdit}
            disabled={loading || content === initialContent}
            className="p-1 text-gray-500 hover:text-green-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Save"
          >
            <Check className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleEdit}
      className="p-1 sm:p-1.5 text-gray-500 hover:text-blue-500 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors -mt-1 sm:mt-0"
      title="Edit comment"
    >
      <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
    </button>
  );
}
