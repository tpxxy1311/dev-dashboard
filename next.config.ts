import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Spotify only accepts 127.0.0.1 (not localhost) as an OAuth redirect URI.
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
