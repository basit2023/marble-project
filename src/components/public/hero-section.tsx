"use client";
import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { CloudinaryImage } from "@/components/ui/cloudinary-image";
import type { PublicSection } from "@/types/public-data";
import type { PublicCopy } from "@/lib/public/copy-schema";
import type { MediaDTO } from "@/lib/media/contracts";
import { cn } from "@/lib/utils";

function Heading({ text, accent }: { text: string; accent?: string }) {
  if (!accent || !text.includes(accent)) return <>{text}</>;
  const [before, ...after] = text.split(accent);
  return <>{before}<em className="font-normal italic text-accent">{accent}</em>{after.join(accent)}</>;
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

  return (
    <section className="relative min-h-dvh overflow-hidden bg-[#080808] text-ivory stone-vein" aria-roledescription="carousel">
      {slides.map((slide, slideIndex) => (
        <div key={slide.key} aria-hidden={slideIndex !== index} className={cn("absolute inset-0 transition-opacity duration-1000 ease-in-out", slideIndex === index ? "z-0 opacity-100" : "opacity-0")}>
          {slide.image && (
            <CloudinaryImage media={slide.image} sizes="100vw" priority={slideIndex === 0} className={cn("h-full w-full object-cover", slideIndex === index && "animate-ken-burns")} />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.92),rgba(0,0,0,0.65)_45%,rgba(0,0,0,0.25)),linear-gradient(0deg,rgba(8,8,8,0.98),transparent_40%)]" />
        </div>
      ))}

      <div className="page-shell relative z-10 flex min-h-dvh items-end pb-36 pt-44 md:items-center md:pb-28">
        <div className="max-w-4xl space-y-6">
          <div className="flex items-center gap-3">
            <span className="gold-rule" aria-hidden="true" />
            <span className="editorial-label text-accent font-semibold tracking-[0.25em]">
              {section.eyebrowLabel ?? "PREMIUM STONE SUPPLIER WORLDWIDE"}
            </span>
          </div>

          <h1 className="font-heading text-display uppercase text-white tracking-tight leading-[1.05]">
            <Heading text={slides[index]?.title ?? section.heading ?? "Marble Selection For Residential & Commercial Use"} accent={typeof slides[index]?.data.accentWord === "string" ? slides[index].data.accentWord : undefined} />
          </h1>

          {(slides[index]?.body ?? section.subheading) && (
            <p className="max-w-2xl text-lg leading-relaxed text-ivory/80 font-normal">
              {slides[index]?.body ?? section.subheading}
            </p>
          )}

          <div className="pt-4 flex flex-wrap gap-4">
            {(slides[index]?.ctaLabel ?? section.ctaLabel) && (slides[index]?.ctaUrl ?? section.ctaUrl) && (
              <Link
                href={(slides[index]?.ctaUrl ?? section.ctaUrl) as Route}
                className="inline-flex min-h-13 items-center gap-2.5 bg-accent px-8 text-xs font-bold uppercase tracking-[0.14em] text-charcoal transition-all hover:bg-gold-soft hover:scale-[1.02] shadow-xl shadow-accent/20"
              >
                <span>{slides[index]?.ctaLabel ?? section.ctaLabel}</span>
                <ArrowUpRight className="size-4" />
              </Link>
            )}
            <Link
              href={"/quote" as Route}
              className="inline-flex min-h-13 items-center border border-white/30 bg-white/5 px-8 text-xs font-bold uppercase tracking-[0.14em] text-white transition-all hover:border-accent hover:text-accent hover:bg-white/10"
            >
              Get Custom Quote
            </Link>
          </div>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">{`${copy.labels.slide} ${index + 1} / ${slides.length}`}</p>

      {slides.length > 1 && (
        <div className="absolute bottom-8 right-6 z-20 flex items-center gap-3 md:right-12">
          <span className="text-xs uppercase tracking-widest text-accent font-semibold">
            {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </span>
          <button onClick={() => move(-1)} aria-label={copy.labels.previousSlide} className="grid size-11 place-items-center border border-white/20 bg-black/40 text-white transition hover:border-accent hover:text-accent"><ChevronLeft className="size-5" /></button>
          <button onClick={() => move(1)} aria-label={copy.labels.nextSlide} className="grid size-11 place-items-center border border-white/20 bg-black/40 text-white transition hover:border-accent hover:text-accent"><ChevronRight className="size-5" /></button>
        </div>
      )}

      {slides.length > 1 && (
        <div className="absolute inset-x-0 bottom-0 z-10 hidden translate-y-px border-t border-white/15 bg-black/70 backdrop-blur-md md:block">
          <div className="page-shell grid grid-cols-3">
            {slides.slice(0, 3).map((slide, slideIndex) => (
              <button key={slide.key} type="button" onClick={() => setIndex(slideIndex)} className={cn("flex min-h-24 items-center justify-between border-l border-white/10 px-6 text-left transition-colors last:border-r", slideIndex === index ? "bg-white/10 text-white border-b-2 border-b-accent" : "text-ivory/55 hover:bg-white/5 hover:text-white")}>
                <span>
                  <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-accent">{String(slideIndex + 1).padStart(2, "0")}</span>
                  <span className="mt-1 block font-heading text-lg font-semibold">{slide.title ?? section.heading}</span>
                </span>
                <ArrowUpRight className="size-5 text-accent" />
              </button>
            ))}
          </div>
        </div>
      )}

      <a href="#content-start" className="absolute bottom-7 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-1 text-[11px] font-bold uppercase tracking-[0.2em] text-accent/80 hover:text-accent transition-colors md:flex">
        <span>{copy.labels.scroll}</span>
        <ChevronDown className="size-4 animate-bounce" />
      </a>
    </section>
  );
}

