"use client";

import { useEffect } from "react";
import { ThemeProvider } from "../lib/ThemeContext";
import { AuthProvider } from "../lib/AuthContext";
import { RealtimeProvider } from "../lib/RealtimeContext";
import { ChatProvider } from "../lib/ChatContext";
import { HealthCheck } from "../components/core";
import {
  initializeFirebase,
  initializePushNotifications,
  isPushNotificationSupported,
} from "../lib/firebase";
import { useAuth } from "../lib/AuthContext";

export default function ClientLayout({ children }) {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const setupFirebase = async () => {
      try {
        // Initialize Firebase first
        const app = await initializeFirebase();
        if (!app) {
          console.warn("Failed to initialize Firebase");
          return;
        }

        // Only proceed with push notifications if user is authenticated
        if (isAuthenticated && user?.id) {
          const isSupported = await isPushNotificationSupported();
          if (!isSupported) {
            console.warn(
              "Push notifications are not supported in this environment"
            );
            return;
          }

          const token = await initializePushNotifications(user.id);
          if (token) {
            console.debug("Push notifications initialized successfully");
          } else {
            console.warn("Failed to initialize push notifications");
          }
        }
      } catch (error) {
        console.error("Error setting up Firebase:", error);
      }
    };

    setupFirebase();
  }, [isAuthenticated, user?.id]);

  return (
    <ThemeProvider>
      <AuthProvider>
        <RealtimeProvider>
          <ChatProvider>
            {children}
            <HealthCheck />
          </ChatProvider>
        </RealtimeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
