"use client";

import { memo } from "react";
import Image from "next/image";
import { User } from "lucide-react";
import { getImageUrl } from "../../lib/utils";
import { getFullAvatarUrl } from "../../lib/api";

const UserAvatar = memo(({ user, size = 40, className = "" }) => {
  const hasAvatar = user?.avatar;
  const imageSize = { width: size, height: size };

  if (!hasAvatar) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full ${className}`}
        style={imageSize}
        role="img"
        aria-label={`${user?.username || "User"}'s avatar placeholder`}
      >
        <User
          className="w-1/2 h-1/2 text-gray-500 dark:text-gray-400"
          aria-hidden="true"
        />
      </div>
    );
  }

  // Try both URL utilities to ensure compatibility
  const avatarUrl = getFullAvatarUrl(user.avatar) || getImageUrl(user.avatar);

  return (
    <div
      className={`relative rounded-full overflow-hidden ${className}`}
      style={imageSize}
    >
      <Image
        src={avatarUrl}
        alt={`${user.username}'s avatar`}
        {...imageSize}
        className="object-cover"
        quality={90}
        priority={size > 96} // Prioritize loading for larger avatars
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVigAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkLzYvLy02Mi85OEI2PTZFOT5ZXVlZfG1+fW6Ghn6QjpCOd3p3gHj/2wBDARUXFx4eHR8fHXhwLicucHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHD/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      />
    </div>
  );
});

UserAvatar.displayName = "UserAvatar";

export default UserAvatar;
