import Link from "next/link";
import type { Route } from "next";
import { Globe, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
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

/** Server Component: reads settings + footer nav from the resilient layout data (never empty). */
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
    <footer className="bg-charcoal text-ivory">
      <div className="page-shell grid gap-12 py-16 lg:grid-cols-4 lg:gap-8">
        {/* Column 1 — brand */}
        <div className="grid content-start gap-5">
          <Link href="/" aria-label={settings.siteName} className="flex items-center">
            {brandLogo ? (
              <CloudinaryImage media={brandLogo} sizes="180px" className="h-9 w-auto max-w-[180px] object-contain" />
            ) : (
              <span className="font-heading text-2xl leading-none">{settings.siteName}</span>
            )}
          </Link>
          <p className="max-w-xs text-sm leading-7 text-ivory/60">{copy.footerBlurb}</p>
          {settings.socialLinks.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {settings.socialLinks.map((link) => (
                <li key={link.platform + link.url}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.platform}
                    className="grid size-11 place-items-center border border-white/15 text-ivory/70 transition-colors hover:border-white/40 hover:text-ivory"
                  >
                    <Globe className="size-4" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Columns 2-4 — nav. Accordions on mobile, plain columns on desktop. */}
        <div className="grid gap-2 lg:col-span-2 lg:grid-cols-3 lg:gap-8">
          {/* mobile: <details> accordions */}
          <div className="lg:hidden">
            {groups.map((group) => (
              <details key={group.title} className="group border-b border-white/10">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between py-3 text-xs font-semibold uppercase tracking-[0.16em] text-ivory/55 [&::-webkit-details-marker]:hidden">
                  {group.title}
                  <span aria-hidden="true" className="text-lg leading-none transition-transform group-open:rotate-45">+</span>
                </summary>
                <ul className="grid gap-2 pb-4">
                  {group.links.map((link) => (
                    <li key={link.id}>
                      <Link href={link.url as Route} target={link.openInNewTab ? "_blank" : undefined} className="text-sm text-ivory/70 hover:text-ivory">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
          {/* desktop: static columns */}
          {groups.map((group) => (
            <nav key={group.title} aria-label={group.title} className="hidden lg:block">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-ivory/55">{group.title}</p>
              <ul className="grid gap-2.5">
                {group.links.map((link) => (
                  <li key={link.id}>
                    <Link href={link.url as Route} target={link.openInNewTab ? "_blank" : undefined} className="text-sm text-ivory/70 hover:text-ivory">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Column 4 — contact + newsletter */}
        <div className="grid content-start gap-6">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-ivory/55">Contact</p>
            <ul className="grid gap-3 text-sm text-ivory/70">
              {phone && (
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <a href={telHref(phone)} className="hover:text-ivory">{phone}</a>
                </li>
              )}
              {whatsapp && (
                <li className="flex items-start gap-3">
                  <MessageCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-ivory">WhatsApp</a>
                </li>
              )}
              {email && (
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <a href={`mailto:${email}`} className="hover:text-ivory">{email}</a>
                </li>
              )}
              {address && (
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span>{address.line1}, {address.city}, {address.country}</span>
                </li>
              )}
            </ul>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-ivory/55">Newsletter</p>
            <NewsletterForm />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="page-shell flex flex-col gap-3 py-6 text-xs text-ivory/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {settings.siteName}. {copy.copyright}</p>
          <nav aria-label="Legal" className="flex gap-4">
            <Link href="/privacy-policy" className="hover:text-ivory/80">Privacy</Link>
            <Link href="/terms" className="hover:text-ivory/80">Terms</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
