import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable powered by Next.js header
  poweredByHeader: false,

  // Disable development indicators (Next.js logo badge in corner)
  devIndicators: false,

  // Enable HTTP compression for production responses
  compress: true,

  // Optimize heavy bundle imports
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },

  // Route alias redirects
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/overview",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
