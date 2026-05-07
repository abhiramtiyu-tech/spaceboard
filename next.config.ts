import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   images: {
    remotePatterns: [
      {
        // NASA APOD images
        protocol: 'https',
        hostname: 'apod.nasa.gov',
      },
      {
        // Some APOD images come from this domain
        protocol: 'https',
        hostname: 'www.nasa.gov',
      },
      {
        // Occasionally images come from here too
        protocol: 'https',
        hostname: 'images.nasa.gov',
      },
    ],
  },
};

export default nextConfig;
