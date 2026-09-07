import { getProductPage } from "@/lib/public/pages-data";
import { getSeoSite } from "@/lib/seo/site";
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Product overview";
export const revalidate = 3600;

export default async function Image({ params }: { params: { categorySlug: string; productSlug: string } }) {
  const { categorySlug, productSlug } = params;
  const [data, site] = await Promise.all([getProductPage(categorySlug, productSlug), getSeoSite()]);
  const product = data?.product;
  return renderOgImage({
    siteName: site.siteName,
    eyebrow: product?.categoryName ?? "Natural stone",
    title: product?.name ?? site.siteName,
    imageUrl: product?.primaryImage?.secureUrl ?? product?.images[0]?.secureUrl ?? site.defaultSeo.ogImage?.secureUrl,
  });
}
