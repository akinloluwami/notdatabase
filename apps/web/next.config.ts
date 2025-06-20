import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      "@libsql/client",
      "libsql",
      "better-sqlite3",
    ],
  },
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.md$/,
      use: "raw-loader",
    });

    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        "better-sqlite3": "commonjs better-sqlite3",
        "@libsql/client": "commonjs @libsql/client",
        libsql: "commonjs libsql",
      });
    }

    return config;
  },
};

export default nextConfig;
