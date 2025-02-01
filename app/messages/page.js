"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../lib/AuthContext";
import { getFollowers } from "../../lib/api";
import Link from "next/link";
import { ErrorBoundary } from "../../components/shared";
import { FollowersList } from "../../components/messages";
import { LoadingSkeleton } from "../../components/skeletons";
import { PageHeader } from "../../components/shared";

const RETRY_COUNT = 3;
const RETRY_DELAY = 1000;

export default function MessagesPage() {
  const { user, isAuthenticated } = useAuth();
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchFollowers = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);
      const response = await getFollowers(user.username);
      setFollowers(response);
    } catch (error) {
      console.error("Error fetching followers:", error);
      setError(error.message || "Failed to load followers");

      // Implement retry logic
      if (retryCount < RETRY_COUNT) {
        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
        }, RETRY_DELAY * (retryCount + 1));
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, retryCount]);

  useEffect(() => {
    fetchFollowers();
  }, [fetchFollowers]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <PageHeader className="mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Please{" "}
            <Link href="/login" className="text-blue-500 hover:underline">
              login
            </Link>{" "}
            to view your messages
          </p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8">
        <PageHeader className="mb-6" />

        {error ? (
          <div className="text-center py-8">
            <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={() => {
                setRetryCount(0);
                fetchFollowers();
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : loading ? (
          <LoadingSkeleton count={3} />
        ) : (
          <FollowersList followers={followers} />
        )}
      </div>
    </ErrorBoundary>
  );
}
