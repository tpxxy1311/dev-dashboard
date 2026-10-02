import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Spotify only accepts 127.0.0.1 (not localhost) as an OAuth redirect URI.
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    // Spotify album covers.
    remotePatterns: [new URL("https://i.scdn.co/image/**")],
  },
};

export default nextConfig;
