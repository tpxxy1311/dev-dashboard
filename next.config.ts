import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Spotify only accepts 127.0.0.1 (not localhost) as an OAuth redirect URI.
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    remotePatterns: [
      // Spotify album covers.
      new URL("https://i.scdn.co/image/**"),
      // Awwwards Sites of the Day thumbnails.
      new URL("https://assets.awwwards.com/awards/media/cache/**"),
    ],
  },
};

export default nextConfig;
