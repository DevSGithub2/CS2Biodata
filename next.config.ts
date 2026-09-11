import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "cs2biotdata.me" }],
        destination: "https://www.cs2biotdata.me/:path*",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.steamstatic.com" },
      { protocol: "https", hostname: "community.cloudflare.steamstatic.com" },
    ],
  },
};

export default nextConfig;
