import { notFound } from "next/navigation";
import { getContentPage } from "@/lib/public/pages-data";
import { metadataFromSeo } from "@/lib/public/metadata";
import { StaticPageView } from "@/components/public/static-page-view";

export const revalidate = 60;

export async function generateMetadata() {
  const page = await getContentPage("terms");
  return page ? metadataFromSeo(page.seo, page.title, page.excerpt ?? page.title, "/terms") : {};
}

export default async function TermsPage() {
  const page = await getContentPage("terms");
  if (!page) notFound();
  return <StaticPageView page={page} breadcrumbs={[{ label: "Home", href: "/" }, { label: page.title }]} />;
}
