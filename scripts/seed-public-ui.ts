import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());
async function main() {
  const [{ connectDB }, { PublicUiContent, SiteSettings }, { env }] = await Promise.all([import("../src/lib/db"), import("../src/models"), import("../src/lib/env")]);
  const db = await connectDB();
  try {
    const existing = await PublicUiContent.findOne({ key: "public-ui" });
    if (existing) {
      if (!existing.copy.labels.getQuoteUrl) {
        existing.copy.labels.getQuoteUrl = "/contact";
        existing.updatedBy = null;
        existing.markModified("copy");
        await existing.save();
        console.info("Public UI content upgraded with missing layout fields.");
      } else console.info("Public UI content already exists; no changes made.");
    } else {
      await PublicUiContent.create({
        key: "public-ui", createdBy: null, updatedBy: null,
        copy: {
        footerBlurb: "Natural stone selected, finished and supplied for considered spaces around the world.",
        copyright: "All rights reserved.",
        labels: {
          openMenu: "Open menu", closeMenu: "Close menu", materials: "Materials", getQuote: "Get a quote",
          getQuoteUrl: "/contact",
          phone: "Call us", dismissAnnouncement: "Dismiss announcement", scroll: "Scroll to explore",
          previousSlide: "Previous slide", nextSlide: "Next slide", slide: "Slide", previousImage: "Previous image",
          nextImage: "Next image", closeLightbox: "Close gallery", galleryImage: "Gallery image",
          viewAllMaterials: "View all materials", featuredProducts: "Featured products",
          previousProducts: "Previous products", nextProducts: "Next products", upcoming: "Upcoming", past: "Past",
          stars: "out of 5 stars", previousTestimonial: "Previous testimonial", nextTestimonial: "Next testimonial",
          openQuestion: "Open answer", readArticle: "Read article", newsletter: "Newsletter",
          newsletterIntro: "Receive occasional material, project and exhibition updates.", email: "Email address",
          subscribe: "Subscribe", subscribing: "Subscribing…", subscribed: "Thank you for subscribing.",
          newsletterError: "Please enter a valid email address.", contact: "Contact", follow: "Follow",
          whatsapp: "Enquire on WhatsApp", breadcrumb: "Breadcrumb", home: "Home", current: "Current page",
          play: "Play", pause: "Pause", noImage: "Image unavailable", menu: "Primary navigation",
        },
        },
      });
      console.info("Public UI content seeded.");
    }
    if (!await SiteSettings.exists({ singletonKey: "site" })) {
      await SiteSettings.create({
        singletonKey: "site", siteName: "Stone Catalogue", tagline: "Pakistan natural stone",
        phone: [], email: [], addresses: [], socialLinks: [],
        defaultSeo: {
          metaTitle: "Pakistan Natural Stone Manufacturer & Exporter",
          metaDescription: "Discover marble, granite, onyx and natural stone for local projects and international supply.",
          keywords: ["Pakistan natural stone", "marble exporter", "granite supplier"],
          canonicalUrl: env.NEXT_PUBLIC_SITE_URL, noIndex: false,
        },
        whatsappDefaultMessage: "Hello, I would like to ask about your natural stone collection.",
        priceRange: "$$",
        maintenanceMode: false, announcementBar: { isActive: false },
        createdBy: null, updatedBy: null,
      });
      console.info("Initial site settings seeded. Update the business details in Admin > Settings.");
    }
  } finally { await db.disconnect(); }
}
main().catch(() => { console.error("Public UI seed failed. Verify environment and Atlas access."); process.exitCode = 1; });
