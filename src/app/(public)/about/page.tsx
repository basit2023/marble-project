import { notFound } from "next/navigation";
import { getContentPage } from "@/lib/public/pages-data";
import { metadataFromSeo } from "@/lib/public/metadata";
import { clusterKeywords } from "@/lib/seo/keywords";
import { StaticPageView } from "@/components/public/static-page-view";

export const revalidate = 60;

export async function generateMetadata() {
  const page = await getContentPage("about");
  return page
    ? metadataFromSeo(page.seo, `${page.title} — Natural Stone Manufacturer in Pakistan`, page.excerpt ?? page.title, "/about", { keywords: clusterKeywords("about") })
    : {};
}

export default async function AboutPage() {
  const page = await getContentPage("about");
  if (!page) notFound();
  return <StaticPageView page={page} breadcrumbs={[{ label: "Home", href: "/" }, { label: page.title }]} />;
}
