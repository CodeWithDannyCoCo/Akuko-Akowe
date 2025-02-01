"use client";

import { useState, useEffect, useRef } from "react";
import { Smile } from "lucide-react";
import { api } from "../../lib/api";

export default function ReactionPicker({
  onSelect,
  onClose,
  position = "bottom",
  align = "left",
  userReactions = [],
  disabled = false,
}) {
  const [reactionTypes, setReactionTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    const loadReactionTypes = async () => {
      try {
        const types = await api.getReactionTypes();
        setReactionTypes(types);
      } catch (error) {
        console.error("Error loading reaction types:", error);
      } finally {
        setLoading(false);
      }
    };

    loadReactionTypes();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const getPositionClasses = () => {
    let classes = "absolute ";

    if (position === "bottom") {
      classes += "top-full mt-1 ";
    } else if (position === "top") {
      classes += "bottom-full mb-1 ";
    }

    if (align === "left") {
      classes += "left-0 ";
    } else if (align === "right") {
      classes += "right-0 ";
    }

    return classes;
  };

  if (loading) {
    return (
      <div className={getPositionClasses()}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2">
          <div className="animate-pulse flex space-x-2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`${getPositionClasses()} z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2`}
    >
      <div className="flex space-x-1">
        {reactionTypes.map((type) => {
          const isSelected = userReactions.includes(type.emoji);
          return (
            <button
              key={type.id}
              onClick={() => onSelect(type)}
              disabled={disabled}
              className={`
                w-8 h-8 flex items-center justify-center rounded-full text-lg
                transition-all duration-200
                ${
                  isSelected
                    ? "bg-blue-100 dark:bg-blue-900 scale-110"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }
                ${disabled ? "opacity-50 cursor-not-allowed" : ""}
              `}
              title={type.name}
            >
              {type.emoji}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ReactionButton({ onClick, disabled, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center gap-1 px-2 py-1 rounded-md text-sm
        text-gray-500 dark:text-gray-400
        hover:bg-gray-100 dark:hover:bg-gray-700
        transition-colors duration-200
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <Smile className="w-4 h-4" />
      {children}
    </button>
  );
}
