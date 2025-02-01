"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "../../components/core";
import { api } from "../../lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.requestPasswordReset(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to send reset email. Please try again.");
      console.error("Password reset request error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-4">
                Check Your Email
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                We've sent password reset instructions to {email}. Please check
                your inbox.
              </p>
              <div className="text-center">
                <Link
                  href="/login"
                  className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300"
                >
                  Return to Login
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white text-center">
            Reset Password
          </h1>
          <p className="text-center mb-8 text-gray-600 dark:text-gray-400">
            Enter your email address and we'll send you instructions to reset
            your password.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg"
          >
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                    focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent
                    disabled:opacity-60 disabled:cursor-not-allowed
                    transition-colors duration-200"
                  required
                  disabled={loading}
                  placeholder="Enter your email"
                />
              </div>

              <button
                type="submit"
                className={`w-full bg-blue-500 dark:bg-blue-600 text-white px-4 py-2.5 rounded-lg
                  font-medium hover:bg-blue-600 dark:hover:bg-blue-700
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
                  disabled:opacity-60 disabled:cursor-not-allowed
                  transition-colors duration-200
                  ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Instructions"}
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Remember your password?{" "}
                <Link
                  href="/login"
                  className="font-medium text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors duration-200"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
