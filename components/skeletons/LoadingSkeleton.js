import { memo } from "react";

const LoadingSkeleton = memo(({ count = 3 }) => {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

LoadingSkeleton.displayName = "LoadingSkeleton";

export default LoadingSkeleton;
