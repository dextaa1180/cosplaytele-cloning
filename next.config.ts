import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "tunacosplay.site",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
