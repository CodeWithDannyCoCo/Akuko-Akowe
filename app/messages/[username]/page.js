"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../lib/AuthContext";
import { useSocket } from "../../../lib/ChatContext";
import Image from "next/image";
import { User, Send, ArrowLeft } from "lucide-react";
import { getFullAvatarUrl } from "../../../lib/api";
import Link from "next/link";

export default function DirectMessagePage({ params }) {
  const { username } = params;
  const { user, isAuthenticated } = useAuth();
  const { socket, messages, sendMessage } = useSocket();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const [recipient, setRecipient] = useState(null);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (socket) {
      // Join the DM room (combination of both usernames sorted alphabetically)
      const room = [user.username, username].sort().join("-");
      socket.emit("join_dm", { room });
    }
  }, [socket, user, username]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage({
        content: newMessage,
        recipient: username,
        type: "text",
      });
      setNewMessage("");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Please{" "}
            <Link href="/login" className="text-blue-500 hover:underline">
              login
            </Link>{" "}
            to view messages
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center space-x-4">
          <Link
            href="/messages"
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center space-x-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden">
              {recipient?.avatar ? (
                <Image
                  src={getFullAvatarUrl(recipient.avatar)}
                  alt={username}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                </div>
              )}
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {username}
            </h1>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="h-[60vh] overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.sender === user.username
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    message.sender === user.username
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                  }`}
                >
                  <p className="break-words">{message.content}</p>
                  <span className="text-xs opacity-75 mt-1 block text-current">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
