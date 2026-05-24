import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  images: {
    remotePatterns: [],
    // Allow /api/img/* to be used with next/image
    localPatterns: [{ pathname: "/api/img/**" }],
  },
};

export default nextConfig;
