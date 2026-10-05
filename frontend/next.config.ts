import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        // One canonical host: www.naturalquill.one served a duplicate copy of every page.
        source: "/:path*",
        has: [{ type: "host", value: "www.naturalquill.one" }],
        destination: "https://naturalquill.one/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/ads.txt",
        headers: [
          {
            key: "Content-Type",
            value: "text/plain; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
