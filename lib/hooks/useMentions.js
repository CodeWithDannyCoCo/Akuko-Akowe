"use client";

import { useState, useCallback, useEffect } from "react";
import { api } from "../api";
import debounce from "lodash/debounce";

export default function useMentions(textareaRef) {
  const [mentionSearch, setMentionSearch] = useState("");
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [loading, setLoading] = useState(false);

  // Debounced search function
  const searchUsers = useCallback(
    debounce(async (query) => {
      if (query.length < 1) {
        setMentionSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const users = await api.searchUsers(query);
        setMentionSuggestions(users);
      } catch (error) {
        console.error("Error searching users:", error);
        setMentionSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  // Handle text changes to detect @ mentions
  const handleTextChange = useCallback(
    (text, cursorPosition) => {
      const textBeforeCursor = text.slice(0, cursorPosition);
      const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

      if (mentionMatch) {
        const query = mentionMatch[1];
        setMentionSearch(query);
        searchUsers(query);

        if (textareaRef.current) {
          const { selectionEnd } = textareaRef.current;
          const textareaPosition = textareaRef.current.getBoundingClientRect();
          const lineHeight = parseInt(
            window.getComputedStyle(textareaRef.current).lineHeight
          );

          // Calculate the position of the cursor
          const textBeforeCursorLines = textBeforeCursor.split("\n");
          const currentLine = textBeforeCursorLines.length;
          const top =
            textareaPosition.top +
            (currentLine - 1) * lineHeight +
            lineHeight +
            window.scrollY;

          setMentionPosition({
            top,
            left: textareaPosition.left + 10,
          });
        }

        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    },
    [searchUsers, textareaRef]
  );

  // Handle mention selection
  const handleMentionSelect = useCallback(
    (user, setText) => {
      if (textareaRef.current) {
        const text = textareaRef.current.value;
        const cursorPosition = textareaRef.current.selectionEnd;
        const textBeforeCursor = text.slice(0, cursorPosition);
        const textAfterCursor = text.slice(cursorPosition);
        const mentionMatch = textBeforeCursor.match(/@\w*$/);

        if (mentionMatch) {
          const newText =
            textBeforeCursor.slice(0, -mentionMatch[0].length) +
            `@${user.username} ` +
            textAfterCursor;
          setText(newText);

          // Set cursor position after the mention
          const newCursorPosition =
            cursorPosition - mentionMatch[0].length + user.username.length + 2;
          setTimeout(() => {
            textareaRef.current.setSelectionRange(
              newCursorPosition,
              newCursorPosition
            );
          }, 0);
        }
      }

      setShowMentions(false);
      setMentionSuggestions([]);
    },
    [textareaRef]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      searchUsers.cancel();
    };
  }, [searchUsers]);

  return {
    mentionSuggestions,
    showMentions,
    mentionPosition,
    loading,
    handleTextChange,
    handleMentionSelect,
    closeMentions: () => setShowMentions(false),
  };
}
