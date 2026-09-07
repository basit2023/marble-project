import type { PublicCategory, PublicNavigation, PublicSettings } from "@/types/public-data";
import type { PublicCopy } from "@/lib/public/copy-schema";

/**
 * Hardcoded fallbacks for the site chrome. Used whenever a MongoDB read for the
 * header/footer returns nothing or fails, so the public site always renders a
 * usable navigation instead of an empty shell.
 */

export const DEFAULT_SETTINGS: PublicSettings = {
  siteName: "Marble & Stone",
  tagline: "Natural stone for considered spaces",
  logo: undefined,
  logoLight: undefined,
  phone: ["+92 300 000 0000"],
  whatsappNumber: "923000000000",
  email: ["hello@marblestone.example"],
  addresses: [
    { label: "Head office", line1: "Stone District", city: "Lahore", country: "Pakistan" },
  ],
  businessHours: "Mon–Sat, 9:00–18:00 PKT",
  socialLinks: [],
  whatsappDefaultMessage: "Hello, I would like to ask about your natural stone collection.",
  announcementBar: { isActive: false },
  defaultSeo: { keywords: [], noIndex: false },
};

const headerLink = (label: string, url: string, sortOrder: number): PublicNavigation => ({
  id: `default-header-${sortOrder}`, label, url, openInNewTab: false, location: "header", sortOrder,
});
const footerLink = (label: string, url: string, location: string, sortOrder: number): PublicNavigation => ({
  id: `default-${location}-${sortOrder}`, label, url, openInNewTab: false, location, sortOrder,
});

export const DEFAULT_NAV: PublicNavigation[] = [
  headerLink("Materials", "/materials", 0),
  headerLink("Projects", "/projects", 1),
  headerLink("Exhibitions", "/exhibitions", 2),
  headerLink("About", "/about", 3),
  headerLink("Blog", "/blog", 4),
  headerLink("Contact", "/contact", 5),

  footerLink("Materials", "/materials", "footer-1", 0),
  footerLink("Projects", "/projects", "footer-1", 1),
  footerLink("Exhibitions", "/exhibitions", "footer-1", 2),
  footerLink("Export", "/export", "footer-1", 3),

  footerLink("About", "/about", "footer-2", 0),
  footerLink("Blog", "/blog", "footer-2", 1),
  footerLink("FAQ", "/faq", "footer-2", 2),
  footerLink("Contact", "/contact", "footer-2", 3),

  footerLink("Request a quote", "/quote", "footer-3", 0),
  footerLink("Search", "/search", "footer-3", 1),
  footerLink("Privacy policy", "/privacy-policy", "footer-3", 2),
  footerLink("Terms", "/terms", "footer-3", 3),
];

export const DEFAULT_CATEGORIES: PublicCategory[] = [
  { id: "default-marble", name: "Marble", slug: "marble" },
  { id: "default-granite", name: "Granite", slug: "granite" },
  { id: "default-onyx", name: "Onyx", slug: "onyx" },
  { id: "default-travertine", name: "Travertine", slug: "travertine" },
  { id: "default-limestone", name: "Limestone", slug: "limestone" },
  { id: "default-quartzite", name: "Quartzite", slug: "quartzite" },
];

export const DEFAULT_COPY: PublicCopy = {
  footerBlurb: "Natural stone selected, finished and supplied for considered spaces around the world.",
  copyright: "All rights reserved.",
  labels: {
    openMenu: "Open menu", closeMenu: "Close menu", materials: "Materials", getQuote: "Get a quote",
    getQuoteUrl: "/quote", phone: "Call us", dismissAnnouncement: "Dismiss announcement",
    scroll: "Scroll to explore", previousSlide: "Previous slide", nextSlide: "Next slide", slide: "Slide",
    previousImage: "Previous image", nextImage: "Next image", closeLightbox: "Close gallery",
    galleryImage: "Gallery image", viewAllMaterials: "View all materials", featuredProducts: "Featured products",
    previousProducts: "Previous products", nextProducts: "Next products", upcoming: "Upcoming", past: "Past",
    stars: "out of 5 stars", previousTestimonial: "Previous testimonial", nextTestimonial: "Next testimonial",
    openQuestion: "Open answer", readArticle: "Read article", newsletter: "Newsletter",
    newsletterIntro: "Receive occasional material, project and exhibition updates.", email: "Email address",
    subscribe: "Subscribe", subscribing: "Subscribing…", subscribed: "Thank you for subscribing.",
    newsletterError: "Please enter a valid email address.", contact: "Contact", follow: "Follow",
    whatsapp: "Enquire on WhatsApp", breadcrumb: "Breadcrumb", home: "Home", current: "Current page",
    play: "Play", pause: "Pause", noImage: "Image unavailable", menu: "Primary navigation",
    skipToContent: "Skip to content",
  },
};
