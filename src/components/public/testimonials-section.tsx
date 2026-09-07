"use client";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { SectionHeading } from "./section-heading";
import type { PublicSection, PublicTestimonial } from "@/types/public-data";
import type { PublicCopy } from "@/lib/public/copy-schema";
export function TestimonialsSection({ section, testimonials, copy }: { section: PublicSection; testimonials: PublicTestimonial[]; copy: PublicCopy }) {
  const [index, setIndex] = useState(0), [paused, setPaused] = useState(false);
  const move = useCallback((amount: number) => setIndex((value) => (value + amount + testimonials.length) % testimonials.length), [testimonials.length]);
  useEffect(() => {
    if (paused || testimonials.length < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => move(1), 6000); return () => clearInterval(timer);
  }, [paused, testimonials.length, move]);
  const testimonial = testimonials[index];
  if (!testimonial) return null;
  return <section className="bg-charcoal py-section text-ivory" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}>
    <div className="page-shell"><SectionHeading eyebrow={section.eyebrowLabel} heading={section.heading} subheading={section.subheading} />
      <div aria-live="polite" className="mx-auto max-w-4xl text-center"><div className="mb-7 flex justify-center gap-1" aria-label={testimonial.rating + " " + copy.labels.stars}>{Array.from({ length: testimonial.rating }, (_, value) => <Star key={value} className="size-5 fill-accent text-accent" />)}</div>
        <blockquote className="font-heading text-3xl leading-tight md:text-5xl">“{testimonial.message}”</blockquote>
        <p className="mt-8 font-semibold">{testimonial.clientName}</p>{(testimonial.clientTitle || testimonial.company) && <p className="text-sm text-ivory/55">{[testimonial.clientTitle, testimonial.company].filter(Boolean).join(", ")}</p>}
      </div>{testimonials.length > 1 && <div className="mt-10 flex justify-center gap-2"><button onClick={() => move(-1)} aria-label={copy.labels.previousTestimonial} className="grid size-11 place-items-center border border-white/30"><ChevronLeft /></button><button onClick={() => move(1)} aria-label={copy.labels.nextTestimonial} className="grid size-11 place-items-center border border-white/30"><ChevronRight /></button></div>}
    </div>
  </section>;
}
