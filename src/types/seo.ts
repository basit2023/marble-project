import type { MediaDTO } from "@/lib/media/contracts";

/** Normalised, serialisable site-wide SEO context resolved from SiteSettings. */
export interface SeoSite {
  siteName: string;
  siteUrl: string;
  tagline?: string;
  defaultSeo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords: string[];
    canonicalUrl?: string;
    noIndex: boolean;
    ogImage?: MediaDTO;
  };
  logo?: MediaDTO;
  favicon?: MediaDTO;
  phone: string[];
  email: string[];
  businessHours?: string;
  priceRange?: string;
  addresses: Array<{
    label: string;
    line1: string;
    city: string;
    country: string;
    mapUrl?: string;
    latitude?: number;
    longitude?: number;
  }>;
  socialLinks: Array<{ platform: string; url: string }>;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface SeoHealthIssue {
  collection: string;
  id: string;
  label: string;
  editUrl: string;
  missing: string[];
}

export interface SeoHealthReport {
  generatedAt: string;
  totals: { scanned: number; withIssues: number };
  issues: SeoHealthIssue[];
}
