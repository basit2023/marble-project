import "server-only";
import type { Metadata } from "next";
import { resolvePageMetadata } from "@/lib/seo/metadata";
import type { SeoDTO } from "@/types/public-pages";
import type { MediaDTO } from "@/lib/media/contracts";

interface MetadataExtra {
  type?: "website" | "article" | "profile";
  image?: MediaDTO;
  keywords?: string[];
  publishedTime?: string;
  modifiedTime?: string;
  noIndex?: boolean;
}

/**
 * Build page metadata from a document's seo sub-document, falling back to
 * SiteSettings.defaultSeo for every unset field. Adds canonical, robots,
 * openGraph and twitter. Async: call it from `generateMetadata`.
 */
export function metadataFromSeo(
  seo: SeoDTO | undefined,
  fallbackTitle: string,
  fallbackDescription: string,
  path: string,
  extra: MetadataExtra = {},
): Promise<Metadata> {
  return resolvePageMetadata({
    seo,
    title: fallbackTitle,
    description: fallbackDescription,
    path,
    ...extra,
  });
}
