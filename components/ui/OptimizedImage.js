"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getImageUrl } from "../../lib/utils";

export default function OptimizedImage({
  src,
  alt,
  priority = false,
  quality = 75,
  loading = "lazy",
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  className = "",
  ...props
}) {
  const [imgSrc, setImgSrc] = useState(() => {
    try {
      new URL(src);
      return src;
    } catch (_) {
      return getImageUrl(src);
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [blurDataURL, setBlurDataURL] = useState(
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkLzYvLy02Mi85OEI2PTZFOT5ZXVlZfG1+fW6Ghn6QjpCOd3p3gHj/2wBDARUXFx4eHR8fHXhwLicucHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHD/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
  );

  // Generate blur data URL for images
  useEffect(() => {
    if (!priority) return; // Only generate for priority images

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.crossOrigin = "anonymous";
    img.src = imgSrc;

    img.onload = () => {
      canvas.width = 10;
      canvas.height = 10;
      ctx.drawImage(img, 0, 0, 10, 10);
      setBlurDataURL(canvas.toDataURL("image/jpeg", 0.1));
    };
  }, [imgSrc, priority]);

  // Preload critical images
  useEffect(() => {
    if (priority && typeof window !== "undefined") {
      const img = new window.Image();
      img.src = imgSrc;
    }
  }, [imgSrc, priority]);

  return (
    <div
      className={`relative overflow-hidden ${
        isLoading ? "animate-pulse bg-gray-200 dark:bg-gray-700" : ""
      }`}
      {...props}
    >
      <Image
        src={imgSrc}
        alt={alt}
        quality={quality}
        loading={priority ? "eager" : loading}
        sizes={sizes}
        placeholder="blur"
        blurDataURL={blurDataURL}
        onLoadingComplete={() => setIsLoading(false)}
        onError={() => {
          const newSrc = getImageUrl(src);
          if (newSrc !== imgSrc) {
            setImgSrc(newSrc);
          }
          setIsLoading(false);
        }}
        className={`${className} ${
          isLoading
            ? "scale-110 blur-2xl grayscale"
            : "scale-100 blur-0 grayscale-0"
        } transition-all duration-300 ease-in-out`}
      />
    </div>
  );
}
