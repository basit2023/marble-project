import { Phone } from "lucide-react";
import type { PublicSection, PublicSettings } from "@/types/public-data";
import type { PublicCopy } from "@/lib/public/copy-schema";
export function CtaSection({ section, settings, copy, whatsappHref }: { section: PublicSection; settings: PublicSettings; copy: PublicCopy; whatsappHref?: string }) {
  return <section className="bg-charcoal py-16 text-ivory"><div className="page-shell flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
    <div>{section.eyebrowLabel && <p className="editorial-label mb-3 text-accent">{section.eyebrowLabel}</p>}{section.heading && <h2 className="max-w-4xl font-heading text-title">{section.heading}</h2>}{section.subheading && <p className="mt-4 text-ivory/60">{section.subheading}</p>}</div>
    <div className="flex shrink-0 flex-wrap gap-3">{whatsappHref && section.ctaLabel && <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center bg-accent px-6 text-white">{section.ctaLabel}</a>}
      {settings.phone[0] && <a href={`tel:${settings.phone[0].replace(/[^+\d]/g, "")}`} className="inline-flex min-h-12 items-center gap-2 border border-ivory/40 px-6"><Phone className="size-4" />{copy.labels.phone}</a>}</div>
  </div></section>;
}
