import Image from "next/image";
import { FileText, Download } from "lucide-react";

export default function MessageBubble({ message, isOwn }) {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const renderContent = () => {
    switch (message.type) {
      case "image":
        return (
          <div className="relative w-48 h-48 rounded-lg overflow-hidden">
            <Image
              src={message.file_url}
              alt="Image message"
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
          </div>
        );
      case "file":
        return (
          <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
            <FileText className="w-6 h-6 text-blue-500" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {message.file_name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {Math.round(message.file_size / 1024)} KB
              </p>
            </div>
            <a
              href={message.file_url}
              download
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
        );
      default:
        return <p className="whitespace-pre-wrap">{message.content}</p>;
    }
  };

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] ${
          isOwn
            ? "bg-blue-500 text-white"
            : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
        } rounded-lg p-3 space-y-1`}
      >
        {!isOwn && (
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {message.sender}
          </p>
        )}
        {renderContent()}
        <p className="text-xs opacity-70 text-right">
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
}
