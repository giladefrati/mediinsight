import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    // Import reflect-metadata for TypeORM decorators
    if (isServer) {
      config.externals.push("reflect-metadata");
    }
    return config;
  },
  // Ensure experimental features are enabled for decorators
  experimental: {
    serverComponentsExternalPackages: ["typeorm", "pg"],
  },
};

export default nextConfig;
