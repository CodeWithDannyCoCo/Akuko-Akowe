"use client";

import { useState, useCallback } from "react";
import { ChevronDown, ChevronUp, MessageCircle } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/AuthContext";
import Comment from "./Comment";

export default function CommentReplies({ postId, comment, onUpdate }) {
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const loadReplies = useCallback(async () => {
    if (loading) return;

    try {
      setLoading(true);
      const data = await api.getReplies(comment.id);
      setReplies(data || []);
    } catch (error) {
      console.error("Error loading replies:", error);
    } finally {
      setLoading(false);
    }
  }, [comment.id, loading]);

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim() || submitting) return;

    setSubmitting(true);
    try {
      const newReply = await api.createComment(
        postId,
        replyContent,
        comment.id
      );

      // Show replies section
      setShowReplies(true);

      // Add the new reply to the list
      setReplies((prev) => [newReply, ...prev]);

      // Clear the input and hide the reply form
      setReplyContent("");
      setShowReplyInput(false);

      // Update parent comment's reply count
      onUpdate((prev) => ({
        ...prev,
        replies_count: (prev.replies_count || 0) + 1,
      }));
    } catch (error) {
      console.error("Error creating reply:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReply = async (replyId) => {
    try {
      await api.deleteComment(replyId);
      setReplies((prev) => prev.filter((reply) => reply.id !== replyId));

      // Update parent comment's reply count
      onUpdate((prev) => ({
        ...prev,
        replies_count: Math.max(0, (prev.replies_count || 0) - 1),
      }));
    } catch (error) {
      console.error("Error deleting reply:", error);
    }
  };

  const handleUpdateReply = (replyId) => (updates) => {
    setReplies((prev) =>
      prev.map((reply) =>
        reply.id === replyId ? { ...reply, ...updates } : reply
      )
    );
  };

  const toggleReplies = () => {
    const newState = !showReplies;
    setShowReplies(newState);
    if (newState) {
      loadReplies();
    }
  };

  return (
    <div className="mt-2">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleReplies}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          {showReplies ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
          {comment.replies_count || 0} Replies
        </button>
        {isAuthenticated && !showReplyInput && (
          <button
            onClick={() => setShowReplyInput(true)}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <MessageCircle className="w-4 h-4" />
            Reply
          </button>
        )}
      </div>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          showReplies || showReplyInput ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div
            className={`${showReplies || showReplyInput ? "mt-3 mb-6" : ""}`}
          >
            {showReplyInput && (
              <form onSubmit={handleSubmitReply} className="mb-3">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={2}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReplyInput(false);
                      setReplyContent("");
                    }}
                    className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !replyContent.trim()}
                    className="px-3 py-1.5 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Posting..." : "Post Reply"}
                  </button>
                </div>
              </form>
            )}

            {showReplies && (
              <div className="pl-4 border-l-2 border-gray-100 dark:border-gray-700 space-y-3">
                {loading ? (
                  <div className="animate-pulse space-y-3">
                    {[...Array(2)].map((_, i) => (
                      <div
                        key={i}
                        className="h-20 bg-gray-100 dark:bg-gray-800 rounded-lg"
                      />
                    ))}
                  </div>
                ) : replies.length > 0 ? (
                  replies.map((reply) => (
                    <Comment
                      key={reply.id}
                      postId={postId}
                      comment={reply}
                      currentUser={user}
                      onUpdate={(updates) => {
                        handleUpdateReply(reply.id)(updates);
                        // Notify parent to update virtualizer
                        onUpdate((prev) => ({ ...prev }));
                      }}
                      onDelete={handleDeleteReply}
                      isReply={true}
                    />
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
                    No replies yet. Be the first to reply!
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
