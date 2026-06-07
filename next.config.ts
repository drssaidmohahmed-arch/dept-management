import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: false, // ✅ Enable TypeScript checking
  },
  reactStrictMode: true, // ✅ Enable strict mode for better error detection
};

export default nextConfig;