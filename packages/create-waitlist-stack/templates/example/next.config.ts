import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // workers-og bundles resvg + yoga as WASM and is only loadable in the
  // Cloudflare Workers runtime. Externalize so Next's Node build doesn't
  // try to bundle it; the @opennextjs/cloudflare adapter inlines it for
  // the Worker at deploy time.
  serverExternalPackages: ["workers-og", "better-sqlite3"],
  webpack: (config) => {
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    return config;
  },
};

export default nextConfig;
