/** @type {import('next').NextConfig} */

// Function to safely get hostname from URL
const getHostname = (url) => {
  try {
    return new URL(url).hostname;
  } catch (error) {
    console.error(`Invalid URL provided in environment: ${url}`);
    return "localhost";
  }
};

// Get base URL with fallback for production
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:8000";
};

const getWebsocketUrl = () => {
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }
  return "http://localhost:8001";
};

const baseUrl = getBaseUrl();
const wsUrl = getWebsocketUrl();
const hostname = getHostname(baseUrl);

const nextConfig = {
  env: {
    NEXT_PUBLIC_BASE_URL: baseUrl,
    NEXT_PUBLIC_WS_URL: wsUrl,
  },
  images: {
    domains: [
      hostname,
      "localhost",
      process.env.VERCEL_URL,
      "chronicle-server-f2n9.onrender.com",
    ].filter(Boolean),
    remotePatterns: [
      {
        protocol: "https",
        hostname: "chronicle-server-f2n9.onrender.com",
        pathname: "/media/**",
      },
      {
        protocol: baseUrl.startsWith("https") ? "https" : "http",
        hostname: hostname,
        pathname: "/media/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/media/:path*",
        destination: `${baseUrl}/media/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
