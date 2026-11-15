import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Any NASA subdomain — apod.nasa.gov, www.nasa.gov, images.nasa.gov,
        // science.nasa.gov (APOD images are increasingly hosted here), etc.
        // `**.` matches subdomains at the beginning of the hostname.
        protocol: 'https',
        hostname: '**.nasa.gov',
      },
      {
        // YouTube thumbnails for video APODs
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/vi/**',
      },
    ],
  },
};

export default nextConfig;
