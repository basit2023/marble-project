import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { connectDB } from "@/lib/db";
import { publicFilter } from "@/models/content-fields";
import { SiteSettings } from "@/models";
import { toMediaDTO } from "@/lib/media/service";
import { env } from "@/lib/env";
import type { IMedia } from "@/types/media";
import type { SeoSite } from "@/types/seo";

type PopulatedMedia = IMedia | null | undefined;
const media = (value: PopulatedMedia) => (value && value.isActive && !value.isDeleted ? toMediaDTO(value) : undefined);

function fallbackSite(): SeoSite {
  return {
    siteName: new URL(env.NEXT_PUBLIC_SITE_URL).hostname,
    siteUrl: env.NEXT_PUBLIC_SITE_URL,
    defaultSeo: { keywords: [], noIndex: false },
    phone: [],
    email: [],
    addresses: [],
    socialLinks: [],
  };
}

const loadSeoSite = unstable_cache(
  async (): Promise<SeoSite> => {
    await connectDB();
    const raw = await SiteSettings.findOne()
      .activeOnly()
      .populate([
        { path: "logo", match: publicFilter },
        { path: "favicon", match: publicFilter },
        { path: "defaultSeo.ogImage", match: publicFilter },
      ])
      .lean();
    if (!raw) throw new Error("SiteSettings missing.");
    const settings = raw as typeof raw & {
      logo?: PopulatedMedia;
      favicon?: PopulatedMedia;
      defaultSeo: typeof raw.defaultSeo & { ogImage?: PopulatedMedia };
    };
    return {
      siteName: settings.siteName,
      siteUrl: env.NEXT_PUBLIC_SITE_URL,
      tagline: settings.tagline,
      defaultSeo: {
        metaTitle: settings.defaultSeo.metaTitle,
        metaDescription: settings.defaultSeo.metaDescription,
        keywords: settings.defaultSeo.keywords ?? [],
        canonicalUrl: settings.defaultSeo.canonicalUrl,
        noIndex: Boolean(settings.defaultSeo.noIndex),
        ogImage: media(settings.defaultSeo.ogImage),
      },
      logo: media(settings.logo),
      favicon: media(settings.favicon),
      phone: settings.phone ?? [],
      email: settings.email ?? [],
      businessHours: settings.businessHours,
      priceRange: settings.priceRange,
      addresses: (settings.addresses ?? []).map((address) => ({
        label: address.label,
        line1: address.line1,
        city: address.city,
        country: address.country,
        mapUrl: address.mapUrl,
        latitude: address.latitude,
        longitude: address.longitude,
      })),
      socialLinks: (settings.socialLinks ?? [])
        .filter((link) => link.isActive)
        .map((link) => ({ platform: link.platform, url: link.url })),
    };
  },
  ["seo-site"],
  { tags: ["site-settings"], revalidate: 60 },
);

/**
 * Site-wide SEO context. Resolved from the singleton SiteSettings document,
 * cached cross-request under the `site-settings` tag, and safe to call from any
 * route including error boundaries: a database outage yields a minimal fallback.
 */
export const getSeoSite = cache(async (): Promise<SeoSite> => {
  try {
    return await loadSeoSite();
  } catch {
    console.error("SEO site context unavailable.");
    return fallbackSite();
  }
});
