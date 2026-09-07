import { getBlogPost } from "@/lib/public/pages-data";
import { getSeoSite } from "@/lib/seo/site";
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Article";
export const revalidate = 3600;

export default async function Image({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [data, site] = await Promise.all([getBlogPost(slug), getSeoSite()]);
  const post = data?.post;
  return renderOgImage({
    siteName: site.siteName,
    eyebrow: post?.category ?? "Blog",
    title: post?.title ?? site.siteName,
    imageUrl: post?.coverImage?.secureUrl ?? site.defaultSeo.ogImage?.secureUrl,
  });
}
