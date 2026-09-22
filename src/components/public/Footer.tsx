import Link from "next/link";
import type { Route } from "next";
import { Globe, Mail, MapPin, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { getPublicLayoutData } from "@/lib/public/data";
import { CloudinaryImage } from "@/components/ui/cloudinary-image";
import { NewsletterForm } from "./newsletter-form";

const FOOTER_GROUPS = [
  { title: "Explore", location: "footer-1" },
  { title: "Company", location: "footer-2" },
  { title: "Resources", location: "footer-3" },
] as const;

const telHref = (value: string) => `tel:${value.replace(/[^+\d]/g, "")}`;
const waHref = (number: string) => (/^[1-9]\d{7,14}$/.test(number) ? `https://wa.me/${number}` : undefined);

export async function Footer() {
  const { settings, navigation, copy } = await getPublicLayoutData();
  const year = new Date().getUTCFullYear();

  const groups = FOOTER_GROUPS.map((group) => ({
    title: group.title,
    links: navigation
      .filter((item) => item.location === group.location)
      .sort((a, b) => a.sortOrder - b.sortOrder),
  })).filter((group) => group.links.length > 0);

  const phone = settings.phone[0];
  const email = settings.email[0];
  const whatsapp = settings.whatsappNumber ? waHref(settings.whatsappNumber) : undefined;
  const address = settings.addresses[0];
  const brandLogo = settings.logoLight ?? settings.logo;

  return (
    <footer className="border-t border-white/10 bg-[#060606] text-ivory stone-vein">
      <div className="page-shell grid gap-12 py-20 lg:grid-cols-4 lg:gap-10">
        {/* Column 1 — Brand Emblem & Blurb */}
        <div className="grid content-start gap-6">
          <Link href="/" aria-label={settings.siteName} className="flex items-center gap-3">
            {brandLogo ? (
              <CloudinaryImage media={brandLogo} sizes="180px" className="h-10 w-auto max-w-[180px] object-contain" />
            ) : (
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded border border-accent/40 bg-accent/10 font-heading font-bold text-accent">A</span>
                <div className="flex flex-col">
                  <span className="font-heading text-xl font-bold tracking-widest uppercase text-white leading-none">{settings.siteName}</span>
                  <span className="text-[9px] uppercase tracking-[0.25em] text-accent mt-0.5">Premium Stone Supplier</span>
                </div>
              </div>
            )}
          </Link>
          <p className="max-w-xs text-xs leading-relaxed text-ivory/65">
            {copy.footerBlurb || "Leading Pakistani supplier and exporter of natural marble, granite, onyx, and travertine slabs and custom-cut architectural tiles."}
          </p>

          <div className="flex flex-wrap gap-2.5 pt-1">
            {settings.socialLinks.length > 0 ? (
              settings.socialLinks.map((link) => (
                <a
                  key={link.platform + link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.platform}
                  className="grid size-10 place-items-center rounded border border-white/15 bg-white/5 text-ivory/70 transition-colors hover:border-accent hover:text-accent hover:bg-accent/10"
                >
                  <Globe className="size-4" aria-hidden="true" />
                </a>
              ))
            ) : (
              <a
                href={whatsapp ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded border border-accent/40 bg-accent/10 px-4 py-2 text-xs font-semibold text-accent hover:bg-accent hover:text-charcoal transition-colors"
              >
                <MessageCircle className="size-4" />
                <span>Contact via WhatsApp</span>
              </a>
            )}
          </div>
        </div>

        {/* Columns 2-3 — Sitemap Navigation */}
        <div className="grid gap-4 lg:col-span-2 lg:grid-cols-3 lg:gap-8">
          <div className="lg:hidden">
            {groups.map((group) => (
              <details key={group.title} className="group border-b border-white/10">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between py-3 text-xs font-bold uppercase tracking-[0.16em] text-accent [&::-webkit-details-marker]:hidden">
                  {group.title}
                  <span aria-hidden="true" className="text-lg leading-none transition-transform group-open:rotate-45">+</span>
                </summary>
                <ul className="grid gap-2.5 pb-4">
                  {group.links.map((link) => (
                    <li key={link.id}>
                      <Link href={link.url as Route} target={link.openInNewTab ? "_blank" : undefined} className="text-xs text-ivory/70 hover:text-white transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
          {groups.map((group) => (
            <nav key={group.title} aria-label={group.title} className="hidden lg:block">
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-accent">{group.title}</p>
              <ul className="grid gap-3">
                {group.links.map((link) => (
                  <li key={link.id}>
                    <Link href={link.url as Route} target={link.openInNewTab ? "_blank" : undefined} className="text-xs text-ivory/70 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Column 4 — Contact Details & Newsletter */}
        <div className="grid content-start gap-6">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-accent">Headquarters & Supply</p>
            <ul className="grid gap-3.5 text-xs text-ivory/75">
              {phone && (
                <li className="flex items-center gap-3">
                  <Phone className="size-4 shrink-0 text-accent" aria-hidden="true" />
                  <a href={telHref(phone)} className="hover:text-white transition-colors">{phone}</a>
                </li>
              )}
              {whatsapp && (
                <li className="flex items-center gap-3">
                  <MessageCircle className="size-4 shrink-0 text-accent" aria-hidden="true" />
                  <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">WhatsApp Support</a>
                </li>
              )}
              {email && (
                <li className="flex items-center gap-3">
                  <Mail className="size-4 shrink-0 text-accent" aria-hidden="true" />
                  <a href={`mailto:${email}`} className="hover:text-white transition-colors">{email}</a>
                </li>
              )}
              {address && (
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                  <span>{address.line1}, {address.city}, {address.country}</span>
                </li>
              )}
            </ul>
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-accent">Catalogue Updates</p>
            <NewsletterForm />
          </div>
        </div>
      </div>

      {/* Bottom Legal & Payment Icons */}
      <div className="border-t border-white/10 bg-black/80 py-6">
        <div className="page-shell flex flex-col gap-4 text-xs text-ivory/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {settings.siteName}. All Rights Reserved. Luxury Natural Stone Supplier.</p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-ivory/60">
              <ShieldCheck className="size-4 text-accent" />
              <span>Verified Stone Exporter</span>
            </div>
            <nav aria-label="Legal" className="flex gap-4">
              <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/return-policy" className="hover:text-white transition-colors">Return Policy</Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}

