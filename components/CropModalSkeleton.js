export default function CropModalSkeleton() {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

        {/* Modal */}
        <div className="inline-block w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:p-6 sm:align-middle animate-pulse">
          {/* Header */}
          <div className="mb-4">
            <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>

          {/* Image Preview Area */}
          <div className="aspect-square w-full bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Zoom Slider */}
            <div className="flex items-center space-x-2">
              <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>

            {/* Rotate Controls */}
            <div className="flex justify-center space-x-4">
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-5">
              <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
