import { getSeoSite } from "@/lib/seo/site";
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Marble, granite and natural stone from Pakistan";
export const revalidate = 3600;

export default async function OpengraphImage() {
  const site = await getSeoSite();
  return renderOgImage({
    siteName: site.siteName,
    eyebrow: site.tagline ?? "Natural stone",
    title: site.defaultSeo.metaTitle ?? `${site.siteName} — marble, granite & onyx from Pakistan`,
    imageUrl: site.defaultSeo.ogImage?.secureUrl ?? site.logo?.secureUrl,
  });
}
