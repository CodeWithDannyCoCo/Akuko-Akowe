import { memo } from "react";
import Link from "next/link";
import { UserAvatar } from "../ui";
import { EmptyState } from "../ui";

const FollowersList = memo(({ followers }) => {
  if (!followers?.length) {
    return (
      <EmptyState message="You don't have any followers yet. When someone follows you, you'll be able to message them here." />
    );
  }

  return (
    <div className="space-y-4">
      {followers.map((follower) => (
        <Link
          key={follower.username}
          href={`/messages/${follower.username}`}
          className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        >
          <div className="flex items-center space-x-4">
            <UserAvatar user={follower} size={48} />
            <div>
              <h3 className="font-medium">{follower.username}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {follower.name || "@" + follower.username}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
});

FollowersList.displayName = "FollowersList";

export default FollowersList;
