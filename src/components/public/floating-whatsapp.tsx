"use client";
import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import type { PublicCopy } from "@/lib/public/copy-schema";
export function FloatingWhatsApp({ href, copy }: { href: string; copy: PublicCopy }) {
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    const focus = (event: FocusEvent) => setFocused(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement);
    const blur = () => setFocused(false);
    document.addEventListener("focusin", focus); document.addEventListener("focusout", blur);
    return () => { document.removeEventListener("focusin", focus); document.removeEventListener("focusout", blur); };
  }, []);
  return <a href={href} target="_blank" rel="noopener noreferrer" aria-label={copy.labels.whatsapp}
    className={cnWhatsapp(focused)}><span className="absolute inset-0 -z-10 animate-ping rounded-full bg-accent/40 motion-reduce:hidden" /><MessageCircle className="size-6" /></a>;
}
function cnWhatsapp(focused: boolean) {
  return `fixed bottom-5 right-5 z-30 grid size-14 place-items-center rounded-full bg-accent text-charcoal shadow-xl transition ${focused ? "max-sm:translate-y-24" : ""}`;
}
