'use client'

import { useState } from 'react'
import Image from 'next/image'
import { getImageUrl } from '@/lib/utils'

export default function OptimizedImage({ src, alt, ...props }) {
    // Use the utility function to transform the URL
    const [imgSrc, setImgSrc] = useState(() => {
        // If src is already a full URL (from getFullAvatarUrl), use it directly
        try {
            new URL(src);
            return src;
        } catch (_) {
            // If not a valid URL, use our utility function
            return getImageUrl(src);
        }
    });

    return (
        <Image
            {...props}
            src={imgSrc}
            alt={alt}
            onError={() => {
                // If the image fails to load, try getting the URL again
                // This is now just a safety check and shouldn't be needed often
                const newSrc = getImageUrl(src);
                if (newSrc !== imgSrc) {
                    setImgSrc(newSrc);
                }
            }}
        />
    );
} 