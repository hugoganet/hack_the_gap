import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    authInterrupts: true,
  },
  // Enable standalone output for Docker
  output: "standalone",
};

export default nextConfig;
