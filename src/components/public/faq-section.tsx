"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { PublicFaq, PublicSection } from "@/types/public-data";

export function FaqSection({ section, faqs }: { section: PublicSection; faqs: PublicFaq[] }) {
  const [open, setOpen] = useState<string | null>(faqs[0]?.id ?? null);

  const json = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer.replace(/<[^>]+>/g, " ") },
    })),
  };

  return (
    <section className="relative bg-[#090909] py-24 text-ivory border-b border-white/10 stone-vein">
      <div className="page-shell grid gap-12 lg:grid-cols-12 lg:gap-16 items-start">
        {/* Left Heading */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-3">
            <span className="gold-rule" aria-hidden="true" />
            <p className="editorial-label text-accent">{section.eyebrowLabel ?? "Frequently Asked Questions"}</p>
          </div>
          <h2 className="font-heading text-title uppercase text-white leading-tight">
            {section.heading ?? "Got Questions About Stone Orders?"}
          </h2>
          {section.subheading && (
            <p className="text-base leading-relaxed text-ivory/70">
              {section.subheading}
            </p>
          )}
        </div>

        {/* Right Accordions */}
        <div className="lg:col-span-7 space-y-4">
          {faqs.map((faq) => {
            const expanded = open === faq.id;
            return (
              <div
                key={faq.id}
                className="rounded-sm border border-white/10 bg-panel transition-all stone-panel"
              >
                <h3>
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={"faq-" + faq.id}
                    onClick={() => setOpen(expanded ? null : faq.id)}
                    className="flex min-h-16 w-full items-center justify-between gap-4 px-6 py-4 text-left font-heading text-base font-semibold text-white hover:text-accent transition-colors"
                  >
                    <span>{faq.question}</span>
                    <div className={`grid size-8 shrink-0 place-items-center rounded-full border border-white/15 bg-white/5 text-accent transition-transform duration-300 ${expanded ? "rotate-45 bg-accent/20 border-accent" : ""}`}>
                      <Plus className="size-4" />
                    </div>
                  </button>
                </h3>
                <div
                  id={"faq-" + faq.id}
                  hidden={!expanded}
                  className="prose prose-stone px-6 pb-6 text-sm text-ivory/70 leading-relaxed border-t border-white/5 pt-4"
                  dangerouslySetInnerHTML={{ __html: faq.answer }}
                />
              </div>
            );
          })}
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json).replace(/</g, "\\u003c") }} />
    </section>
  );
}

