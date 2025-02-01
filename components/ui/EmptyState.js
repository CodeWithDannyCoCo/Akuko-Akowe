import { memo } from "react";
import { Users } from "lucide-react";

const EmptyState = memo(({ message, icon: Icon = Users, className = "" }) => {
  return (
    <div className={`text-center py-8 ${className}`}>
      <Icon
        className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500"
        aria-hidden="true"
      />
      <p className="text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  );
});

EmptyState.displayName = "EmptyState";

export default EmptyState;
