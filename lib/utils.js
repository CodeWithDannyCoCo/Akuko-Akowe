import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

export const getImageUrl = (url) => {
    if (!url) return null;

    // If it's already a full URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
        // Check if it's already using our base URL to prevent double prefixing
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
        if (baseUrl && url.startsWith(baseUrl)) {
            return url;
        }
        // If it's a full URL but not our domain, return as is
        return url;
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
        console.error('NEXT_PUBLIC_BASE_URL environment variable is not set');
        return url;
    }

    // Remove any leading slash from the URL if BASE_URL ends with a slash
    const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

    return `${cleanBaseUrl}/${cleanUrl}`;
}; 