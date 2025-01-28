import dynamic from "next/dynamic";

// Dynamic import with loading state for modals
export const DynamicModal = (
  importFunc,
  { ssr = false, loading: Loading } = {}
) =>
  dynamic(importFunc, {
    ssr,
    loading: Loading
      ? () => <Loading />
      : () => (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="animate-pulse bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
              <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-32 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        ),
  });

// Dynamic import with loading state for page components
export const DynamicPage = (
  importFunc,
  { ssr = true, loading: Loading } = {}
) =>
  dynamic(importFunc, {
    ssr,
    loading: Loading
      ? () => <Loading />
      : () => (
          <div className="animate-pulse p-4">
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-gray-200 dark:bg-gray-700 rounded"
                ></div>
              ))}
            </div>
          </div>
        ),
  });

// Dynamic import for heavy components (charts, editors, etc.)
export const DynamicComponent = (
  importFunc,
  { ssr = false, loading: Loading } = {}
) =>
  dynamic(importFunc, {
    ssr,
    loading: Loading
      ? () => <Loading />
      : () => (
          <div className="animate-pulse">
            <div className="h-full w-full bg-gray-200 dark:bg-gray-700 rounded min-h-[100px]"></div>
          </div>
        ),
  });
