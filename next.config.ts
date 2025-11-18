import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import path from "node:path";

const nextConfig: NextConfig = {
  experimental: {
    authInterrupts: true,
  },
  // Enable standalone output for Docker
  output: "standalone",

  // CI/Prod: do not fail the build on ESLint or TS type errors
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Silence Next.js workspace-root warning by pinning tracing root to this project
  outputFileTracingRoot: path.resolve(__dirname),

  // Webpack configuration to handle canvas and other native modules
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize canvas to prevent bundling in serverless functions
      // canvas is used by pdf-parse and requires native bindings not available in Vercel
      config.externals = config.externals ?? [];
      config.externals.push({
        canvas: "commonjs canvas",
      });
    }
    return config;
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
