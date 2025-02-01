"use client";

export default function CommentSkeleton({ count = 3 }) {
  return (
    <div className="space-y-6 animate-pulse">
      {/* New Comment Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>

          {/* Comment Input */}
          <div className="flex-1">
            <div className="h-20 w-full bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
            <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>

      {/* Comment List */}
      <div className="space-y-4">
        {[...Array(count)].map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <div className="flex space-x-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>

              <div className="flex-1 space-y-2">
                {/* Username and Date */}
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>

                {/* Comment Content */}
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-4">
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
