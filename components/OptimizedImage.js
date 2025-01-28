"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";

export default function OptimizedImage({
  src,
  alt,
  priority = false,
  quality = 75,
  loading = "lazy",
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
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

  // Preload critical images
  useEffect(() => {
    if (priority && typeof window !== "undefined") {
      const img = new window.Image();
      img.src = imgSrc;
    }
  }, [imgSrc, priority]);

  return (
    <div
      className={`relative ${
        isLoading ? "animate-pulse bg-gray-200 dark:bg-gray-700" : ""
      }`}
    >
      <Image
        {...props}
        src={imgSrc}
        alt={alt}
        quality={quality}
        loading={priority ? "eager" : loading}
        sizes={sizes}
        onLoadingComplete={() => setIsLoading(false)}
        onError={() => {
          const newSrc = getImageUrl(src);
          if (newSrc !== imgSrc) {
            setImgSrc(newSrc);
          }
          setIsLoading(false);
        }}
        className={`${props.className || ""} ${
          isLoading
            ? "opacity-0"
            : "opacity-100 transition-opacity duration-200"
        }`}
      />
    </div>
  );
}
