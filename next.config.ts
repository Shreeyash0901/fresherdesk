import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow dynamic server actions and API routes
  images: { unoptimized: true },
};

export default nextConfig;
