console.log('API Configuration:', {
    API_URL: process.env.NEXT_PUBLIC_API_URL,
    BASE_URL: process.env.NEXT_PUBLIC_BASE_URL
});

const API_URL = process.env.NEXT_PUBLIC_API_URL || (
    process.env.NODE_ENV === 'production'
        ? 'https://chronicle-server-f2n9.onrender.com/api'
        : 'http://localhost:8000/api'
);

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || (
    process.env.NODE_ENV === 'production'
        ? 'https://chronicle-server-f2n9.onrender.com'
        : 'http://localhost:8000'
);

// Utility function to get full avatar URL
export const getFullAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;

    const NGROK_URL = 'https://1dfe-102-88-53-239.ngrok-free.app';

    // Always convert to HTTPS ngrok URL
    if (avatarPath.includes('localhost:8000')) {
        return avatarPath.replace('http://localhost:8000', NGROK_URL);
    }

    // Handle relative paths
    if (avatarPath.startsWith('/')) {
        return `${NGROK_URL}${avatarPath}`;
    }

    // If it's already an HTTPS URL, return as is
    if (avatarPath.startsWith('https://')) {
        return avatarPath;
    }

    // Convert HTTP to HTTPS if it's the ngrok URL
    if (avatarPath.includes('ngrok-free.app')) {
        return avatarPath.replace('http://', 'https://');
    }

    // Default case: append to ngrok URL
    return `${NGROK_URL}${avatarPath.startsWith('/') ? '' : '/'}${avatarPath}`;
};

// Helper function to handle fetch calls
async function fetchAPI(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    console.log(`Making API request to: ${url}`, { options });

    const token = localStorage.getItem('accessToken');

    const defaultHeaders = {
        'Accept': 'application/json',
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

        // Parse response data
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            try {
                data = await response.json();
            } catch (e) {
                console.error('Failed to parse JSON response:', e);
                data = {};
            }
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            // Log detailed error information
            console.error('API Error:', {
                url,
                status: response.status,
                statusText: response.statusText,
                data,
            });

            // Handle specific error cases
            switch (response.status) {
                case 400:
                    throw new Error(data.detail || data.message || 'Invalid request. Please check your input.');
                case 401:
                    if (data.code === 'token_not_valid') {
                        const newToken = await refreshToken();
                        if (newToken) {
                            // Retry the request with the new token
                            const retryResponse = await fetch(url, {
                                ...options,
                                credentials: 'include',
                                headers: {
                                    ...defaultHeaders,
                                    'Authorization': `Bearer ${newToken}`,
                                    ...options.headers,
                                },
                            });
                            if (retryResponse.ok) {
                                return await retryResponse.json();
                            }
                        }
                        throw new Error('Session expired. Please log in again.');
                    }
                    throw new Error('Authentication required. Please log in.');
                case 403:
                    throw new Error('You do not have permission to perform this action.');
                case 404:
                    throw new Error('The requested resource was not found.');
                case 429:
                    throw new Error('Too many requests. Please try again later.');
                case 500:
                    throw new Error('Server error. Please try again later.');
                default:
                    throw new Error(data.detail || data.message || 'An unexpected error occurred.');
            }
        }

        return data;
    } catch (error) {
        // Log the error with context
        console.error(`API Error for ${endpoint}:`, {
            error,
            url,
            options,
        });

        // Rethrow with a user-friendly message
        throw new Error(error.message || 'Failed to complete the request. Please try again.');
    }
}

// Refresh token function with better error handling
async function refreshToken() {
    const refresh = localStorage.getItem('refreshToken');
    if (!refresh) {
        console.log('No refresh token available');
        return null;
    }

    try {
        const response = await fetch(`${API_URL}/auth/token/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh }),
        });

        if (!response.ok) {
            throw new Error('Failed to refresh token');
        }

        const data = await response.json();
        if (data.access) {
            localStorage.setItem('accessToken', data.access);
            return data.access;
        } else {
            throw new Error('Invalid token refresh response');
        }
    } catch (error) {
        console.error('Token refresh failed:', error);
        // Clear auth data on refresh failure
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

    logout: async () => {
        await fetchAPI('/auth/logout/', {
            method: 'POST',
        });
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    },

    // Posts endpoints
    getPosts: () => fetchAPI('/posts/'),

    getPersonalizedPosts: () => fetchAPI('/feed/'),

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
    getUserProfile: (username) => fetchAPI(`/users/${username}/`),

    updateUserProfile: (username, formData) =>
        fetchAPI(`/users/${username}/settings/`, {
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
        fetchAPI(`/users/${username}/unfollow/`, {
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