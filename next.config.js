/** @type {import('next').NextConfig} */

// Function to safely get hostname from URL
const getHostname = (url) => {
    try {
        return new URL(url).hostname;
    } catch (error) {
        console.error(`Invalid URL provided in environment: ${url}`);
        throw new Error('Invalid URL configuration');
    }
};

// Ensure environment variables are set
if (!process.env.NEXT_PUBLIC_BASE_URL) {
    throw new Error('NEXT_PUBLIC_BASE_URL environment variable is not set');
}

const hostname = getHostname(process.env.NEXT_PUBLIC_BASE_URL);

const nextConfig = {
    images: {
        domains: [hostname],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: hostname,
                pathname: '/media/**',
            }
        ],
    },
    async rewrites() {
        return [
            {
                source: '/media/:path*',
                destination: `${process.env.NEXT_PUBLIC_BASE_URL}/media/:path*`,
            }
        ]
    }
}

module.exports = nextConfig 