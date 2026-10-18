import type { NextConfig } from "next";

const backendTarget = (process.env.API_PROXY_TARGET || 'http://localhost:3333').replace(/\/$/, '');

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: '/backend/:path*', destination: `${backendTarget}/:path*` }];
  },
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
