import type { NextConfig } from "next";
import { env } from "./src/lib/env";
import { buildCsp } from "./src/lib/security";

const nextConfig: NextConfig = {
  typedRoutes: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com", pathname: `/${env.CLOUDINARY_CLOUD_NAME}/image/upload/**` }],
    deviceSizes: [360, 390, 768, 1024, 1440, 1920],
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Content-Security-Policy", value: buildCsp() },
      ],
    }];
  },
};
export default nextConfig;
