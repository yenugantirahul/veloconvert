import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

const backendURL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (!isProduction ? "http://localhost:5000" : undefined);

if (isProduction && !backendURL) {
  throw new Error(
    "Missing BACKEND_URL (or NEXT_PUBLIC_BACKEND_URL) in production environment."
  );
}

const normalizedBackendURL = backendURL?.endsWith("/")
  ? backendURL.slice(0, -1)
  : backendURL;

const nextConfig: NextConfig = {
  async rewrites() {
    if (!normalizedBackendURL) return [];

    return [
      {
        source: "/api/:path*",
        destination: `${normalizedBackendURL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;