import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

export const getImageUrl = (url) => {
    if (!url) return null;

    // If it's a relative URL (starts with /)
    if (url.startsWith('/')) {
        return `${process.env.NEXT_PUBLIC_BASE_URL}${url}`;
    }

    // If it's a localhost URL, replace with production URL
    if (url.includes('localhost:8000')) {
        return url.replace('http://localhost:8000', process.env.NEXT_PUBLIC_BASE_URL);
    }

    return url;
}; 