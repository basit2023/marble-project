import { getQuoteOptions } from "@/lib/public/pages-data";
import { metadataFromSeo } from "@/lib/public/metadata";
import { PageHero } from "@/components/public/page-hero";
import { QuoteWizard } from "@/components/public/quote-wizard";

export const revalidate = 60;

export function generateMetadata() {
  return metadataFromSeo(undefined, "Request a Marble & Natural Stone Quote", "Send a detailed marble, granite, onyx or travertine quote request for a project or export order from Pakistan.", "/quote");
}

export default async function QuotePage() {
  const products = await getQuoteOptions();
  return <><PageHero title="Request a Quote" body="Share project type, material interests, quantity, timeline and drawings in one guided request." breadcrumbs={[{ label: "Home", href: "/" }, { label: "Request a Quote" }]} /><QuoteWizard products={products} /></>;
}
