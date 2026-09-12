"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { PublicCopy } from "@/lib/public/copy-schema";
export function AnnouncementBar({ text, url, copy }: { text: string; url?: string; copy: PublicCopy }) {
  const key = "announcement:" + text;
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    let dismissed = false;
    try { dismissed = localStorage.getItem(key) === "dismissed"; } catch { /* storage unavailable */ }
    setVisible(!dismissed);
    document.documentElement.style.setProperty("--announcement-height", dismissed ? "0px" : "2.75rem");
    return () => { document.documentElement.style.removeProperty("--announcement-height"); };
  }, [key]);
  if (!visible) return null;
  const dismiss = () => {
    try { localStorage.setItem(key, "dismissed"); } catch { /* storage unavailable */ }
    document.documentElement.style.setProperty("--announcement-height", "0px");
    setVisible(false);
  };
  return <div className="relative z-50 flex min-h-11 items-center justify-center gap-3 bg-accent py-2 pl-4 pr-12 text-center text-sm tracking-wide text-charcoal">
    {url ? <a href={url} className="underline underline-offset-4">{text}</a> : <p>{text}</p>}
    <button type="button" aria-label={copy.labels.dismissAnnouncement} onClick={dismiss} className="absolute right-1 grid min-h-11 min-w-11 place-items-center">
      <X className="size-4" aria-hidden="true" />
    </button>
  </div>;
}
