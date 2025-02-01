"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { User } from "lucide-react";
import { getFullAvatarUrl } from "../../lib/api";

export default function MentionSuggestions({
  suggestions,
  loading,
  onSelect,
  onClose,
  position,
  visible,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      className="absolute z-50 w-64 max-h-48 overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      {loading ? (
        <div className="p-2">
          <div className="animate-pulse space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-2 p-2">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
              </div>
            ))}
          </div>
        </div>
      ) : suggestions.length > 0 ? (
        <div className="py-1">
          {suggestions.map((user) => (
            <button
              key={user.id}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => onSelect(user)}
            >
              {user.avatar ? (
                <div className="relative w-8 h-8 rounded-full overflow-hidden">
                  <Image
                    src={getFullAvatarUrl(user.avatar)}
                    alt={`${user.username}'s avatar`}
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
              <span className="font-medium">{user.username}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="p-3 text-sm text-gray-500 dark:text-gray-400 text-center">
          No users found
        </div>
      )}
    </div>
  );
}
