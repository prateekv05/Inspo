import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma's generated client lives outside node_modules (see
  // prisma/schema.prisma's `output`), so Next's serverless file tracer
  // doesn't automatically pick up the native query-engine binary next to it.
  // See https://pris.ly/d/engine-not-found-nextjs
  outputFileTracingIncludes: {
    "/*": ["./app/generated/prisma/**/*"],
  },
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
