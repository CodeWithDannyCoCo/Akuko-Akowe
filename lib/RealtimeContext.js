"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { onForegroundMessage } from "./firebase";
import { initializeMessaging } from "./firebase";

// Define all real-time events
export const REALTIME_EVENTS = {
  // Post events (WebSocket)
  POSTS: {
    NEW: "post:new",
    UPDATE: "post:update",
    DELETE: "post:delete",
    LIKE: "post:like",
    UNLIKE: "post:unlike",
    BOOKMARK: "post:bookmark",
    UNBOOKMARK: "post:unbookmark",
  },

  // Comment events (WebSocket)
  COMMENTS: {
    NEW: "comment:new",
    UPDATE: "comment:update",
    DELETE: "comment:delete",
    LIKE: "comment:like",
    UNLIKE: "comment:unlike",
    TYPING_START: "comment:typing_start",
    TYPING_STOP: "comment:typing_stop",
  },

  // User interaction events (WebSocket)
  USERS: {
    FOLLOW: "user:follow",
    UNFOLLOW: "user:unfollow",
    ONLINE: "user:online",
    OFFLINE: "user:offline",
    TYPING: "user:typing",
    PROFILE_UPDATE: "user:profile_update",
    AVATAR_UPDATE: "user:avatar_update",
  },

  // Chat/Message events (WebSocket)
  MESSAGES: {
    NEW: "message:new",
    READ: "message:read",
    DELETE: "message:delete",
    TYPING_START: "message:typing_start",
    TYPING_STOP: "message:typing_stop",
  },

  // Notification events (Firebase + WebSocket)
  NOTIFICATIONS: {
    NEW: "notification:new", // WebSocket for real-time UI updates
    READ: "notification:read", // WebSocket for real-time UI updates
    PUSH: "notification:push", // Firebase for push notifications
    CLEAR_ALL: "notification:clear_all",
  },
};

const RealtimeContext = createContext();

export function RealtimeProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [eventListeners, setEventListeners] = useState(new Map());
  const [isConnecting, setIsConnecting] = useState(false);

  // Initialize socket and Firebase messaging
  useEffect(() => {
    let newSocket = null;
    let unsubscribeFirebase = () => {};

    const initializeSocket = async () => {
      if (!isAuthenticated || !user || isConnecting) return;

      try {
        setIsConnecting(true);

        // Initialize Firebase messaging first
        const messaging = await initializeMessaging();
        if (messaging) {
          unsubscribeFirebase = onForegroundMessage((payload) => {
            if (payload.data?.type === REALTIME_EVENTS.NOTIFICATIONS.PUSH) {
              console.debug(
                "Received Firebase foreground notification:",
                payload
              );
            }
          });
        }

        // Then initialize WebSocket
        newSocket = io(process.env.NEXT_PUBLIC_WS_URL, {
          transports: ["websocket"],
          path: "/socket.io/",
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 20000,
          autoConnect: true,
        });

        // Add detailed error logging
        newSocket.on("connect_error", (error) => {
          console.error("WebSocket Connection Error:", {
            message: error.message,
            type: error.type,
            description: error.description,
            data: error.data,
            context: error.context,
          });
        });

        // Connection events
        newSocket.on("connect", () => {
          console.debug("WebSocket connected");
          newSocket.emit(REALTIME_EVENTS.USERS.ONLINE, { userId: user.id });
        });

        newSocket.on("disconnect", () => {
          console.debug("WebSocket disconnected");
        });

        // Update online users
        newSocket.on(REALTIME_EVENTS.USERS.ONLINE, ({ userId }) => {
          setOnlineUsers((prev) => new Set([...prev, userId]));
        });

        newSocket.on(REALTIME_EVENTS.USERS.OFFLINE, ({ userId }) => {
          setOnlineUsers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
          });
        });

        setSocket(newSocket);
      } catch (error) {
        console.error("Error initializing realtime services:", error);
      } finally {
        setIsConnecting(false);
      }
    };

    initializeSocket();

    // Cleanup on unmount
    return () => {
      if (newSocket) {
        newSocket.emit(REALTIME_EVENTS.USERS.OFFLINE, { userId: user?.id });
        newSocket.disconnect();
      }
      unsubscribeFirebase();
    };
  }, [isAuthenticated, user]);

  // Subscribe to a WebSocket event
  const subscribe = useCallback(
    (event, callback) => {
      if (!socket) return () => {};

      socket.on(event, callback);
      setEventListeners((prev) => new Map(prev.set(event, callback)));

      return () => {
        socket.off(event, callback);
        setEventListeners((prev) => {
          const newMap = new Map(prev);
          newMap.delete(event);
          return newMap;
        });
      };
    },
    [socket]
  );

  // Emit a WebSocket event
  const emit = useCallback(
    (event, data) => {
      if (!socket) {
        console.warn("WebSocket not connected, cannot emit event:", event);
        return;
      }
      socket.emit(event, data);
    },
    [socket]
  );

  // Context value
  const value = {
    socket,
    onlineUsers,
    subscribe,
    emit,
    isConnected: !!socket?.connected,
    EVENTS: REALTIME_EVENTS,
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

// Custom hook for using real-time features
export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error("useRealtime must be used within a RealtimeProvider");
  }
  return context;
}
