"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../lib/AuthContext";
import { useTheme } from "../../lib/ThemeContext";
import { useRouter } from "next/navigation";
import { Header } from "../../components/core";
import { Camera, Sun, Moon, Save, X } from "lucide-react";
import Image from "next/image";
import { api, getFullAvatarUrl } from "../../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { ProfilePictureCropModal } from "../../components/ui";
import { debounce } from "lodash";

const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function Settings() {
  const { user, isAuthenticated, loading, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    bio: "",
    website: "",
    avatar: null,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Debounced validation
  const validateField = useCallback(
    debounce((name, value) => {
      const errors = { ...validationErrors };

      switch (name) {
        case "username":
          if (value.length < 3) {
            errors.username = "Username must be at least 3 characters";
          } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
            errors.username =
              "Username can only contain letters, numbers, and underscores";
          } else {
            delete errors.username;
          }
          break;
        case "email":
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            errors.email = "Please enter a valid email address";
          } else {
            delete errors.email;
          }
          break;
        case "website":
          if (value && !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(value)) {
            errors.website = "Please enter a valid URL";
          } else {
            delete errors.website;
          }
          break;
      }

      setValidationErrors(errors);
    }, 300),
    [validationErrors]
  );

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");

    if (!loading && !token && !storedUser && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        bio: user.bio || "",
        website: user.website || "",
        avatar: null,
      });
      setPreviewImage(user.avatar ? getFullAvatarUrl(user.avatar) : null);
    }
  }, [user, isAuthenticated, loading, router]);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true);
    validateField(name, value);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields before submission
    const errors = {};
    Object.entries(formData).forEach(([name, value]) => {
      if (name !== "avatar") {
        validateField.flush();
        validateField(name, value);
      }
    });

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess(false);
    setUploadError("");

    try {
      const formDataToSend = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value && key !== "avatar") {
          formDataToSend.append(key, value);
        }
      });

      if (formData.avatar) {
        if (!ALLOWED_FILE_TYPES.includes(formData.avatar.type)) {
          throw new Error(
            "Invalid file type. Please upload a JPEG, PNG, or GIF."
          );
        }
        if (formData.avatar.size > MAX_FILE_SIZE) {
          throw new Error("File size too large. Maximum size is 5MB.");
        }
        formDataToSend.append("avatar", formData.avatar);
      }

      const data = await api.updateUser(user.username, formDataToSend);

      const updatedUser = {
        ...user,
        ...data,
        avatar: data.avatar ? getFullAvatarUrl(data.avatar) : null,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      updateUser(updatedUser);

      setFormData((prev) => ({
        ...prev,
        avatar: null,
      }));
      setPreviewImage(updatedUser.avatar);
      setSuccess(true);
      setIsDirty(false);

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Settings update error:", err);
      if (err.message.includes("avatar")) {
        setUploadError(err.message || "Failed to upload profile picture");
      } else {
        setError(err.message || "Failed to update profile");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCroppedImage = async (croppedImageUrl) => {
    try {
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      const file = new File([blob], "profile-picture.jpg", {
        type: "image/jpeg",
      });

      setFormData((prev) => ({ ...prev, avatar: file }));
      setPreviewImage(croppedImageUrl);
      setIsDirty(true);
    } catch (err) {
      setUploadError("Failed to process cropped image");
    }
  };

  // Loading state
  if (loading || (!user && isAuthenticated)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse space-y-8 w-full max-w-md">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto"></div>
          <div className="space-y-6">
            <div className="h-32 w-32 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Settings
            </h1>
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              aria-label={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {theme === "dark" ? <Sun size={24} /> : <Moon size={24} />}
            </button>
          </motion.div>

          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-100 rounded-lg flex items-center justify-between"
              >
                <span>Profile updated successfully!</span>
                <button
                  onClick={() => setSuccess(false)}
                  className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 focus:outline-none"
                >
                  <X size={16} />
                </button>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg flex items-center justify-between"
              >
                <span>{error}</span>
                <button
                  onClick={() => setError("")}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 focus:outline-none"
                >
                  <X size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubmit}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg space-y-6"
          >
            <div className="space-y-4">
              <label className="block text-gray-700 dark:text-gray-200 font-bold mb-3">
                Profile Picture
              </label>
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden relative bg-gray-200 dark:bg-gray-700 ring-4 ring-gray-100 dark:ring-gray-700">
                    {previewImage ? (
                      <Image
                        src={previewImage}
                        alt="Profile"
                        fill
                        className="object-cover"
                        sizes="128px"
                        priority
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl font-medium text-gray-500 dark:text-gray-400">
                          {formData.username
                            ? formData.username[0].toUpperCase()
                            : user.username[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCropModalOpen(true)}
                    className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    aria-label="Change profile picture"
                  >
                    <Camera size={20} className="stroke-[1.5]" />
                  </button>
                </div>
                {uploadError && (
                  <p className="text-sm text-red-600 dark:text-red-400 text-center">
                    {uploadError}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-gray-700 dark:text-gray-200 font-bold mb-2"
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    validationErrors.username
                      ? "border-red-500 dark:border-red-400"
                      : "border-gray-300"
                  }`}
                  required
                  disabled={isLoading}
                />
                {validationErrors.username && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {validationErrors.username}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-gray-700 dark:text-gray-200 font-bold mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    validationErrors.email
                      ? "border-red-500 dark:border-red-400"
                      : "border-gray-300"
                  }`}
                  required
                  disabled={isLoading}
                />
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {validationErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="bio"
                  className="block text-gray-700 dark:text-gray-200 font-bold mb-2"
                >
                  Bio
                </label>
                <div className="relative">
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={(e) => {
                      const text = e.target.value;
                      if (text.length <= 120) {
                        handleChange(e);
                      }
                    }}
                    className="w-full h-24 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                    maxLength={120}
                    placeholder="Tell us about yourself..."
                    disabled={isLoading}
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400">
                    {formData.bio?.length || 0}/120
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="website"
                  className="block text-gray-700 dark:text-gray-200 font-bold mb-2"
                >
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    validationErrors.website
                      ? "border-red-500 dark:border-red-400"
                      : "border-gray-300"
                  }`}
                  disabled={isLoading}
                />
                {validationErrors.website && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {validationErrors.website}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={
                  isLoading ||
                  !isDirty ||
                  Object.keys(validationErrors).length > 0
                }
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </motion.form>
        </div>
      </main>

      <ProfilePictureCropModal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        onSave={handleCroppedImage}
      />
    </div>
  );
}
