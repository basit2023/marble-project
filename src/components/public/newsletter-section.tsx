import { NewsletterForm } from "./newsletter-form";
import { SectionHeading } from "./section-heading";
import type { PublicSection } from "@/types/public-data";
import type { PublicCopy } from "@/lib/public/copy-schema";
export function NewsletterSection({ section, copy }: { section: PublicSection; copy: PublicCopy }) {
  return <section className="py-section"><div className="page-shell grid items-center gap-8 lg:grid-cols-2"><SectionHeading eyebrow={section.eyebrowLabel} heading={section.heading} subheading={section.subheading} /><div className="bg-charcoal p-8 text-ivory"><NewsletterForm copy={copy} /></div></div></section>;
}
