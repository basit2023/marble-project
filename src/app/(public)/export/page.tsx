import { notFound } from "next/navigation";
import { getContentPage, getQuoteOptions } from "@/lib/public/pages-data";
import { metadataFromSeo } from "@/lib/public/metadata";
import { clusterKeywords } from "@/lib/seo/keywords";
import { StaticPageView } from "@/components/public/static-page-view";
import { PublicInquiryForm } from "@/components/public/public-inquiry-form";

export const revalidate = 60;

export async function generateMetadata() {
  const page = await getContentPage("export");
  return page
    ? metadataFromSeo(page.seo, `${page.title} — Marble Export from Pakistan`, page.excerpt ?? page.title, "/export", { keywords: clusterKeywords("export") })
    : {};
}

export default async function ExportPage() {
  const [page, products] = await Promise.all([getContentPage("export"), getQuoteOptions()]);
  if (!page) notFound();
  return <StaticPageView page={page} breadcrumbs={[{ label: "Home", href: "/" }, { label: page.title }]}><section className="page-shell pb-section"><div className="max-w-3xl border-t border-ivory/10 pt-10"><h2 className="font-heading text-title">Export enquiry</h2><PublicInquiryForm source="Contact Form" inquiryType="Export" products={products} extraFields /></div></section></StaticPageView>;
}
