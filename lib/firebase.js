import { initializeApp } from "@firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
} from "@firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let messagingInstance = null;
let app = null;

// Initialize Firebase app
export async function initializeFirebase() {
  try {
    if (!app) {
      app = initializeApp(firebaseConfig);
      console.debug("Firebase initialized successfully");
    }
    return app;
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    return null;
  }
}

// Initialize Firebase Cloud Messaging
export async function initializeMessaging() {
  try {
    if (!messagingInstance) {
      const isFCMSupported = await isSupported();
      if (!isFCMSupported) {
        console.warn(
          "Firebase Cloud Messaging is not supported in this browser"
        );
        return null;
      }

      const app = await initializeFirebase();
      if (!app) return null;

      messagingInstance = getMessaging(app);
      console.debug("Firebase Cloud Messaging initialized successfully");
    }
    return messagingInstance;
  } catch (error) {
    console.error("Error initializing Firebase Cloud Messaging:", error);
    return null;
  }
}

// Request notification permission and get FCM token
export async function requestNotificationPermission() {
  try {
    const messaging = await initializeMessaging();
    if (!messaging) return null;

    // Check if permission is already granted
    if (Notification.permission === "granted") {
      console.debug("Notification permission already granted");
    } else {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.warn("Notification permission denied");
        return null;
      }
      console.debug("Notification permission granted");
    }

    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });

    if (token) {
      console.debug("FCM token obtained successfully");
      return token;
    } else {
      console.warn("No FCM token available");
      return null;
    }
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return null;
  }
}

// Handle foreground messages with custom notification display
export function onForegroundMessage(callback) {
  if (!messagingInstance) {
    console.warn("Firebase Cloud Messaging not initialized");
    return () => {};
  }

  return onMessage(messagingInstance, (payload) => {
    console.debug("Received foreground message:", payload);

    // Create and show notification
    if (Notification.permission === "granted") {
      const { title, body, icon } = payload.notification || {};
      const notificationOptions = {
        body,
        icon: icon || "/favicon.ico",
        badge: "/favicon.ico",
        timestamp: Date.now(),
        vibrate: [200, 100, 200],
        requireInteraction: false,
        data: payload.data,
      };

      try {
        new Notification(title || "New Notification", notificationOptions);
      } catch (error) {
        console.error("Error showing notification:", error);
      }
    }

    // Call the provided callback
    callback(payload);
  });
}

// Initialize push notifications and register with backend
export async function initializePushNotifications(userId) {
  try {
    // Request permission and get token
    const token = await requestNotificationPermission();
    if (!token) return null;

    // Register token with backend
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/fcm-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ token }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.debug("FCM token registered with backend successfully");
      return token;
    } catch (error) {
      console.error("Error registering FCM token with backend:", error);
      return null;
    }
  } catch (error) {
    console.error("Error initializing push notifications:", error);
    return null;
  }
}

// Check if push notifications are supported
export async function isPushNotificationSupported() {
  try {
    // Check if the browser supports service workers
    if (!("serviceWorker" in navigator)) {
      console.warn("Service Workers are not supported");
      return false;
    }

    // Check if the browser supports push notifications
    if (!("Notification" in window)) {
      console.warn("Push Notifications are not supported");
      return false;
    }

    // Check if Firebase Cloud Messaging is supported
    const isFCMSupported = await isSupported();
    if (!isFCMSupported) {
      console.warn("Firebase Cloud Messaging is not supported");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error checking push notification support:", error);
    return false;
  }
}
