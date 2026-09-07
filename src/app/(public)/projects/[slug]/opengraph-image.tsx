import { getProjectPage } from "@/lib/public/pages-data";
import { getSeoSite } from "@/lib/seo/site";
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Project";
export const revalidate = 3600;

export default async function Image({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [project, site] = await Promise.all([getProjectPage(slug), getSeoSite()]);
  return renderOgImage({
    siteName: site.siteName,
    eyebrow: project ? `${project.projectType} · ${project.country}` : "Projects",
    title: project?.title ?? site.siteName,
    imageUrl: project?.coverImage?.secureUrl ?? site.defaultSeo.ogImage?.secureUrl,
  });
}
