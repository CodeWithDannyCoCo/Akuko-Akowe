export default function BlogPostSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-pulse">
      {/* Author info skeleton */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <div className="space-y-2">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>

      {/* Title skeleton */}
      <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>

      {/* Content skeleton */}
      <div className="space-y-3 mb-4">
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-4 w-4/6 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>

      {/* Tags skeleton */}
      <div className="flex space-x-2 mb-4">
        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>

      {/* Actions skeleton */}
      <div className="flex items-center space-x-4">
        <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  );
}
