"use client";
import Link from "next/link";
import type { Route } from "next";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, Phone } from "lucide-react";
import { CloudinaryImage } from "@/components/ui/cloudinary-image";
import { MobileMenu } from "./MobileMenu";
import { cn } from "@/lib/utils";
import type { MediaDTO } from "@/lib/media/contracts";

export type HeaderNavLink = { label: string; url: string; openInNewTab: boolean };
export type HeaderMaterial = { name: string; slug: string };

export function HeaderClient({ siteName, logo, phone, quoteUrl, nav, materials }: {
  siteName: string;
  logo?: MediaDTO;
  phone?: string;
  quoteUrl: string;
  nav: HeaderNavLink[];
  materials: HeaderMaterial[];
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [materialsOpen, setMaterialsOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);
  const dropdownButtonRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!materialsOpen) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setMaterialsOpen(false); };
    const onPointer = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setMaterialsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onPointer);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("click", onPointer); };
  }, [materialsOpen]);

  const transparent = isHome && !scrolled && !menuOpen;
  const isActive = (url: string) => (url === "/" ? pathname === "/" : pathname === url || pathname.startsWith(url + "/"));

  const openDropdown = () => { if (closeTimer.current) clearTimeout(closeTimer.current); setMaterialsOpen(true); };
  const scheduleClose = () => { closeTimer.current = setTimeout(() => setMaterialsOpen(false), 120); };
  // Open when focus enters a submenu link (keyboard), but not when the trigger
  // itself is tab-focused — that stays a manual toggle via Enter/Space.
  const onDropdownFocus = (event: React.FocusEvent<HTMLLIElement>) => {
    if ((event.target as HTMLElement) !== dropdownButtonRef.current) openDropdown();
  };
  const onDropdownBlur = (event: React.FocusEvent<HTMLLIElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setMaterialsOpen(false);
  };

  const linkClass = "flex min-h-11 items-center px-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-ivory/80 transition-colors hover:text-ivory aria-[current=page]:text-ivory aria-[current=page]:underline aria-[current=page]:decoration-accent aria-[current=page]:underline-offset-[10px]";

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
          transparent ? "bg-transparent" : "bg-charcoal shadow-lg shadow-black/25",
        )}
      >
        <div className="page-shell flex h-20 items-center gap-4 text-ivory">
          <Link href="/" aria-label={siteName} className="flex shrink-0 items-center">
            {logo ? (
              <CloudinaryImage media={logo} sizes="180px" priority className="h-9 w-auto max-w-[180px] object-contain" />
            ) : (
              <span className="font-heading text-2xl leading-none">{siteName}</span>
            )}
          </Link>

          <nav aria-label="Primary" className="mx-auto hidden lg:block">
            <ul className="flex items-center">
              {nav.map((link) => {
                if (link.url === "/materials" && materials.length > 0) {
                  return (
                    <li
                      key={link.url}
                      ref={dropdownRef}
                      className="relative"
                      onMouseEnter={openDropdown}
                      onMouseLeave={scheduleClose}
                      onFocus={onDropdownFocus}
                      onBlur={onDropdownBlur}
                    >
                      <button
                        ref={dropdownButtonRef}
                        type="button"
                        aria-expanded={materialsOpen}
                        aria-haspopup="true"
                        aria-current={isActive("/materials") ? "page" : undefined}
                        onClick={() => setMaterialsOpen((value) => !value)}
                        className={cn(linkClass, "gap-1")}
                      >
                        {link.label}
                        <ChevronDown className={cn("size-4 transition-transform", materialsOpen && "rotate-180")} aria-hidden="true" />
                      </button>
                      <ul
                        hidden={!materialsOpen}
                        className="absolute left-1/2 top-full w-64 -translate-x-1/2 border border-white/10 bg-charcoal p-2 shadow-2xl shadow-black/40"
                      >
                        <li>
                          <Link href="/materials" className="block px-3 py-2.5 text-sm text-ivory/75 hover:bg-white/10 hover:text-ivory">
                            All materials
                          </Link>
                        </li>
                        {materials.map((material) => (
                          <li key={material.slug}>
                            <Link
                              href={`/materials/${material.slug}` as Route}
                              className="block px-3 py-2.5 text-sm text-ivory/75 hover:bg-white/10 hover:text-ivory"
                            >
                              {material.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                  );
                }
                return (
                  <li key={link.url}>
                    <Link
                      href={link.url as Route}
                      target={link.openInNewTab ? "_blank" : undefined}
                      rel={link.openInNewTab ? "noopener noreferrer" : undefined}
                      aria-current={isActive(link.url) ? "page" : undefined}
                      className={linkClass}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="ml-auto hidden items-center gap-3 lg:flex">
            {phone && (
              <a href={`tel:${phone.replace(/[^+\d]/g, "")}`} className="flex min-h-11 items-center gap-2 px-2 text-sm text-ivory/80 hover:text-ivory">
                <Phone className="size-4" aria-hidden="true" />
                {phone}
              </a>
            )}
            <Link
              href={quoteUrl as Route}
              className="flex min-h-11 items-center bg-accent px-5 text-[13px] font-semibold uppercase tracking-[0.1em] text-charcoal transition-colors hover:bg-accent/85"
            >
              Get a Quote
            </Link>
          </div>

          <button
            type="button"
            className="ml-auto grid size-11 place-items-center text-ivory lg:hidden"
            aria-label="Open menu"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Spacer so non-transparent pages never hide content under the fixed header. */}
      {!isHome && <div aria-hidden="true" className="h-20 bg-charcoal" />}

      <MobileMenu
        open={menuOpen}
        onClose={closeMenu}
        siteName={siteName}
        phone={phone}
        quoteUrl={quoteUrl}
        nav={nav}
        materials={materials}
      />
    </>
  );
}
