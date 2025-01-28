export default function FeedFiltersSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 animate-pulse">
      {/* Header */}
      <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>

      {/* Filter Options */}
      <div className="space-y-3">
        {/* Feed Type */}
        <div className="flex space-x-3">
          {[...Array(2)].map((_, index) => (
            <div
              key={index}
              className="h-9 w-28 bg-gray-200 dark:bg-gray-700 rounded"
            ></div>
          ))}
        </div>

        {/* Sort Options */}
        <div className="flex items-center space-x-2">
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-9 w-36 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>

        {/* Tags */}
        <div>
          <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="flex flex-wrap gap-2">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="h-7 w-16 bg-gray-200 dark:bg-gray-700 rounded"
              ></div>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div>
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="flex space-x-2">
            <div className="h-9 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-9 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>

        {/* Apply Filters Button */}
        <div className="h-9 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  );
}
