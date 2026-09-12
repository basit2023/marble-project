import { Award, Globe2, Layers3, ShieldCheck, Sparkles, Ruler, type LucideIcon } from "lucide-react";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";
import type { PublicSection } from "@/types/public-data";
const icons: Record<string, LucideIcon> = { award: Award, globe: Globe2, layers: Layers3, shield: ShieldCheck, quality: Sparkles, precision: Ruler };
export function WhyUsSection({ section }: { section: PublicSection }) {
  return <section className="py-section"><div className="page-shell"><Reveal><SectionHeading eyebrow={section.eyebrowLabel} heading={section.heading} subheading={section.subheading} /></Reveal>
    <div className="grid gap-px bg-white/10 sm:grid-cols-2 xl:grid-cols-4">{section.items.map((item) => { const Icon = icons[item.iconKey ?? "quality"] ?? Sparkles; return <Reveal key={item.key} className="bg-charcoal p-8"><Icon aria-hidden="true" className="mb-8 size-8 text-accent" /><h3 className="font-heading text-2xl">{item.title}</h3>{item.body && <p className="mt-4 leading-7 text-muted">{item.body}</p>}</Reveal>; })}</div>
  </div></section>;
}
