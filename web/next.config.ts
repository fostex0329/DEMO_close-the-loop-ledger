import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['duckdb'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'duckdb'];
    }
    return config;
  },
};

export default nextConfig;
