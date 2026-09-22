"use client";
import { useEffect, useRef, useState } from "react";
import type { PublicSection } from "@/types/public-data";
export function StatsSection({ section }: { section: PublicSection }) {
  const ref = useRef<HTMLElement>(null), [started, setStarted] = useState(false);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { setStarted(true); return; }
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect(); } });
    if (ref.current) observer.observe(ref.current); return () => observer.disconnect();
  }, []);
  return <section ref={ref} className="border-y border-white/10 bg-[#0b0b0b] py-10 text-ivory"><div className="page-shell grid grid-cols-2 gap-px bg-white/10 lg:grid-cols-4">
    {section.items.map((item) => <Stat key={item.key} value={Number.parseFloat(item.value ?? "0")} suffix={typeof item.data.suffix === "string" ? item.data.suffix : ""} label={item.title ?? ""} started={started} />)}
  </div></section>;
}
function Stat({ value, suffix, label, started }: { value: number; suffix: string; label: string; started: boolean }) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (!started) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { setCurrent(value); return; }
    const start = performance.now(), duration = 1200;
    let frame = 0;
    const tick = (now: number) => { const progress = Math.min(1, (now - start) / duration); setCurrent(Math.round(value * (1 - Math.pow(1 - progress, 3)))); if (progress < 1) frame = requestAnimationFrame(tick); };
    frame = requestAnimationFrame(tick); return () => cancelAnimationFrame(frame);
  }, [started, value]);
  return <div className="bg-charcoal p-6 text-center"><p className="font-heading text-5xl text-accent">{Number.isFinite(current) ? current : 0}{suffix}</p><p className="mt-2 text-xs uppercase tracking-[0.18em] text-ivory/55">{label}</p></div>;
}
