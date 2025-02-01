"use client";

export default function SettingsSkeleton() {
  return (
    <div className="animate-pulse max-w-2xl mx-auto">
      {/* Profile Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>

        {/* Avatar Section */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-9 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Username */}
          <div>
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>

          {/* Email */}
          <div>
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>

          {/* Bio */}
          <div>
            <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-24 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>

          {/* Save Button */}
          <div className="h-10 w-full sm:w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>

      {/* Password Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="h-6 w-56 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>

        <div className="space-y-6">
          {/* Password Fields */}
          {[...Array(3)].map((_, index) => (
            <div key={index}>
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}

          {/* Update Button */}
          <div className="h-10 w-full sm:w-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  );
}
