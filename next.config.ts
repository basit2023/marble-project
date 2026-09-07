import type { NextConfig } from "next";
import { env } from "./src/lib/env";
import { buildCsp } from "./src/lib/security";

const nextConfig: NextConfig = {
  typedRoutes: true,
  poweredByHeader: false,
  trailingSlash: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com", pathname: `/${env.CLOUDINARY_CLOUD_NAME}/image/upload/**` }],
    deviceSizes: [360, 390, 768, 1024, 1440, 1920],
    formats: ["image/avif", "image/webp"],
  },
  // 301/308 redirects consolidate legacy and duplicate paths onto canonical URLs.
  async redirects() {
    return [
      { source: "/home", destination: "/", permanent: true },
      { source: "/index", destination: "/", permanent: true },
      { source: "/products", destination: "/materials", permanent: true },
      { source: "/products/:path*", destination: "/materials", permanent: true },
      { source: "/materials/category/:slug", destination: "/materials/:slug", permanent: true },
      { source: "/blog/category", destination: "/blog", permanent: true },
      { source: "/faqs", destination: "/faq", permanent: true },
    ];
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
