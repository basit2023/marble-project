import "server-only";
import type { Metadata } from "next";
import { getSeoSite } from "./site";
import type { SeoDTO } from "@/types/public-pages";
import type { MediaDTO } from "@/lib/media/contracts";

interface PageMetadataInput {
  /** The document's own seo sub-document, when the page renders one entity. */
  seo?: SeoDTO;
  /** Human title for this page. Passed through the "%s | {siteName}" template unless `absoluteTitle`. */
  title: string;
  description?: string;
  /** Site-relative path, e.g. "/materials/white-marble". Used for the canonical URL. */
  path: string;
  type?: "website" | "article" | "profile";
  /** Explicit OG image override; otherwise falls back to seo.ogImage then SiteSettings.defaultSeo.ogImage. */
  image?: MediaDTO;
  keywords?: string[];
  publishedTime?: string;
  modifiedTime?: string;
  /** Homepage only: emit the title verbatim without the template suffix. */
  absoluteTitle?: boolean;
  /** Force noindex regardless of the seo flag (e.g. thin search results). */
  noIndex?: boolean;
}

const ogImageEntry = (image: MediaDTO) => ({
  url: image.secureUrl,
  width: image.width,
  height: image.height,
  alt: image.altText,
});

export async function resolvePageMetadata(input: PageMetadataInput): Promise<Metadata> {
  const site = await getSeoSite();
  const metadataBase = new URL(site.siteUrl);

  const title = input.seo?.metaTitle?.trim() || input.title;
  const description =
    input.seo?.metaDescription?.trim() ||
    input.description ||
    site.defaultSeo.metaDescription;
  const keywords =
    (input.keywords && input.keywords.length && input.keywords) ||
    (input.seo?.keywords.length && input.seo.keywords) ||
    (site.defaultSeo.keywords.length && site.defaultSeo.keywords) ||
    undefined;

  // Prefer an editor-set canonical, but never point it off-site.
  let canonical = new URL(input.path, metadataBase);
  if (input.seo?.canonicalUrl) {
    try {
      const supplied = new URL(input.seo.canonicalUrl);
      if (supplied.origin === metadataBase.origin) canonical = supplied;
    } catch {
      /* keep the path-based canonical */
    }
  }

  const noIndex = Boolean(input.noIndex) || Boolean(input.seo?.noIndex) || site.defaultSeo.noIndex;
  const image = input.image ?? input.seo?.ogImage ?? site.defaultSeo.ogImage;
  const images = image ? [ogImageEntry(image)] : undefined;

  const ogBase = {
    title,
    description,
    url: canonical,
    siteName: site.siteName,
    locale: "en_US",
    images,
  };
  const openGraph: Metadata["openGraph"] =
    input.type === "article"
      ? { ...ogBase, type: "article", publishedTime: input.publishedTime, modifiedTime: input.modifiedTime ?? input.publishedTime }
      : input.type === "profile"
        ? { ...ogBase, type: "profile" }
        : { ...ogBase, type: "website" };

  return {
    metadataBase,
    title: input.absoluteTitle ? { absolute: title } : title,
    description,
    keywords,
    alternates: { canonical },
    robots: noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
    openGraph,
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images?.map((entry) => entry.url),
    },
  };
}
