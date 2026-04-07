import type { NextConfig } from "next";

const backendURL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:5000";

const normalizedBackendURL = backendURL.endsWith("/")
  ? backendURL.slice(0, -1)
  : backendURL;

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${normalizedBackendURL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
