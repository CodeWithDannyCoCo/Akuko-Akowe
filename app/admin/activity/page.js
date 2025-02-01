"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../lib/api";
import { LoadingSpinner } from "../../../components/ui";
import {
  ArrowLeft,
  Users,
  FileText,
  MessageSquare,
  Search,
  Filter,
  Sun,
  Moon,
} from "lucide-react";
import { Logo } from "../../../components/core";

export default function ActivityPage() {
  const router = useRouter();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, users, posts, comments
  const [searchTerm, setSearchTerm] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check initial dark mode preference
    if (typeof window !== "undefined") {
      setDarkMode(document.documentElement.classList.contains("dark"));
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminActivity();
      setActivities(data);
    } catch (err) {
      setError(err.message || "Failed to load activities");
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities
    .filter((activity) => {
      if (filter === "all") return true;
      if (filter === "users") return activity.icon === "Users";
      if (filter === "posts") return activity.icon === "FileText";
      if (filter === "comments") return activity.icon === "MessageSquare";
      return true;
    })
    .filter((activity) =>
      activity.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500 font-medium">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-8">
          <div className="flex items-center">
            <Logo variant="name" className="hidden sm:flex" />
            <Logo variant="icon" className="sm:hidden flex" />
          </div>
          <div className="border-l pl-8 border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Activity Log
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 font-medium">
              Track all activities across your platform
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() => router.push("/admin")}
            className="flex items-center text-blue-500 hover:text-blue-600 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-blue-500 dark:hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
          >
            <option value="all" className="font-medium">
              All Activities
            </option>
            <option value="users" className="font-medium">
              Users Only
            </option>
            <option value="posts" className="font-medium">
              Posts Only
            </option>
            <option value="comments" className="font-medium">
              Comments Only
            </option>
          </select>
        </div>
      </div>

      {/* Activity List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        {filteredActivities.length === 0 ? (
          <div className="p-6 text-gray-500 dark:text-gray-400 text-center font-medium">
            <p>No activities found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredActivities.map((activity) => {
              const Icon =
                activity.icon === "Users"
                  ? Users
                  : activity.icon === "FileText"
                  ? FileText
                  : MessageSquare;

              const timestamp = new Date(activity.timestamp);
              const timeString = timestamp.toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              });

              return (
                <div
                  key={activity.id}
                  className="flex items-start space-x-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div
                    className={`p-2 rounded-full flex-shrink-0 ${
                      activity.type === "success"
                        ? "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400"
                        : "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {timeString}
                    </p>
                  </div>
                  <button
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => {
                      if (activity.icon === "Users") {
                        router.push("/admin/users");
                      } else if (activity.icon === "FileText") {
                        router.push("/admin/posts");
                      } else {
                        router.push("/admin/comments");
                      }
                    }}
                  >
                    <ArrowLeft className="w-4 h-4 transform rotate-[-135deg]" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
