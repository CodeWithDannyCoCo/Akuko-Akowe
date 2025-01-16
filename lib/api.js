const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000';

// Utility function to get full avatar URL
export const getFullAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    // If it's already a full URL, return it
    if (avatarPath.startsWith('http')) return avatarPath;
    // If it's a relative path, make it absolute using the BASE_URL
    return `${BASE_URL}${avatarPath}`;
};

// Helper function to handle fetch calls
async function fetchAPI(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const token = localStorage.getItem('accessToken');

    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };

    // Don't set Content-Type for FormData
    if (options.body instanceof FormData) {
        delete defaultHeaders['Content-Type'];
    }

    try {
        const response = await fetch(url, {
            ...options,
            credentials: 'include',
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            console.error('API Error:', {
                status: response.status,
                statusText: response.statusText,
                error
            });
            throw new Error(error.detail || error.message || 'API request failed');
        }

        return response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

// Refresh token function
async function refreshToken() {
    const refresh = localStorage.getItem('refreshToken');
    if (!refresh) return null;

    try {
        const response = await fetch(`${API_URL}/auth/token/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh }),
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('accessToken', data.access);
            return data.access;
        } else {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            return null;
        }
    } catch (error) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return null;
    }
}

export const api = {
    API_URL,
    getFullAvatarUrl,
    // Auth endpoints
    signup: async (userData) => {
        try {
            console.log('Attempting signup with:', { ...userData, password: '[REDACTED]' });
            const response = await fetchAPI('/auth/signup/', {
                method: 'POST',
                body: JSON.stringify(userData),
            });
            console.log('Signup response:', { ...response, token: '[REDACTED]' });

            if (response.token) {
                localStorage.setItem('accessToken', response.token);
                if (response.refresh) {
                    localStorage.setItem('refreshToken', response.refresh);
                }
                // Store user data if available
                if (response.user) {
                    localStorage.setItem('user', JSON.stringify(response.user));
                }
                // Set cookie for middleware
                document.cookie = `accessToken=${response.token}; path=/; max-age=2592000; SameSite=Strict`; // 30 days
            } else {
                console.error('No token in signup response');
                throw new Error('Invalid signup response - no token received');
            }
            return response;
        } catch (err) {
            console.error('Signup error:', err);
            throw new Error(err.message || 'Failed to sign up. Please try again.');
        }
    },

    login: async (credentials) => {
        const response = await fetchAPI('/auth/login/', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
        console.log('Login response:', response);
        if (response.token) {
            console.log('Setting tokens...');
            // Store in localStorage
            localStorage.setItem('accessToken', response.token);
            localStorage.setItem('refreshToken', response.refresh);
            // Store in cookies with secure settings
            document.cookie = `accessToken=${response.token}; path=/; max-age=2592000; SameSite=Strict`; // 30 days
            // Store user data if available
            if (response.user) {
                console.log('Storing user data:', response.user);
                localStorage.setItem('user', JSON.stringify(response.user));
            }
        } else {
            console.error('No token in response');
        }
        return response;
    },

    logout: () => {
        console.log('Logging out...');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        // Remove from cookies
        document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict';
        window.location.href = '/login';
    },

    // Posts endpoints
    getPosts: async () => {
        try {
            console.log('Fetching posts from:', `${API_URL}/posts/`);
            const data = await fetchAPI('/posts/');
            console.log('Posts data:', data);
            return data;
        } catch (error) {
            console.error('Error in getPosts:', error);
            throw error;
        }
    },

    getPersonalizedPosts: () =>
        fetchAPI('/feed/'),

    getPost: (id) =>
        fetchAPI(`/posts/${id}/`),

    createPost: (postData) =>
        fetchAPI('/posts/', {
            method: 'POST',
            body: JSON.stringify(postData),
        }),

    updatePost: (id, postData) =>
        fetchAPI(`/posts/${id}/`, {
            method: 'PUT',
            body: JSON.stringify(postData),
        }),

    deletePost: (id) =>
        fetchAPI(`/posts/${id}/`, {
            method: 'DELETE',
        }),

    // Comments endpoints
    getComments: (postId) =>
        fetchAPI(`/comments/?post=${postId}`),

    createComment: (postId, content) =>
        fetchAPI(`/comments/`, {
            method: 'POST',
            body: JSON.stringify({ post: postId, content }),
        }),

    // Likes endpoints
    likePost: (postId) =>
        fetchAPI(`/posts/${postId}/like/`, {
            method: 'POST',
        }),

    unlikePost: (postId) =>
        fetchAPI(`/posts/${postId}/like/`, {
            method: 'DELETE',
        }),

    // Bookmarks endpoints
    bookmarkPost: (postId) =>
        fetchAPI(`/posts/${postId}/bookmark/`, {
            method: 'POST',
        }),

    unbookmarkPost: (postId) =>
        fetchAPI(`/posts/${postId}/bookmark/`, {
            method: 'DELETE',
        }),

    // User endpoints
    getUserProfile: (username) =>
        fetchAPI(`/users/${username}/`),

    updateUserProfile: (username, formData) =>
        fetchAPI(`/users/${username}/`, {
            method: 'PUT',
            body: formData
        }),

    getUserPosts: (username) =>
        fetchAPI(`/users/${username}/posts/`),

    getUserActivity: (username) =>
        fetchAPI(`/users/${username}/activity/`),

    // Follow endpoints
    followUser: (username) =>
        fetchAPI(`/users/${username}/follow/`, {
            method: 'POST',
        }),

    unfollowUser: (username) =>
        fetchAPI(`/users/${username}/follow/`, {
            method: 'DELETE',
        }),

    // Feed endpoint
    getFeed: () =>
        fetchAPI('/feed/'),

    getCurrentUser: () => fetchAPI('/users/me/'),

    // Admin endpoints
    getAdminStats: () => fetchAPI('/admin/stats/'),

    getAdminAnalytics: (timeRange = 'week') =>
        fetchAPI('/admin/analytics/', {
            params: new URLSearchParams({ range: timeRange })
        }),

    getAdminActivity: () => fetchAPI('/admin/activity/'),

    getAdminUsers: (params = {}) =>
        fetchAPI('/admin/users/', {
            params: new URLSearchParams(params)
        }),

    getAdminPosts: (params = {}) =>
        fetchAPI('/admin/posts/', {
            params: new URLSearchParams(params)
        }),

    getAdminComments: (params = {}) =>
        fetchAPI('/admin/comments/', {
            params: new URLSearchParams(params)
        }),

    getAdminSettings: () => fetchAPI('/admin/settings/'),

    updateAdminSettings: (settings) =>
        fetchAPI('/admin/settings/', {
            method: 'PUT',
            body: JSON.stringify(settings)
        }),

    // Staff check endpoint
    checkStaffStatus: () => fetchAPI('/users/me/'),

    // Admin API endpoints
    getAdminStats: () => fetchAPI('/admin/stats/'),

    getAdminAnalytics: (timeRange = 'week') =>
        fetchAPI('/admin/analytics/', {
            params: new URLSearchParams({ range: timeRange })
        }),

    getAdminActivity: () => fetchAPI('/admin/activity/'),

    getAdminUsers: (params = {}) =>
        fetchAPI('/admin/users/', {
            params: new URLSearchParams(params)
        }),

    getAdminPosts: (params = {}) =>
        fetchAPI('/admin/posts/', {
            params: new URLSearchParams(params)
        }),

    getAdminComments: (params = {}) =>
        fetchAPI('/admin/comments/', {
            params: new URLSearchParams(params)
        }),

    getAdminSettings: () => fetchAPI('/admin/settings/'),

    updateAdminSettings: (settings) =>
        fetchAPI('/admin/settings/', {
            method: 'PUT',
            body: JSON.stringify(settings)
        }),
};

export default api;