import { Check } from "lucide-react";
import { CloudinaryImage } from "@/components/ui/cloudinary-image";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";
import type { PublicSection } from "@/types/public-data";
export function ExportSection({ section, whatsappHref }: { section: PublicSection; whatsappHref?: string }) {
  return <section className="bg-white py-section"><div className="page-shell grid items-center gap-12 lg:grid-cols-2">
    <Reveal>{section.backgroundImage && <CloudinaryImage media={section.backgroundImage} sizes="(max-width: 1024px) 90vw, 45vw" className="aspect-[4/5] w-full object-cover" />}</Reveal>
    <Reveal><SectionHeading eyebrow={section.eyebrowLabel} heading={section.heading} subheading={section.subheading} />{section.bodyText && <div className="prose prose-stone" dangerouslySetInnerHTML={{ __html: section.bodyText }} />}
      <ul className="mt-8 grid gap-3">{section.items.map((item) => <li key={item.key} className="flex gap-3"><Check className="mt-1 size-5 shrink-0 text-accent" /><span>{item.title}</span></li>)}</ul>
      {section.ctaLabel && (whatsappHref ?? section.ctaUrl) && <a href={whatsappHref ?? section.ctaUrl} target={whatsappHref ? "_blank" : undefined} rel={whatsappHref ? "noopener noreferrer" : undefined} className="mt-9 inline-flex min-h-12 items-center bg-accent px-6 text-white">{section.ctaLabel}</a>}
    </Reveal>
  </div></section>;
}
