// Get API URL with fallback for production
const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api`;
  }

  return "http://localhost:8000";
};

// Get base URL with fallback for production
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:8000";
};

const API_URL = getApiUrl();
const BASE_URL = getBaseUrl();

console.log("API Configuration:", {
  API_URL,
  BASE_URL,
});

// Helper function to check if a string is a valid URL
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// Utility function to get full avatar URL
export const getFullAvatarUrl = (avatarPath) => {
  if (!avatarPath) return null;

  // If it's already a valid URL, return as is
  if (isValidUrl(avatarPath)) {
    return avatarPath;
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) {
    console.error("NEXT_PUBLIC_BASE_URL environment variable is not set");
    return avatarPath;
  }

  // Remove any leading slash from the URL if BASE_URL ends with a slash
  const cleanUrl = avatarPath.startsWith("/")
    ? avatarPath.slice(1)
    : avatarPath;
  const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  return `${cleanBaseUrl}/${cleanUrl}`;
};

// Helper function to get token from cookies
const getTokenFromCookie = () => {
  const cookies = document.cookie.split(";");
  const tokenCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("accessToken=")
  );
  return tokenCookie ? tokenCookie.split("=")[1].trim() : null;
};

// Helper function to handle fetch calls
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  console.log(`Making API request to: ${url}`, { options });

  // List of endpoints that don't require authentication
  const publicEndpoints = ["/posts/", "/posts/[0-9]+/"];

  // Try to get token from localStorage first, then from cookies
  const token = localStorage.getItem("accessToken") || getTokenFromCookie();
  const isPublicEndpoint = publicEndpoints.some((pattern) =>
    new RegExp(`^${pattern}$`).test(endpoint)
  );

  const defaultHeaders = {
    "Content-Type": "application/json",
    ...(token && !isPublicEndpoint ? { Authorization: `Bearer ${token}` } : {}),
  };

  // Don't set Content-Type for FormData
  if (options.body instanceof FormData) {
    delete defaultHeaders["Content-Type"];
  }

  try {
    const response = await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    // For public endpoints, don't throw on 401/403
    if (
      !response.ok &&
      (!isPublicEndpoint || ![401, 403].includes(response.status))
    ) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API Error:", {
        url,
        status: response.status,
        statusText: response.statusText,
        errorData,
      });
      throw new Error(
        errorData.detail || errorData.message || "API request failed"
      );
    }

    const data = await response.json();
    console.log(`API Response from ${endpoint}:`, data);
    return data;
  } catch (error) {
    console.error(`API Error for ${endpoint}:`, error);
    throw error;
  }
}

// Refresh token function
async function refreshToken() {
  const refresh = localStorage.getItem("refreshToken");
  if (!refresh) return null;

  try {
    const response = await fetch(`${API_URL}/auth/token/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh }),
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("accessToken", data.access);
      return data.access;
    } else {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      return null;
    }
  } catch (error) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    return null;
  }
}

export const api = {
  API_URL,
  getFullAvatarUrl,
  // Auth endpoints
  signup: async (userData) => {
    try {
      console.log("Attempting signup with:", {
        ...userData,
        password: "[REDACTED]",
      });
      const response = await fetchAPI("/auth/signup/", {
        method: "POST",
        body: JSON.stringify(userData),
      });
      console.log("Signup response:", { ...response, token: "[REDACTED]" });

      if (response.token) {
        localStorage.setItem("accessToken", response.token);
        if (response.refresh) {
          localStorage.setItem("refreshToken", response.refresh);
        }
        // Store user data if available
        if (response.user) {
          localStorage.setItem("user", JSON.stringify(response.user));
        }
        // Set cookie for middleware
        document.cookie = `accessToken=${response.token}; path=/; max-age=2592000; SameSite=Strict`; // 30 days
      } else {
        console.error("No token in signup response");
        throw new Error("Invalid signup response - no token received");
      }
      return response;
    } catch (err) {
      console.error("Signup error:", err);
      throw new Error(err.message || "Failed to sign up. Please try again.");
    }
  },

  login: async (credentials) => {
    const response = await fetchAPI("/auth/login/", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    console.log("Login response:", response);
    if (response.token) {
      console.log("Setting tokens...");
      // Store in localStorage
      localStorage.setItem("accessToken", response.token);
      localStorage.setItem("refreshToken", response.refresh);
      // Store in cookies with secure settings
      document.cookie = `accessToken=${response.token}; path=/; max-age=2592000; SameSite=Strict`; // 30 days
      // Store user data if available
      if (response.user) {
        console.log("Storing user data:", response.user);
        localStorage.setItem("user", JSON.stringify(response.user));
      }
    } else {
      console.error("No token in response");
    }
    return response;
  },

  logout: async () => {
    await fetchAPI("/auth/logout/", {
      method: "POST",
    });
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  },

  // Posts endpoints
  getPosts: async () => {
    const data = await fetchAPI("/posts/");
    return Array.isArray(data)
      ? data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      : [];
  },

  getPersonalizedPosts: async () => {
    const data = await fetchAPI("/feed/");
    return Array.isArray(data)
      ? data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      : [];
  },

  getPost: (id) => fetchAPI(`/posts/${id}/`),

  createPost: (postData) =>
    fetchAPI("/posts/", {
      method: "POST",
      body: JSON.stringify(postData),
    }),

  updatePost: (id, postData) =>
    fetchAPI(`/posts/${id}/`, {
      method: "PUT",
      body: JSON.stringify(postData),
    }),

  deletePost: (id) =>
    fetchAPI(`/posts/${id}/`, {
      method: "DELETE",
    }),

  // Comments endpoints
  getComments: (postId) => fetchAPI(`/comments/?post=${postId}`),

  createComment: (postId, content) =>
    fetchAPI(`/comments/`, {
      method: "POST",
      body: JSON.stringify({ post: postId, content }),
    }),

  // Likes endpoints
  likePost: (postId) =>
    fetchAPI(`/posts/${postId}/like/`, {
      method: "POST",
    }),

  unlikePost: (postId) =>
    fetchAPI(`/posts/${postId}/like/`, {
      method: "DELETE",
    }),

  // Bookmarks endpoints
  bookmarkPost: (postId) =>
    fetchAPI(`/posts/${postId}/bookmark/`, {
      method: "POST",
    }),

  unbookmarkPost: (postId) =>
    fetchAPI(`/posts/${postId}/bookmark/`, {
      method: "DELETE",
    }),

  // User endpoints
  getUserProfile: (username) => fetchAPI(`/users/${username}/`),

  updateUserProfile: (username, formData) =>
    fetchAPI(`/users/${username}/settings/`, {
      method: "PUT",
      body: formData,
    }),

  getUserPosts: (username) => fetchAPI(`/users/${username}/posts/`),

  getUserActivity: (username) => fetchAPI(`/users/${username}/activity/`),

  // Follow endpoints
  followUser: (username) =>
    fetchAPI(`/users/${username}/follow/`, {
      method: "POST",
    }),

  unfollowUser: (username) =>
    fetchAPI(`/users/${username}/unfollow/`, {
      method: "DELETE",
    }),

  // Feed endpoint
  getFeed: () => fetchAPI("/feed/"),

  getCurrentUser: () => fetchAPI("/users/me/"),

  // Admin endpoints
  getAdminStats: () => fetchAPI("/admin/stats/"),

  getAdminAnalytics: (timeRange = "week") =>
    fetchAPI("/admin/analytics/", {
      params: new URLSearchParams({ range: timeRange }),
    }),

  getAdminActivity: () => fetchAPI("/admin/activity/"),

  getAdminUsers: (params = {}) =>
    fetchAPI("/admin/users/", {
      params: new URLSearchParams(params),
    }),

  getAdminPosts: (params = {}) =>
    fetchAPI("/admin/posts/", {
      params: new URLSearchParams(params),
    }),

  getAdminComments: (params = {}) =>
    fetchAPI("/admin/comments/", {
      params: new URLSearchParams(params),
    }),

  getAdminSettings: () => fetchAPI("/admin/settings/"),

  updateAdminSettings: (settings) =>
    fetchAPI("/admin/settings/", {
      method: "PUT",
      body: JSON.stringify(settings),
    }),

  // Staff check endpoint
  checkStaffStatus: () => fetchAPI("/users/me/"),

  // Admin API endpoints
  getAdminStats: () => fetchAPI("/admin/stats/"),

  getAdminAnalytics: (timeRange = "week") =>
    fetchAPI("/admin/analytics/", {
      params: new URLSearchParams({ range: timeRange }),
    }),

  getAdminActivity: () => fetchAPI("/admin/activity/"),

  getAdminUsers: (params = {}) =>
    fetchAPI("/admin/users/", {
      params: new URLSearchParams(params),
    }),

  getAdminPosts: (params = {}) =>
    fetchAPI("/admin/posts/", {
      params: new URLSearchParams(params),
    }),

  getAdminComments: (params = {}) =>
    fetchAPI("/admin/comments/", {
      params: new URLSearchParams(params),
    }),

  getAdminSettings: () => fetchAPI("/admin/settings/"),

  updateAdminSettings: (settings) =>
    fetchAPI("/admin/settings/", {
      method: "PUT",
      body: JSON.stringify(settings),
    }),

  // Password reset endpoints
  requestPasswordReset: async (email) => {
    return fetchAPI("/auth/password-reset/", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token, password, email) => {
    return fetchAPI("/auth/password-reset/confirm/", {
      method: "POST",
      body: JSON.stringify({ token, password, email }),
    });
  },
};

export default api;
