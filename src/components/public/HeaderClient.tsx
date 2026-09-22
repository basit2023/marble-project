"use client";
import Link from "next/link";
import type { Route } from "next";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, Phone, Search, Globe2, ArrowRight } from "lucide-react";
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
  const onDropdownFocus = (event: React.FocusEvent<HTMLLIElement>) => {
    if ((event.target as HTMLElement) !== dropdownButtonRef.current) openDropdown();
  };
  const onDropdownBlur = (event: React.FocusEvent<HTMLLIElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setMaterialsOpen(false);
  };

  const linkClass = "flex min-h-11 items-center px-3.5 text-[12px] font-bold uppercase tracking-[0.14em] text-ivory/80 transition-colors hover:text-accent aria-[current=page]:text-accent aria-[current=page]:underline aria-[current=page]:decoration-accent aria-[current=page]:underline-offset-[10px]";

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
          transparent ? "border-b border-white/10 bg-black/40 backdrop-blur-md" : "border-b border-white/10 bg-[#0a0a0a]/95 shadow-2xl backdrop-blur-lg",
        )}
      >
        {/* Top Announcement Bar inspired by AKMA Stone */}
        <div className="hidden border-b border-white/10 bg-black/60 py-2 text-[11px] uppercase tracking-[0.18em] text-ivory/70 lg:block">
          <div className="page-shell flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 text-accent font-semibold">
                <Globe2 className="size-3.5" /> Premium Stone Supplier Worldwide
              </span>
              <span className="text-white/20">|</span>
              <span>Marble • Granite • Onyx • Travertine</span>
            </div>
            <div className="flex items-center gap-6">
              {phone ? <a href={`tel:${phone.replace(/[^+\d]/g, "")}`} className="flex items-center gap-1.5 hover:text-white transition-colors"><Phone className="size-3 text-accent" />{phone}</a> : null}
              <Link href={"/search" as Route} className="inline-flex items-center gap-1.5 hover:text-accent transition-colors"><Search className="size-3.5" />Search Catalog</Link>
            </div>
          </div>
        </div>

        <div className="page-shell flex h-20 items-center justify-between gap-4 text-ivory lg:h-[4.75rem]">
          <Link href="/" aria-label={siteName} className="flex shrink-0 items-center gap-3">
            {logo ? (
              <CloudinaryImage media={logo} sizes="180px" priority className="h-10 w-auto max-w-[180px] object-contain" />
            ) : (
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded border border-accent/40 bg-accent/10 font-heading font-bold text-accent">A</span>
                <div className="flex flex-col">
                  <span className="font-heading text-xl font-bold tracking-widest uppercase text-white leading-none">{siteName}</span>
                  <span className="text-[9px] uppercase tracking-[0.25em] text-accent mt-0.5">Natural Stone Excellence</span>
                </div>
              </div>
            )}
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
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
                        <ChevronDown className={cn("size-3.5 transition-transform text-accent", materialsOpen && "rotate-180")} aria-hidden="true" />
                      </button>
                      <ul
                        hidden={!materialsOpen}
                        className="stone-vein absolute left-1/2 top-full w-72 -translate-x-1/2 rounded-sm border border-white/15 bg-[#121212] p-2 shadow-2xl shadow-black/80"
                      >
                        <li>
                          <Link href="/materials" className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-accent hover:bg-white/5">
                            <span>All Stone Materials</span>
                            <ArrowRight className="size-3.5" />
                          </Link>
                        </li>
                        {materials.map((material) => (
                          <li key={material.slug}>
                            <Link
                              href={`/materials/${material.slug}` as Route}
                              className="block px-4 py-2.5 text-xs text-ivory/80 hover:bg-white/10 hover:text-white transition-colors"
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

          <div className="hidden items-center gap-4 lg:flex">
            <Link href={"/search" as Route} aria-label="Search" className="grid size-10 place-items-center border border-white/15 text-ivory/70 transition hover:border-accent hover:text-accent">
              <Search className="size-4" />
            </Link>
            <Link
              href={quoteUrl as Route}
              className="flex min-h-11 items-center bg-accent px-6 text-[12px] font-bold uppercase tracking-[0.14em] text-charcoal shadow-lg shadow-accent/20 transition-all hover:bg-gold-soft hover:scale-[1.02]"
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

      {!isHome && <div aria-hidden="true" className="h-20 bg-charcoal lg:h-[7rem]" />}

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

