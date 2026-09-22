"use client";

import { Star, Quote, CheckCircle } from "lucide-react";
import type { PublicSection } from "@/types/public-data";

const REVIEWS = [
  {
    author: "Faisal Al-Otaibi",
    role: "Architectural Lead",
    location: "Riyadh, KSA",
    rating: 5,
    text: "The bookmatched marble slabs supplied for our luxury villa project were cut with millimeter precision. The vein matching across the feature wall is flawless.",
  },
  {
    author: "Omar Hassan",
    role: "Property Developer",
    location: "Lahore, Pakistan",
    rating: 5,
    text: "Exceptional quality Ziarat White marble and black granite. Container shipment arrived perfectly packaged on custom A-frames with zero breakage.",
  },
  {
    author: "Tariq Mahmood",
    role: "Interior Designer",
    location: "Dubai, UAE",
    rating: 5,
    text: "Backlit Honey Onyx for our hotel lobby bar exceeded all expectations. Translucent quality and polishing are world class.",
  },
];

export function ReviewsSection({ section }: { section?: PublicSection }) {
  return (
    <section className="relative bg-[#090909] py-24 text-ivory border-b border-white/10 stone-vein">
      <div className="page-shell">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-white/10">
          <div>
            <div className="flex items-center gap-3">
              <span className="gold-rule" aria-hidden="true" />
              <p className="editorial-label text-accent">Client Feedback</p>
            </div>
            <h2 className="mt-3 font-heading text-title uppercase text-white">
              {section?.heading ?? "Trusted by Architects & Builders Worldwide"}
            </h2>
          </div>

          {/* Rating Badge */}
          <div className="flex items-center gap-4 bg-panel border border-white/15 px-6 py-4 rounded-sm shadow-xl shrink-0">
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="size-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <div className="border-l border-white/15 pl-4">
              <span className="block font-heading text-2xl font-bold leading-none text-white">4.9 / 5.0</span>
              <span className="text-[11px] uppercase tracking-wider text-ivory/60">Verified Client Rating</span>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {REVIEWS.map((rev, idx) => (
            <div
              key={idx}
              className="relative flex flex-col justify-between rounded-sm border border-white/10 bg-panel p-8 transition-all duration-300 hover:border-accent hover:shadow-2xl hover:shadow-black/80"
            >
              <Quote className="size-8 text-accent/30 absolute top-6 right-6" />
              <div>
                <div className="flex items-center text-amber-400 gap-1 mb-4">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm italic leading-relaxed text-ivory/80">
                  &quot;{rev.text}&quot;
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-sm font-semibold text-white">
                    {rev.author}
                  </h3>
                  <p className="text-xs text-ivory/50">
                    {rev.role} • {rev.location}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-1 rounded">
                  <CheckCircle className="size-3" />
                  Verified
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
