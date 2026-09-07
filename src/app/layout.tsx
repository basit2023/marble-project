import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { getSystemCopy } from "@/lib/content";
import { getSeoSite } from "@/lib/seo/site";
import { SystemCopyProvider } from "@/components/ui/system-screens";
import "./globals.css";

const heading = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  preload: true,
  fallback: ["Georgia", "Cambria", "Times New Roman", "serif"],
  adjustFontFallback: true,
  variable: "--font-cormorant",
});
const body = Manrope({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "Arial", "sans-serif"],
  variable: "--font-manrope",
});
export const runtime = "nodejs";
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSeoSite();
  const ogImage = site.defaultSeo.ogImage;
  const images = ogImage
    ? [{ url: ogImage.secureUrl, width: ogImage.width, height: ogImage.height, alt: ogImage.altText }]
    : undefined;
  return {
    metadataBase: new URL(site.siteUrl),
    title: {
      default: site.defaultSeo.metaTitle ?? site.siteName,
      template: `%s | ${site.siteName}`,
    },
    description: site.defaultSeo.metaDescription,
    applicationName: site.siteName,
    referrer: "strict-origin-when-cross-origin",
    formatDetection: { email: false, address: false, telephone: false },
    icons: site.favicon ? { icon: site.favicon.secureUrl } : undefined,
    alternates: { canonical: site.siteUrl },
    robots: site.defaultSeo.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
    openGraph: { type: "website", siteName: site.siteName, locale: "en_US", url: site.siteUrl, images },
    twitter: { card: "summary_large_image", images: images?.map((entry) => entry.url) },
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const copy = await getSystemCopy();
  return <html lang="en"><body className={`${heading.variable} ${body.variable}`}>
    <SystemCopyProvider copy={copy}>{children}</SystemCopyProvider>
  </body></html>;
}
