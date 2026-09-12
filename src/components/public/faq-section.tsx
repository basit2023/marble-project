"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { SectionHeading } from "./section-heading";
import type { PublicFaq, PublicSection } from "@/types/public-data";
export function FaqSection({ section, faqs }: { section: PublicSection; faqs: PublicFaq[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const json = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((faq) => ({
    "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer.replace(/<[^>]+>/g, " ") },
  })) };
  return <section className="py-section"><div className="page-shell grid gap-12 lg:grid-cols-[.8fr_1.2fr]"><SectionHeading eyebrow={section.eyebrowLabel} heading={section.heading} subheading={section.subheading} />
    <div>{faqs.map((faq) => { const expanded = open === faq.id; return <div key={faq.id} className="border-t border-white/15 last:border-b"><h3><button type="button" aria-expanded={expanded} aria-controls={"faq-" + faq.id} onClick={() => setOpen(expanded ? null : faq.id)} className="flex min-h-16 w-full items-center justify-between gap-4 py-4 text-left font-semibold"><span>{faq.question}</span><Plus className={`size-5 shrink-0 transition ${expanded ? "rotate-45" : ""}`} /></button></h3>
      <div id={"faq-" + faq.id} hidden={!expanded} className="prose prose-stone pb-6" dangerouslySetInnerHTML={{ __html: faq.answer }} /></div>; })}</div>
  </div><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json).replace(/</g, "\\u003c") }} /></section>;
}
