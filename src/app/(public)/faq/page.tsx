import { getFaqPage } from "@/lib/public/pages-data";
import { metadataFromSeo } from "@/lib/public/metadata";
import { getSeoSite } from "@/lib/seo/site";
import { breadcrumbLd } from "@/lib/seo/jsonld";
import { JsonLd } from "@/components/seo/json-ld";
import { PageHero } from "@/components/public/page-hero";
import { FaqSection } from "@/components/public/faq-section";

export const revalidate = 60;

export function generateMetadata() {
  return metadataFromSeo(undefined, "Natural Stone FAQ — Pricing, Care & Export", "Answers about marble and natural stone pricing in Pakistan, ordering, installation, care and export.", "/faq");
}

export default async function FaqPage() {
  const [faqs, site] = await Promise.all([getFaqPage(), getSeoSite()]);
  const section = { id: "faq-page", sectionKey: "faq", heading: "Frequently asked questions", items: [], sortOrder: 0 };
  return (
    <>
      <PageHero title="FAQ" body="Answers about materials, pricing, export, installation and care." breadcrumbs={[{ label: "Home", href: "/" }, { label: "FAQ" }]} />
      <FaqSection section={section} faqs={faqs.map((faq) => ({ id: faq._id.toString(), question: faq.question, answer: faq.answer }))} />
      <JsonLd data={breadcrumbLd([{ label: "Home", href: "/" }, { label: "FAQ", href: "/faq" }], site)} />
    </>
  );
}
