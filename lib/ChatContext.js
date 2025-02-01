"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    let chatSocket = null;

    const initializeChatSocket = async () => {
      if (!isAuthenticated || !user || isConnecting) return;

      try {
        setIsConnecting(true);

        chatSocket = io(process.env.NEXT_PUBLIC_WS_URL, {
          transports: ["websocket"],
          path: "/socket.io/",
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 20000,
          autoConnect: true,
        });

        chatSocket.on("connect", () => {
          console.debug("Chat WebSocket connected");
        });

        chatSocket.on("disconnect", () => {
          console.debug("Chat WebSocket disconnected");
        });

        chatSocket.on("connect_error", (error) => {
          console.error("Chat WebSocket Connection Error:", {
            message: error.message,
            type: error.type,
            description: error.description,
            data: error.data,
            context: error.context,
          });
        });

        setSocket(chatSocket);
      } catch (error) {
        console.error("Error initializing chat service:", error);
      } finally {
        setIsConnecting(false);
      }
    };

    initializeChatSocket();

    return () => {
      if (chatSocket) {
        chatSocket.disconnect();
      }
    };
  }, [isAuthenticated, user]);

  const value = {
    socket,
    isConnected: !!socket?.connected,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
