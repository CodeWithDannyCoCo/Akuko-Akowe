/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [
            'akuko-akowe-server.onrender.com'
        ],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'akuko-akowe-server.onrender.com',
                pathname: '/media/**',
            }
        ],
    },
    async rewrites() {
        return [
            {
                source: '/media/:path*',
                destination: 'https://akuko-akowe-server.onrender.com/media/:path*',
            }
        ]
    }
}

module.exports = nextConfig 