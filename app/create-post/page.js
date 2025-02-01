"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "../../components/core";
import { api } from "../../lib/api";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.createPost({
        title,
        content,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
      });
      router.push("/home");
    } catch (err) {
      setError(err.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <main className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-8">Create New Post</h1>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-2xl mx-auto"
        >
          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-gray-700 dark:text-gray-200 font-bold mb-2"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-0 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-600 transition-colors"
              required
              disabled={loading}
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="content"
              className="block text-gray-700 dark:text-gray-200 font-bold mb-2"
            >
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-0 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-600 transition-colors h-48 resize-none"
              required
              disabled={loading}
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="tags"
              className="block text-gray-700 dark:text-gray-200 font-bold mb-2"
            >
              Tags (comma-separated)
            </label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-0 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-600 transition-colors"
              placeholder="e.g. technology, programming, web development"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className={`w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 
              ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Post"}
          </button>
        </form>
      </main>
    </div>
  );
}
