"use client";
import Link from "next/link";
import type { Route } from "next";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HeaderMaterial, HeaderNavLink } from "./HeaderClient";

export function MobileMenu({ open, onClose, siteName, phone, quoteUrl, nav, materials }: {
  open: boolean;
  onClose: () => void;
  siteName: string;
  phone?: string;
  quoteUrl: string;
  nav: HeaderNavLink[];
  materials: HeaderMaterial[];
}) {
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Close on route change.
  useEffect(() => { onClose(); }, [pathname, onClose]);

  // Body scroll lock + focus trap + Escape while open.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { onClose(); return; }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      root.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  const tab = open ? undefined : -1;
  const isActive = (url: string) => (url === "/" ? pathname === "/" : pathname === url || pathname.startsWith(url + "/"));

  return (
    <div
      id="mobile-menu"
      role="dialog"
      aria-modal={open || undefined}
      aria-label="Site menu"
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-[60] bg-charcoal text-ivory transition-opacity duration-300 lg:hidden",
        open ? "visible opacity-100" : "invisible opacity-0",
      )}
    >
      <div ref={panelRef} className="flex h-dvh flex-col overflow-y-auto px-6 pb-8 pt-5">
        <div className="flex items-center justify-between">
          <span className="font-heading text-xl">{siteName}</span>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close menu" tabIndex={tab} className="grid size-11 place-items-center">
            <X aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Primary" className="mt-6">
          <ul className="grid">
            {nav.map((link) => (
              <li key={link.url}>
                <Link
                  href={link.url as Route}
                  tabIndex={tab}
                  target={link.openInNewTab ? "_blank" : undefined}
                  rel={link.openInNewTab ? "noopener noreferrer" : undefined}
                  aria-current={isActive(link.url) ? "page" : undefined}
                  className="flex min-h-14 items-center justify-between border-b border-white/10 py-3 font-heading text-3xl aria-[current=page]:text-accent"
                >
                  {link.label}
                  <ChevronRight className="size-5 opacity-40" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {materials.length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ivory/45">Materials</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {materials.map((material) => (
                <Link
                  key={material.slug}
                  href={`/materials/${material.slug}` as Route}
                  tabIndex={tab}
                  className="border border-white/15 px-3 py-2 text-sm text-ivory/80"
                >
                  {material.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto grid gap-3 pt-8">
          {phone && (
            <a href={`tel:${phone.replace(/[^+\d]/g, "")}`} tabIndex={tab} className="text-sm text-ivory/70">
              {phone}
            </a>
          )}
          <Link
            href={quoteUrl as Route}
            tabIndex={tab}
            className="flex min-h-12 items-center justify-center bg-accent px-6 font-semibold text-white"
          >
            Get a Quote
          </Link>
        </div>
      </div>
    </div>
  );
}
