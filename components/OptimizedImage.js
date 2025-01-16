'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function OptimizedImage({ src, alt, ...props }) {
    // Transform the URL immediately
    const transformUrl = (url) => {
        if (!url) return '';

        // Handle localhost URLs
        if (url.includes('localhost:8000')) {
            return url.replace('http://localhost:8000', 'https://1dfe-102-88-53-239.ngrok-free.app');
        }

        // Handle relative paths
        if (url.startsWith('/')) {
            return `https://1dfe-102-88-53-239.ngrok-free.app${url}`;
        }

        return url;
    };

    const [imgSrc, setImgSrc] = useState(transformUrl(src));

    return (
        <Image
            {...props}
            src={imgSrc}
            alt={alt}
            onError={() => {
                // If the image fails to load, try the direct ngrok URL
                const newSrc = transformUrl(src);
                if (newSrc !== imgSrc) {
                    setImgSrc(newSrc);
                }
            }}
        />
    );
} 