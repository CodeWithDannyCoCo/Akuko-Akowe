"use client";

import { useState, useEffect, useCallback, useTransition, useRef } from "react";
import { Header } from "../../components/core";
import { useAuth } from "../../lib/AuthContext";
import { api } from "../../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Heart, MessageSquare, UserPlus, Clock } from "lucide-react";
import Link from "next/link";

const ITEMS_PER_PAGE = 20;
const NOTIFICATION_TYPES = {
    LIKE: "like",
    COMMENT: "comment",
    FOLLOW: "follow",
};

// Notification item component with animation
const NotificationItem = ({ notification, onRead }) => {
    let icon, label, link;

    switch (notification.type) {
        case NOTIFICATION_TYPES.LIKE:
            icon = <Heart className="w-5 h-5 text-red-500" />;
            label = `${notification.sender} liked your post`;
            link = `/post/${notification.post_id}`;
            break;
        case NOTIFICATION_TYPES.COMMENT:
            icon = <MessageSquare className="w-5 h-5 text-blue-500" />;
            label = `${notification.sender} commented on your post`;
            link = `/post/${notification.post_id}`;
            break;
        case NOTIFICATION_TYPES.FOLLOW:
            icon = <UserPlus className="w-5 h-5 text-green-500" />;
            label = `${notification.sender} started following you`;
            link = `/profile/${notification.sender}`;
            break;
        default:
            return null;
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-lg transition-colors ${notification.read
                    ? "bg-white dark:bg-gray-800"
                    : "bg-blue-50 dark:bg-blue-900/20"
                }`}
        >
            <Link
                href={link}
                className="flex items-start space-x-4 group"
                onClick={() => !notification.read && onRead(notification.id)}
            >
                <div className="flex-shrink-0 mt-1">{icon}</div>
                <div className="flex-1 min-w-0">
                    <p
                        className={`text-sm ${notification.read
                                ? "text-gray-600 dark:text-gray-400"
                                : "text-gray-900 dark:text-white font-medium"
                            }`}
                    >
                        {label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(notification.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                        })}
                    </p>
                </div>
            </Link>
        </motion.div>
    );
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [isPending, startTransition] = useTransition();
    const observerRef = useRef();
    const loadingRef = useRef();

    const { isAuthenticated, user } = useAuth();

    // Fetch notifications with pagination
    const fetchNotifications = useCallback(async (pageNum) => {
        try {
            const response = await api.getNotifications(pageNum, ITEMS_PER_PAGE);
            const newNotifications = response.results || [];

            startTransition(() => {
                setNotifications((prev) =>
                    pageNum === 1 ? newNotifications : [...prev, ...newNotifications]
                );
                setHasMore(newNotifications.length === ITEMS_PER_PAGE);
            });

            setError(null);
        } catch (err) {
            console.error("Error fetching notifications:", err);
            setError("Failed to load notifications");
        } finally {
            setLoading(false);
        }
    }, []);

    // Mark notification as read
    const handleNotificationRead = useCallback(async (notificationId) => {
        try {
            await api.markNotificationAsRead(notificationId);
            startTransition(() => {
                setNotifications((prev) =>
                    prev.map((notification) =>
                        notification.id === notificationId
                            ? { ...notification, read: true }
                            : notification
                    )
                );
            });
        } catch (err) {
            console.error("Error marking notification as read:", err);
        }
    }, []);

    // Intersection Observer for infinite scroll
    const lastNotificationRef = useCallback(
        (node) => {
            if (loading) return;

            if (observerRef.current) {
                observerRef.current.disconnect();
            }

            observerRef.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    setPage((prev) => prev + 1);
                }
            });

            if (node) {
                observerRef.current.observe(node);
            }
        },
        [loading, hasMore]
    );

    // Initial load
    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications(page);
        }
    }, [fetchNotifications, isAuthenticated, page]);

    // Cleanup observer
    useEffect(() => {
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []);

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Header />
                <main className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <p className="text-gray-600 dark:text-gray-400">
                            Please{" "}
                            <Link href="/login" className="text-blue-500 hover:underline">
                                login
                            </Link>{" "}
                            to view notifications
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header />
            <main className="max-w-2xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Notifications
                    </h1>
                    {notifications.length > 0 && (
                        <button
                            onClick={() => api.markAllNotificationsAsRead()}
                            className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>

                <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                        {loading && page === 1 ? (
                            // Loading skeleton
                            [...Array(3)].map((_, i) => (
                                <motion.div
                                    key={`skeleton-${i}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="p-4 bg-white dark:bg-gray-800 rounded-lg animate-pulse"
                                >
                                    <div className="flex items-start space-x-4">
                                        <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : notifications.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-12"
                            >
                                <Clock className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
                                <p className="text-gray-500 dark:text-gray-400">
                                    No notifications yet
                                </p>
                            </motion.div>
                        ) : (
                            notifications.map((notification, index) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onRead={handleNotificationRead}
                                    ref={
                                        index === notifications.length - 1
                                            ? lastNotificationRef
                                            : null
                                    }
                                />
                            ))
                        )}
                    </AnimatePresence>

                    {/* Loading indicator for pagination */}
                    {loading && page > 1 && (
                        <div ref={loadingRef} className="flex justify-center py-4">
                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}

                    {/* Error message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 rounded-lg text-center"
                        >
                            {error}
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    );
}
