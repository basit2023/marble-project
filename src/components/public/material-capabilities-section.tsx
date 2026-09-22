"use client";

import Link from "next/link";
import type { Route } from "next";
import { ArrowRight, Flame, ShieldCheck, Sun, Layers } from "lucide-react";

const CAPABILITIES = [
  {
    icon: Flame,
    title: "Heat & Thermal Resistance",
    description: "Natural marble and granite withstand extreme temperature fluctuations without surface discoloration, ideal for outdoor kitchens, fireplaces, and heated countertops.",
    materials: "Granite, Marble & Basalt",
  },
  {
    icon: ShieldCheck,
    title: "High Density & Durability",
    description: "Compact crystalline mineral matrices resist scratching, heavy foot traffic, and structural wear in high-traffic hotel lobbies and commercial plazas.",
    materials: "Granite, Quartzite & Travertine",
  },
  {
    icon: Sun,
    title: "UV & Climate Stability",
    description: "Pigments remain rich under direct sunlight and harsh weather exposure without fading or weathering over decades.",
    materials: "All Natural Stones",
  },
  {
    icon: Layers,
    title: "Custom Finishes & Surface Treatments",
    description: "Polished, honed, brushed, leathered, bush-hammered, and fluted finishes tailored to architectural specifications.",
    materials: "Custom Cut-to-Size",
  },
];

export function MaterialCapabilitiesSection() {
  return (
    <section className="relative bg-[#0c0c0c] py-24 text-ivory border-b border-white/10 stone-vein">
      <div className="page-shell">
        <div className="mx-auto max-w-3xl text-center space-y-4">
          <div className="inline-flex items-center gap-3">
            <span className="gold-rule" aria-hidden="true" />
            <p className="editorial-label text-accent">Stonework Engineering</p>
            <span className="gold-rule" aria-hidden="true" />
          </div>
          <h2 className="font-heading text-title uppercase text-white">
            Material Capabilities & Performance
          </h2>
          <p className="text-base text-ivory/70">
            Engineered by nature for unmatched structural integrity, aesthetic elegance, and lasting longevity across luxury spaces.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {CAPABILITIES.map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.title}
                className="group relative flex flex-col justify-between rounded-sm border border-white/10 bg-panel p-8 transition-all duration-300 hover:border-accent hover:-translate-y-1 shadow-xl hover:shadow-2xl hover:shadow-black/70"
              >
                <div>
                  <div className="inline-flex p-3.5 rounded bg-white/5 text-accent border border-white/10 group-hover:border-accent/40 group-hover:bg-accent/10 transition-colors">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="mt-6 font-heading text-lg text-white group-hover:text-accent transition-colors">
                    {cap.title}
                  </h3>
                  <p className="mt-3 text-xs leading-relaxed text-ivory/65">
                    {cap.description}
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-accent/90">
                  <span>{cap.materials}</span>
                  <ArrowRight className="size-4 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-14 text-center">
          <Link
            href={"/materials" as Route}
            className="inline-flex items-center gap-3 bg-white/5 border border-white/20 px-8 py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-white hover:border-accent hover:text-accent hover:bg-white/10 transition-all"
          >
            <span>Explore All Stone Characteristics</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
