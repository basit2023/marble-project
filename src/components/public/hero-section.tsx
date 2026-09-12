"use client";
import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { CloudinaryImage } from "@/components/ui/cloudinary-image";
import type { PublicSection } from "@/types/public-data";
import type { PublicCopy } from "@/lib/public/copy-schema";
import type { MediaDTO } from "@/lib/media/contracts";
import { cn } from "@/lib/utils";
function Heading({ text, accent }: { text: string; accent?: string }) {
  if (!accent || !text.includes(accent)) return <>{text}</>;
  const [before, ...after] = text.split(accent);
  return <>{before}<em className="font-normal text-ivory/80">{accent}</em>{after.join(accent)}</>;
}
export function HeroSection({ section, copy, heroMedia }: { section: PublicSection; copy: PublicCopy; heroMedia: MediaDTO[] }) {
  const slides = section.items.length ? section.items : heroMedia.length ? heroMedia.map((image) => ({ key: image.id, title: section.heading, body: section.subheading, image, data: {}, sortOrder: image.sortOrder })) : [{ key: section.id, title: section.heading, body: section.subheading, image: section.backgroundImage, data: {}, sortOrder: 0 }];
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (slides.length < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setIndex((value) => (value + 1) % slides.length), 7000);
    return () => clearInterval(timer);
  }, [slides.length]);
  const move = (direction: number) => setIndex((value) => (value + direction + slides.length) % slides.length);
  return <section className="relative min-h-dvh overflow-hidden bg-charcoal text-ivory" aria-roledescription="carousel">
    {slides.map((slide, slideIndex) => <div key={slide.key} aria-hidden={slideIndex !== index} className={cn("absolute inset-0 transition-opacity duration-1000", slideIndex === index ? "z-0 opacity-100" : "opacity-0")}>
      {slide.image && <CloudinaryImage media={slide.image} sizes="100vw" priority={slideIndex === 0} className={cn("h-full w-full object-cover", slideIndex === index && "animate-ken-burns")} />}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/15" />
    </div>)}
    <div className="page-shell relative z-10 flex min-h-dvh items-end pb-24 pt-40 md:items-center md:pb-0">
      <div className="max-w-5xl">{section.eyebrowLabel && <p className="editorial-label mb-5 text-accent">{section.eyebrowLabel}</p>}
        <h1 className="font-heading text-display"><Heading text={slides[index]?.title ?? section.heading ?? ""} accent={typeof slides[index]?.data.accentWord === "string" ? slides[index].data.accentWord : undefined} /></h1>
        {(slides[index]?.body ?? section.subheading) && <p className="mt-6 max-w-2xl text-lg leading-8 text-ivory/75">{slides[index]?.body ?? section.subheading}</p>}
        <div className="mt-9 flex flex-wrap gap-3">
          {(slides[index]?.ctaLabel ?? section.ctaLabel) && (slides[index]?.ctaUrl ?? section.ctaUrl) && <Link href={(slides[index]?.ctaUrl ?? section.ctaUrl) as Route} className="inline-flex min-h-12 items-center bg-accent px-6 font-semibold uppercase tracking-[0.1em] text-charcoal">{slides[index]?.ctaLabel ?? section.ctaLabel}</Link>}
          {typeof slides[index]?.data.secondaryCtaLabel === "string" && typeof slides[index]?.data.secondaryCtaUrl === "string" && <Link href={slides[index].data.secondaryCtaUrl as Route} className="inline-flex min-h-12 items-center border border-ivory/60 px-6">{slides[index].data.secondaryCtaLabel}</Link>}
        </div>
      </div>
    </div>
    <p className="sr-only" aria-live="polite">{`${copy.labels.slide} ${index + 1} / ${slides.length}`}</p>
    {slides.length > 1 && <div className="absolute bottom-8 right-6 z-20 flex gap-2 md:right-12">
      <button onClick={() => move(-1)} aria-label={copy.labels.previousSlide} className="grid size-11 place-items-center border border-white/40"><ChevronLeft /></button>
      <button onClick={() => move(1)} aria-label={copy.labels.nextSlide} className="grid size-11 place-items-center border border-white/40"><ChevronRight /></button>
    </div>}
    <a href="#content-start" className="absolute bottom-7 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-1 text-xs uppercase tracking-widest text-ivory/60 md:flex">{copy.labels.scroll}<ChevronDown className="size-4" /></a>
  </section>;
}
