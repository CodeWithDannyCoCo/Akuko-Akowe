"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "../lib/AuthContext";
import { api } from "../lib/api";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react";

// Dynamically import the X icon
const X = dynamic(() => import("lucide-react").then((mod) => mod.X), {
  ssr: false,
  loading: () => <span className="block w-6 h-6" />,
});

export default function CreatePostModal({ isOpen, onClose, onPostCreated }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { isAuthenticated } = useAuth();
  const modalRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      // Save current form data to sessionStorage before redirecting
      sessionStorage.setItem(
        "pendingPost",
        JSON.stringify({
          title: title.trim(),
          content: editorRef.current?.innerHTML.trim(),
          tags: tags,
        })
      );
      window.location.href = "/login";
      return;
    }

    if (!title.trim() || !editorRef.current?.innerHTML.trim()) {
      setError("Title and content are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const newPost = await api.createPost({
        title: title.trim(),
        content: editorRef.current.innerHTML.trim(),
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
      });

      if (onPostCreated) {
        onPostCreated(newPost);
      }

      // Clear the saved pending post data
      sessionStorage.removeItem("pendingPost");

      // Reset form and close modal
      setTitle("");
      editorRef.current.innerHTML = "";
      setTags("");
      onClose();
    } catch (error) {
      console.error("Failed to create post:", error);
      if (
        error.message.includes("unauthorized") ||
        error.message.includes("not authenticated")
      ) {
        // If authentication error, save form data and redirect
        sessionStorage.setItem(
          "pendingPost",
          JSON.stringify({
            title: title.trim(),
            content: editorRef.current?.innerHTML.trim(),
            tags: tags,
          })
        );
        window.location.href = "/login";
      } else {
        setError("Failed to create post. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load saved post data when modal opens
  useEffect(() => {
    if (isOpen) {
      const savedPost = sessionStorage.getItem("pendingPost");
      if (savedPost) {
        try {
          const {
            title: savedTitle,
            content: savedContent,
            tags: savedTags,
          } = JSON.parse(savedPost);
          setTitle(savedTitle || "");
          if (editorRef.current && savedContent) {
            editorRef.current.innerHTML = savedContent;
          }
          setTags(savedTags || "");
        } catch (error) {
          console.error("Error loading saved post:", error);
        }
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
          Create New Post
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-gray-700 dark:text-gray-300 font-semibold mb-2"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-0 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-600 transition-colors"
              placeholder="Enter post title"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="content"
              className="block text-gray-700 dark:text-gray-300 font-semibold mb-2"
            >
              Content
            </label>
            <div className="mb-2 flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 p-2 rounded-t-lg">
              <button
                type="button"
                onClick={() => formatText("bold")}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                title="Bold"
              >
                <Bold size={18} />
              </button>
              <button
                type="button"
                onClick={() => formatText("italic")}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                title="Italic"
              >
                <Italic size={18} />
              </button>
              <button
                type="button"
                onClick={() => formatText("underline")}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                title="Underline"
              >
                <Underline size={18} />
              </button>
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-500 mx-2" />
              <button
                type="button"
                onClick={() => formatText("justifyLeft")}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                title="Align Left"
              >
                <AlignLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => formatText("justifyCenter")}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                title="Align Center"
              >
                <AlignCenter size={18} />
              </button>
              <button
                type="button"
                onClick={() => formatText("justifyRight")}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                title="Align Right"
              >
                <AlignRight size={18} />
              </button>
              <button
                type="button"
                onClick={() => formatText("justifyFull")}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                title="Justify"
              >
                <AlignJustify size={18} />
              </button>
            </div>
            <div
              ref={editorRef}
              contentEditable
              className="w-full min-h-[200px] px-3 py-2 rounded-b-lg dark:bg-gray-700 dark:text-white focus:ring-0 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-600 transition-colors overflow-y-auto"
              placeholder="Write your post content here"
              disabled={isSubmitting}
              style={{ whiteSpace: "pre-wrap" }}
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="tags"
              className="block text-gray-700 dark:text-gray-300 font-semibold text-sm mb-2"
            >
              Tags (comma-separated)
            </label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-0 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-600 transition-colors text-sm italic"
              placeholder="e.g. technology, programming"
              disabled={isSubmitting}
            />
          </div>
          <button
            type="submit"
            className={`w-full px-4 py-2 rounded transition-colors ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            } text-white`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Publishing..." : "Publish Post"}
          </button>
        </form>
      </div>
    </div>
  );
}
