export default function AuthSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 animate-pulse">
        {/* Logo/Header */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 mb-4"></div>
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>

        {/* Form Fields */}
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow rounded-lg sm:px-10">
          <div className="space-y-6">
            {/* Email Field */}
            <div>
              <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>

            {/* Password Field */}
            <div>
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded ml-2"></div>
            </div>

            {/* Submit Button */}
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="flex justify-center space-x-4">
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  );
}
