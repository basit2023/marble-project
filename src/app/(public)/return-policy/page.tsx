import { notFound } from "next/navigation";
import { getContentPage } from "@/lib/public/pages-data";
import { metadataFromSeo } from "@/lib/public/metadata";
import { StaticPageView } from "@/components/public/static-page-view";

export const revalidate = 60;

export async function generateMetadata() {
  const page = await getContentPage("return-policy");
  return page ? metadataFromSeo(page.seo, page.title, page.excerpt ?? page.title, "/return-policy") : {};
}

export default async function ReturnPolicyPage() {
  const page = await getContentPage("return-policy");
  if (!page) notFound();
  return <StaticPageView page={page} breadcrumbs={[{ label: "Home", href: "/" }, { label: page.title }]} />;
}
