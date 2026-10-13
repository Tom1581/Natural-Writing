import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/blog/how-to-make-chatgpt-essay-undetectable",
        destination: "/blog/revise-ai-assisted-essay",
        permanent: true,
      },
      {
        source: "/blog/how-to-make-ai-writing-undetectable",
        destination: "/blog/how-to-humanize-chatgpt-text",
        permanent: true,
      },
      {
        source: "/blog/how-to-bypass-turnitin-ai-detection",
        destination: "/blog/understanding-ai-writing-detectors",
        permanent: true,
      },
      {
        source: "/blog/how-to-bypass-gptzero",
        destination: "/blog/understanding-ai-writing-detectors",
        permanent: true,
      },
      {
        source: "/blog/best-ai-humanizer-for-students",
        destination: "/blog/choosing-ai-writing-editor-for-students",
        permanent: true,
      },
      {
        source: "/blog/best-ai-humanizer-2025",
        destination: "/blog/choosing-ai-writing-editor-for-students",
        permanent: true,
      },
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
