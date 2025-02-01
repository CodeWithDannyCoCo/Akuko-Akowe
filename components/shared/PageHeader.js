import { memo } from "react";

const PageHeader = memo(({ className = "" }) => {
  return (
    <h1 className={`text-2xl font-bold ${className}`}>
      chrono<span className="text-blue-600 dark:text-blue-400">Chat</span>
    </h1>
  );
});

PageHeader.displayName = "PageHeader";

export default PageHeader;
