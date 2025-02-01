import { useState, useEffect } from "react";
import { api } from "../api";

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const profileCache = new Map();

export function useProfile(username) {
    const [profileData, setProfileData] = useState(null);
    const [posts, setPosts] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!username) {
                setError("No user specified");
                setLoading(false);
                return;
            }

            // Check cache first
            const cachedData = profileCache.get(username);
            if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
                setProfileData(cachedData.profile);
                setPosts(cachedData.posts);
                setActivities(cachedData.activities);
                setLoading(false);
                return;
            }

            try {
                const [userData, userPosts, userActivities] = await Promise.all([
                    api.getUser(username),
                    api.getUserPosts(username),
                    api.getUserActivity(username),
                ]);

                const sortedPosts = userPosts.sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                );

                // Update cache
                profileCache.set(username, {
                    profile: userData,
                    posts: sortedPosts,
                    activities: userActivities,
                    timestamp: Date.now(),
                });

                setProfileData(userData);
                setPosts(sortedPosts);
                setActivities(userActivities);
                setError(null);
            } catch (err) {
                console.error("Error fetching profile data:", err);
                setError(err.message || "Failed to load profile");
            } finally {
                setLoading(false);
            }
        };

        setLoading(true);
        fetchProfileData();
    }, [username]);

    const updateProfile = (newData) => {
        setProfileData((prev) => {
            const updated = { ...prev, ...newData };
            // Update cache
            const cachedData = profileCache.get(username);
            if (cachedData) {
                profileCache.set(username, {
                    ...cachedData,
                    profile: updated,
                    timestamp: Date.now(),
                });
            }
            return updated;
        });
    };

    const updatePosts = (updatedPost) => {
        setPosts((prevPosts) => {
            const updated = prevPosts.map((p) =>
                p.id === updatedPost.id ? updatedPost : p
            );
            // Update cache
            const cachedData = profileCache.get(username);
            if (cachedData) {
                profileCache.set(username, {
                    ...cachedData,
                    posts: updated,
                    timestamp: Date.now(),
                });
            }
            return updated;
        });
    };

    const deletePost = (postId) => {
        setPosts((prevPosts) => {
            const updated = prevPosts.filter((p) => p.id !== postId);
            // Update cache
            const cachedData = profileCache.get(username);
            if (cachedData) {
                profileCache.set(username, {
                    ...cachedData,
                    posts: updated,
                    timestamp: Date.now(),
                });
            }
            return updated;
        });
    };

    return {
        profileData,
        posts,
        activities,
        loading,
        error,
        updateProfile,
        updatePosts,
        deletePost,
    };
}
