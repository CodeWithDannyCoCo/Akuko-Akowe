/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [
            'chronicle-server-f2n9.onrender.com'
        ],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'chronicle-server-f2n9.onrender.com',
                pathname: '/media/**',
            }
        ],
    },
    async rewrites() {
        return [
            {
                source: '/media/:path*',
                destination: 'https://chronicle-server-f2n9.onrender.com/media/:path*',
            }
        ]
    }
}

module.exports = nextConfig 