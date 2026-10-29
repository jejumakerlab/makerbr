import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
  async redirects() {
    return [
      ["basalt-coaster-set", "6f1c2a10-0000-4000-8000-000000000001"],
      ["tinkercad-maker-kit", "6f1c2a10-0000-4000-8000-000000000002"],
      ["local-wood-brooch", "6f1c2a10-0000-4000-8000-000000000003"],
    ].map(([slug, id]) => ({
      source: `/store/${slug}`,
      destination: `/store/${id}`,
      permanent: true,
    }));
  },
};

export default nextConfig;
