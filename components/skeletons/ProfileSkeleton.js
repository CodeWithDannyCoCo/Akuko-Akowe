export default function ProfileSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
          {/* Avatar Skeleton */}
          <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700"></div>

          {/* Profile Info Skeleton */}
          <div className="flex-1 text-center sm:text-left space-y-4">
            {/* Username */}
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>

            {/* Bio */}
            <div className="space-y-2">
              <div className="h-4 w-full max-w-md bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 w-3/4 max-w-md bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>

            {/* Stats */}
            <div className="flex justify-center sm:justify-start space-x-6">
              <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>

          {/* Action Button Skeleton */}
          <div className="h-10 w-28 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6">
        <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
          <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="space-y-6">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 shadow rounded-lg p-6"
          >
            <div className="space-y-4">
              {/* Post Header */}
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div className="flex-1">
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>

              {/* Post Content */}
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-4/6 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>

              {/* Post Actions */}
              <div className="flex space-x-4">
                <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
