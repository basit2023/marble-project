import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";
import type { PublicSection } from "@/types/public-data";
export function ProcessSection({ section }: { section: PublicSection }) {
  return <section className="py-section"><div className="page-shell"><Reveal><SectionHeading eyebrow={section.eyebrowLabel} heading={section.heading} subheading={section.subheading} /></Reveal>
    <ol className="grid gap-0 lg:grid-cols-4">{section.items.map((item, index) => <Reveal key={item.key} className="relative border-l border-accent pb-10 pl-8 lg:border-l-0 lg:border-t lg:pb-0 lg:pl-0 lg:pt-9">
      <span className="absolute -left-4 top-0 grid size-8 place-items-center rounded-full bg-accent text-xs text-charcoal lg:-top-4 lg:left-0">{String(index + 1).padStart(2, "0")}</span>
      <div className="lg:pr-10"><h3 className="font-heading text-2xl">{item.title}</h3>{item.body && <p className="mt-3 leading-7 text-muted">{item.body}</p>}</div>
    </Reveal>)}</ol>
  </div></section>;
}
