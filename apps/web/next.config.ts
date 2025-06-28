import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
      {
        source: "/ingest/decide",
        destination: "https://us.i.posthog.com/decide",
      },
    ];
  },
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
