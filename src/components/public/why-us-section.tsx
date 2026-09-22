import { Award, Globe2, Layers3, ShieldCheck, Sparkles, Ruler, type LucideIcon } from "lucide-react";
import { Reveal } from "./reveal";
import type { PublicSection } from "@/types/public-data";

const icons: Record<string, LucideIcon> = {
  award: Award,
  globe: Globe2,
  layers: Layers3,
  shield: ShieldCheck,
  quality: Sparkles,
  precision: Ruler,
};

export function WhyUsSection({ section }: { section: PublicSection }) {
  return (
    <section className="relative bg-[#0a0a0a] py-24 text-ivory stone-vein border-b border-white/10">
      <div className="page-shell">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-3">
              <span className="gold-rule" aria-hidden="true" />
              <p className="editorial-label text-accent">{section.eyebrowLabel ?? "Why Choose Us"}</p>
              <span className="gold-rule" aria-hidden="true" />
            </div>
            <h2 className="font-heading text-title uppercase text-white">
              {section.heading ?? "Why Akma Stone Standard"}
            </h2>
            {section.subheading && (
              <p className="text-base text-ivory/70 max-w-2xl mx-auto">
                {section.subheading}
              </p>
            )}
          </div>
        </Reveal>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {section.items.map((item, idx) => {
            const Icon = icons[item.iconKey ?? "quality"] ?? Sparkles;
            return (
              <Reveal key={item.key}>
                <div className="group relative flex h-full flex-col justify-between rounded-sm border border-white/15 bg-panel p-8 transition-all duration-300 hover:border-accent hover:-translate-y-1.5 shadow-2xl stone-panel-hover">
                  <div>
                    <div className="inline-flex p-4 rounded bg-white/5 text-accent border border-white/10 group-hover:border-accent/40 group-hover:bg-accent/10 transition-colors">
                      <Icon className="size-7" />
                    </div>
                    <h3 className="mt-6 font-heading text-xl font-bold uppercase text-white group-hover:text-accent transition-colors">
                      {item.title}
                    </h3>
                    {item.body && (
                      <p className="mt-3 text-xs leading-relaxed text-ivory/70">
                        {item.body}
                      </p>
                    )}
                  </div>
                  <div className="mt-8 pt-4 border-t border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                    Pillar 0{idx + 1}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

