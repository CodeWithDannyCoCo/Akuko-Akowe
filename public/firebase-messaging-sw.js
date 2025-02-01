importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);

const firebaseConfig = {
  apiKey: self.FIREBASE_API_KEY,
  authDomain: self.FIREBASE_AUTH_DOMAIN,
  projectId: self.FIREBASE_PROJECT_ID,
  storageBucket: self.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: self.FIREBASE_MESSAGING_SENDER_ID,
  appId: self.FIREBASE_APP_ID,
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("Received background message:", payload);

  const { title, body, icon } = payload.notification || {};
  const notificationOptions = {
    body,
    icon: icon || "/favicon.ico",
    badge: "/favicon.ico",
    timestamp: Date.now(),
    vibrate: [200, 100, 200],
    requireInteraction: false,
    data: payload.data,
    actions: [
      {
        action: "view",
        title: "View",
      },
      {
        action: "close",
        title: "Close",
      },
    ],
  };

  return self.registration.showNotification(
    title || "New Notification",
    notificationOptions
  );
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event);

  event.notification.close();

  if (event.action === "view" && event.notification.data) {
    const urlToOpen = new URL(
      event.notification.data.url || "/",
      self.location.origin
    ).href;

    event.waitUntil(
      clients
        .matchAll({
          type: "window",
          includeUncontrolled: true,
        })
        .then((windowClients) => {
          // Check if there is already a window/tab open with the target URL
          for (let i = 0; i < windowClients.length; i++) {
            const client = windowClients[i];
            if (client.url === urlToOpen && "focus" in client) {
              return client.focus();
            }
          }
          // If no window/tab is open, open a new one
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

// Handle service worker installation
self.addEventListener("install", (event) => {
  console.log("Service Worker installed");
  self.skipWaiting();
});

// Handle service worker activation
self.addEventListener("activate", (event) => {
  console.log("Service Worker activated");
  event.waitUntil(clients.claim());
});
