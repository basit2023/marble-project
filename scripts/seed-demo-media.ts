import { existsSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { loadEnvConfig } from "@next/env";
import { z } from "zod";
import { Types } from "mongoose";
import { slugify } from "../src/lib/utils";

loadEnvConfig(process.cwd());

const uploadResultSchema = z.object({
  public_id: z.string(),
  secure_url: z.url(),
  format: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  bytes: z.number().int().positive(),
  version: z.number().int().positive().optional(),
});

const seo = (title: string, description: string) => ({
  metaTitle: title.slice(0, 60),
  metaDescription: description.slice(0, 160),
  keywords: title.toLowerCase().split(/\s+/).filter(Boolean),
  noIndex: false,
});

const assets = [
  { key: "demo-white-marble", file: "demo-white-marble.png", title: "Ziarat White Marble Slab", folder: "products", usageContext: "product", altText: "Polished white marble slab with soft grey veining in a showroom" },
  { key: "demo-black-granite", file: "demo-black-granite.png", title: "Premium Black Granite Slab", folder: "products", usageContext: "product", altText: "Polished black granite slab with fine silver mineral flecks" },
  { key: "demo-honey-onyx", file: "demo-honey-onyx.png", title: "Honey Onyx Translucent Slab", folder: "products", usageContext: "product", altText: "Backlit honey onyx slab with warm amber veining" },
  { key: "ai-green-quartzite", file: "ai-green-quartzite.png", title: "Emerald Green Quartzite Slab", folder: "products", usageContext: "product", altText: "Luxury emerald green quartzite slab with deep exotic veining" },
  { key: "ai-limestone-showroom", file: "ai-limestone-showroom.png", title: "Crema Limestone Architectural Slab", folder: "products", usageContext: "product", altText: "Refined beige crema limestone slab in showroom" },
  { key: "ai-marble-kitchen", file: "ai-marble-kitchen.png", title: "Imperial Marble Kitchen Countertop", folder: "products", usageContext: "product", altText: "Luxury kitchen island with polished white marble countertop" },
  { key: "ai-marble-quarry", file: "ai-marble-quarry.png", title: "Raw Mountain Marble Quarry", folder: "home", usageContext: "hero", altText: "Spectacular mountain marble quarry with raw stone blocks" },
  { key: "ai-onyx-bathroom", file: "ai-onyx-bathroom.png", title: "Translucent Amber Onyx Wall Panel", folder: "products", usageContext: "product", altText: "Backlit luxury onyx bathroom wall cladding" },
  { key: "ai-sandstone-display", file: "ai-sandstone-display.png", title: "Desert Gold Sandstone Tile", folder: "products", usageContext: "product", altText: "Warm desert gold sandstone architectural paving display" },
  { key: "ai-slate-display", file: "ai-slate-display.png", title: "Charcoal Slate Wall Cladding", folder: "products", usageContext: "product", altText: "Textured charcoal graphite slate panel display" },
  { key: "ai-stone-facade", file: "ai-stone-facade.png", title: "Villa Exterior Stone Facade", folder: "projects", usageContext: "project", altText: "Modern villa exterior with natural stone wall cladding facade" },
  { key: "ai-travertine-showroom", file: "ai-travertine-showroom.png", title: "Silver Travertine Flooring Slab", folder: "products", usageContext: "product", altText: "Honed silver vein travertine slab display" },
  { key: "demo-villa-project", file: "demo-villa-project.png", title: "Modern Villa Stone Interior", folder: "projects", usageContext: "project", altText: "Modern villa interior with marble flooring and stone cladding" },
  { key: "demo-export-container", file: "demo-export-container.png", title: "Export Container Crate Freight", folder: "home", usageContext: "hero", altText: "Natural stone slabs packed on A-frames beside an export shipping container" },
  { key: "demo-exhibition-booth", file: "demo-exhibition-booth.png", title: "Natural Stone International Exhibition", folder: "exhibitions", usageContext: "exhibition", altText: "Elegant exhibition booth displaying marble, granite and onyx slabs" },
  { key: "demo-factory-polishing", file: "demo-factory-polishing.png", title: "Marble Slab Processing Facility", folder: "brand", usageContext: "other", altText: "Marble slab polishing line inside a stone processing facility" },
] as const;

async function cloudinaryTimestamp(cloudName: string) {
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "HEAD", cache: "no-store" }).catch(() => null);
  const header = response?.headers.get("date");
  const parsed = header ? Date.parse(header) : Number.NaN;
  return Number.isFinite(parsed) ? Math.floor(parsed / 1000) : Math.floor(Date.now() / 1000);
}

async function main() {
  const { connectDB } = await import("../src/lib/db");
  const { cloudinary } = await import("../src/lib/cloudinary");
  const { env } = await import("../src/lib/env");
  const { generateBlurDataUrl } = await import("../src/lib/media/cloud");
  const { hashPassword } = await import("../src/lib/password");
  const { User, Media, Category, Product, Project, Exhibition, BlogPost, Page, HomeSection, NavigationItem } = await import("../src/models");
  const db = await connectDB();
  try {
    let user = await User.findOne({ role: "superadmin", isDeleted: false }) ?? await User.findOne({ isDeleted: false });
    if (!user) {
      user = await User.create({
        name: "Demo Media Seeder",
        email: "seed-demo-media@example.invalid",
        passwordHash: await hashPassword(randomUUID() + randomUUID()),
        role: "editor",
        forcePasswordChange: true,
        isActive: true,
        isDeleted: false,
        sortOrder: 0,
        createdBy: null,
        updatedBy: null,
      });
    }
    const uploadTimestamp = await cloudinaryTimestamp(env.CLOUDINARY_CLOUD_NAME);
    const mediaByKey = new Map<string, Types.ObjectId>();
    for (const [sortOrder, asset] of assets.entries()) {
      const publicId = `marble-site/${asset.folder}/${asset.key}`;
      let existing = await Media.findOne({ cloudinaryPublicId: publicId, isDeleted: false });
      if (!existing) existing = await Media.findOne({ title: asset.title, isDeleted: false });
      if (existing) {
        mediaByKey.set(asset.key, existing._id);
        continue;
      }
      const assetPath = path.join(process.cwd(), "seed-assets", "generated", asset.file);
      if (!existsSync(assetPath)) throw new Error(`Missing generated asset: ${assetPath}`);
      const raw = await cloudinary.uploader.upload(assetPath, {
        folder: `marble-site/${asset.folder}`,
        public_id: asset.key,
        overwrite: true,
        resource_type: "image",
        timestamp: uploadTimestamp,
        transformation: [{ crop: "limit", width: 2560, flags: "strip_profile" }],
      });
      const upload = uploadResultSchema.parse(raw);
      const blurDataUrl = upload.version ? await generateBlurDataUrl(upload.public_id, upload.version) : undefined;
      const media = await Media.create({
        cloudinaryPublicId: upload.public_id,
        secureUrl: upload.secure_url,
        format: upload.format,
        width: upload.width,
        height: upload.height,
        bytes: upload.bytes,
        version: upload.version,
        blurDataUrl,
        altText: asset.altText,
        caption: asset.title,
        title: asset.title,
        folder: `marble-site/${asset.folder}`,
        tags: ["demo", asset.folder],
        usageContext: asset.usageContext,
        uploadedBy: user._id,
        createdBy: user._id,
        updatedBy: user._id,
        isActive: true,
        isDeleted: false,
        sortOrder,
      });
      mediaByKey.set(asset.key, media._id);
    }

    const ensureCategory = async (name: string, imageKey: string, sortOrder: number) => {
      const slug = slugify(name);
      let category = await Category.findOne({ slug, isDeleted: false });
      if (!category) {
        category = await Category.create({
          name,
          slug,
          description: `Explore active ${name.toLowerCase()} slabs, tiles and custom-cut surfaces for local and export projects.`,
          shortDescription: `${name} slabs, tiles and custom cuts`,
          coverImage: mediaByKey.get(imageKey),
          seo: seo(`${name} Stone`, `Browse ${name.toLowerCase()} slabs, tiles and custom cuts for projects worldwide.`),
          isFeatured: true,
          showInMenu: true,
          showOnHomepage: true,
          createdBy: user._id,
          updatedBy: user._id,
          sortOrder,
        });
      } else {
        category.set({
          coverImage: mediaByKey.get(imageKey),
          shortDescription: category.shortDescription || `${name} slabs, tiles and custom cuts`,
          isActive: true,
          isFeatured: true,
          showInMenu: true,
          showOnHomepage: true,
          seo: category.seo?.noIndex === undefined ? seo(`${name} Stone`, `Browse ${name.toLowerCase()} slabs, tiles and custom cuts for projects.`) : category.seo,
          updatedBy: user._id,
        });
        await category.save();
      }
      return category;
    };

    const marble = await ensureCategory("Marble", "demo-white-marble", 0);
    const granite = await ensureCategory("Granite", "demo-black-granite", 1);
    const onyx = await ensureCategory("Onyx", "demo-honey-onyx", 2);
    const quartzite = await ensureCategory("Quartzite", "ai-green-quartzite", 3);
    const limestone = await ensureCategory("Limestone", "ai-limestone-showroom", 4);
    const travertine = await ensureCategory("Travertine", "ai-travertine-showroom", 5);

    const ensureProduct = async (name: string, category: typeof marble, imageKey: string, colourFamily: "White" | "Black" | "Gold" | "Green" | "Beige" | "Grey", priceMin: number, priceMax: number, sortOrder: number) => {
      const slug = slugify(name);
      const image = mediaByKey.get(imageKey);
      const doc = await Product.findOne({ slug, isDeleted: false });
      const payload = {
        name,
        slug,
        category: category._id,
        description: `${name} is a premium luxury stone available in slabs and custom cut-to-size formats for architectural countertops, flooring, and wall cladding.`,
        origin: "Pakistan",
        colourFamily,
        finishes: ["Polished", "Honed", "Leathered"],
        availableFormats: ["Slab", "Tile", "Countertop", "Custom Cut"],
        thicknessOptions: ["18 mm", "20 mm", "30 mm"],
        sizeOptions: ["Random slabs", "600 x 600 mm", "Custom cut"],
        applications: ["Flooring", "Wall Cladding", "Countertop", "Kitchen", "Bathroom"],
        technicalSpecs: { density: 2.71, waterAbsorption: 0.15, compressiveStrength: 135, flexuralStrength: 16, abrasionResistance: "Suitable for luxury residential and high-traffic commercial projects" },
        priceRange: { min: priceMin, max: priceMax, currency: "PKR", unit: "sqft" },
        isPriceVisible: true,
        images: image ? [image] : [],
        primaryImage: image,
        tags: ["demo", category.slug],
        isFeatured: true,
        isExportAvailable: true,
        stockStatus: "In Stock",
        seo: seo(name, `${name} slabs, tiles and custom cuts for homes, projects and export buyers.`),
        isActive: true,
        isDeleted: false,
        sortOrder,
        createdBy: user._id,
        updatedBy: user._id,
      };
      if (!doc) return Product.create(payload);
      doc.set({ ...payload, createdBy: doc.createdBy ?? user._id });
      return doc.save();
    };

    const whiteMarble = await ensureProduct("Ziarat White Marble", marble, "demo-white-marble", "White", 2200, 4800, 0);
    const blackGranite = await ensureProduct("Premium Black Granite", granite, "demo-black-granite", "Black", 1800, 3900, 1);
    const honeyOnyx = await ensureProduct("Honey Translucent Onyx", onyx, "demo-honey-onyx", "Gold", 4500, 9500, 2);
    await ensureProduct("Emerald Green Quartzite", quartzite, "ai-green-quartzite", "Green", 3800, 7200, 3);
    await ensureProduct("Classic Crema Limestone", limestone, "ai-limestone-showroom", "Beige", 1950, 3600, 4);
    await ensureProduct("Silver Vein Travertine", travertine, "ai-travertine-showroom", "Grey", 2400, 5100, 5);
    await ensureProduct("Imperial Kitchen Marble", marble, "ai-marble-kitchen", "White", 2900, 5800, 6);
    await ensureProduct("Royal Amber Onyx Panel", onyx, "ai-onyx-bathroom", "Gold", 5200, 11000, 7);

    const projectSlug = "modern-villa-stone-interior-demo";
    const projectImage = mediaByKey.get("demo-villa-project");
    const projectPayload = {
      title: "Modern Villa Stone Interior Demo",
      slug: projectSlug,
      client: "Private residence",
      location: "Islamabad",
      country: "Pakistan",
      projectType: "Residential",
      year: 2026,
      description: "<p>A demo project showing how marble floors and natural stone wall cladding render across public project pages.</p>",
      materialsUsed: [whiteMarble._id, blackGranite._id, honeyOnyx._id],
      finishesUsed: ["Polished", "Honed"],
      coverImage: projectImage,
      gallery: projectImage ? [projectImage] : [],
      isFeatured: true,
      seo: seo("Modern Villa Stone Interior", "Demo residential natural stone project for testing the public portfolio."),
      isActive: true,
      isDeleted: false,
      sortOrder: 0,
      createdBy: user._id,
      updatedBy: user._id,
    };
    const project = await Project.findOne({ slug: projectSlug, isDeleted: false });
    if (project) {
      project.set({ ...projectPayload, createdBy: project.createdBy ?? user._id });
      await project.save();
    } else {
      await Project.create(projectPayload);
    }

    const exhibitionImage = mediaByKey.get("demo-exhibition-booth");
    const exhibitionPayload = {
      name: "Karachi Stone Expo Demo",
      slug: "karachi-stone-expo-demo",
      venue: "Expo Centre",
      city: "Karachi",
      country: "Pakistan",
      startDate: new Date("2026-12-10T00:00:00.000Z"),
      endDate: new Date("2026-12-12T00:00:00.000Z"),
      description: "<p>A demo exhibition record for testing upcoming event layouts and gallery pages.</p>",
      coverImage: exhibitionImage,
      gallery: exhibitionImage ? [exhibitionImage] : [],
      seo: seo("Karachi Stone Expo Demo", "Demo exhibition page for natural stone event testing."),
      isActive: true,
      isDeleted: false,
      sortOrder: 0,
      createdBy: user._id,
      updatedBy: user._id,
    };
    const exhibition = await Exhibition.findOne({ slug: "karachi-stone-expo-demo", isDeleted: false });
    if (exhibition) {
      exhibition.set({ ...exhibitionPayload, createdBy: exhibition.createdBy ?? user._id });
      await exhibition.save();
    } else {
      await Exhibition.create(exhibitionPayload);
    }

    const blogPayload = {
      title: "How to Choose Marble for a Home Demo",
      slug: "how-to-choose-marble-for-a-home-demo",
      excerpt: "A seeded article for testing blog listings, reading progress and related posts.",
      content: "<h2>Start With Application</h2><p>Flooring, kitchens and wall cladding each need a different finish and thickness.</p><h2>Check Finish And Maintenance</h2><p>Polished marble gives a refined look while honed surfaces reduce glare.</p>",
      coverImage: mediaByKey.get("demo-factory-polishing"),
      author: user._id,
      category: "Buying Guide",
      tags: ["demo", "marble", "buying guide"],
      readTimeMinutes: 1,
      publishedAt: new Date("2026-09-01T00:00:00.000Z"),
      isPublished: true,
      viewCount: 0,
      seo: seo("How to Choose Marble", "Demo marble buying guide for testing blog article pages."),
      isActive: true,
      isDeleted: false,
      sortOrder: 0,
      createdBy: user._id,
      updatedBy: user._id,
    };
    const blogPost = await BlogPost.findOne({ slug: "how-to-choose-marble-for-a-home-demo", isDeleted: false });
    if (blogPost) {
      blogPost.set({ ...blogPayload, createdBy: blogPost.createdBy ?? user._id });
      await blogPost.save();
    } else {
      await BlogPost.create(blogPayload);
    }

    const pageRecords = [
      ["about", "About", "Our story, facility, quarries, team and certifications.", "demo-factory-polishing"],
      ["export", "Export", "Container loading, MOQ guidance, documentation and destination support.", "demo-export-container"],
      ["contact", "Contact", "Locations, business hours and enquiry form.", "demo-villa-project"],
      ["privacy-policy", "Privacy Policy", "How enquiry and website data is handled.", "demo-factory-polishing"],
      ["terms", "Terms", "Terms for catalogue information, enquiries and project discussions.", "demo-factory-polishing"],
      ["return-policy", "Return Policy", "Guidance for custom stone orders, samples and claims.", "demo-factory-polishing"],
    ] as const;
    for (const [slug, title, excerpt, imageKey] of pageRecords) {
      const pagePayload = {
        title,
        slug,
        kind: slug,
        excerpt,
        content: `<p>${excerpt}</p>`,
        coverImage: mediaByKey.get(imageKey),
        gallery: [],
        sections: [
          { key: "story", title: `${title} details`, body: `<p>${excerpt}</p>`, items: ["Demo content is editable from MongoDB.", "Inactive records are excluded from public pages."], image: mediaByKey.get(imageKey), sortOrder: 0, isActive: true },
        ],
        seo: seo(title, excerpt),
        isActive: true,
        isDeleted: false,
        sortOrder: 0,
        createdBy: user._id,
        updatedBy: user._id,
      };
      const page = await Page.findOne({ slug, isDeleted: false });
      if (page) {
        page.set({ ...pagePayload, createdBy: page.createdBy ?? user._id });
        await page.save();
      } else {
        await Page.create(pagePayload);
      }
    }

    const homeSections = [
      { sectionKey: "hero", heading: "Pakistani natural stone for refined spaces", subheading: "Marble, granite, onyx, and quartzite slabs prepared for luxury residential, commercial and export projects.", eyebrowLabel: "PREMIUM STONE SUPPLIER WORLDWIDE", backgroundImage: mediaByKey.get("demo-white-marble"), ctaLabel: "Explore Materials", ctaUrl: "/materials", sortOrder: 0, items: [
        { key: "quarry-slide", title: "Raw Mountain Marble Quarry", body: "Direct quarry extraction and precision gang-saw slab processing for world markets.", image: mediaByKey.get("ai-marble-quarry"), ctaLabel: "View Quarry Slabs", ctaUrl: "/materials/marble", data: { secondaryCtaLabel: "Request Quote", secondaryCtaUrl: "/quote" }, isActive: true, sortOrder: 0 },
        { key: "marble-slide", title: "Ziarat White Marble", body: "Refined pristine white marble for architectural flooring, vanity tops and bookmatched cladding.", image: mediaByKey.get("demo-white-marble"), ctaLabel: "View Marble", ctaUrl: "/materials/marble", data: { secondaryCtaLabel: "Request Quote", secondaryCtaUrl: "/quote" }, isActive: true, sortOrder: 1 },
        { key: "quartzite-slide", title: "Emerald Green Quartzite", body: "Exotic green quartzite with deep crystalline veining for high-end statement islands.", image: mediaByKey.get("ai-green-quartzite"), ctaLabel: "View Quartzite", ctaUrl: "/materials/quartzite", data: { secondaryCtaLabel: "Request Quote", secondaryCtaUrl: "/quote" }, isActive: true, sortOrder: 2 },
        { key: "onyx-slide", title: "Translucent Honey Onyx", body: "Warm backlit onyx for feature walls, bar fronts, and illuminated luxury interiors.", image: mediaByKey.get("demo-honey-onyx"), ctaLabel: "View Onyx", ctaUrl: "/materials/onyx", data: { secondaryCtaLabel: "Request Quote", secondaryCtaUrl: "/quote" }, isActive: true, sortOrder: 3 },
      ] },
      { sectionKey: "stats", heading: "Stone supplied for demanding projects", sortOrder: 1, items: [
        { key: "colours", title: "Stone colours", value: "40", data: { suffix: "+" }, isActive: true, sortOrder: 0 },
        { key: "years", title: "Years experience", value: "15", data: { suffix: "+" }, isActive: true, sortOrder: 1 },
        { key: "countries", title: "Export countries", value: "12", data: { suffix: "+" }, isActive: true, sortOrder: 2 },
        { key: "projects", title: "Projects completed", value: "250", data: { suffix: "+" }, isActive: true, sortOrder: 3 },
      ] },
      { sectionKey: "materials", heading: "Shop by Material", subheading: "Browse active material categories with real Cloudinary cover images.", ctaLabel: "View all materials", ctaUrl: "/materials", sortOrder: 2 },
      { sectionKey: "whyUs", heading: "Why Choose Us", subheading: "Catalog-grade selection, export packing and project-focused cutting support.", sortOrder: 3, items: [
        { key: "selection", title: "Curated material range", body: "Active marble, granite and onyx records are managed directly from MongoDB.", iconKey: "layers", data: { seed: true }, isActive: true, sortOrder: 0 },
        { key: "quality", title: "Image-led catalogue", body: "Every public image is a Media document with required alt text and visibility control.", iconKey: "quality", data: { seed: true }, isActive: true, sortOrder: 1 },
        { key: "export", title: "Export ready", body: "Container loading, documentation and bulk enquiry flows are present for international buyers.", iconKey: "globe", data: { seed: true }, isActive: true, sortOrder: 2 },
        { key: "precision", title: "Custom cuts", body: "Quote requests capture material, quantity, unit, timeline and drawing upload.", iconKey: "precision", data: { seed: true }, isActive: true, sortOrder: 3 },
      ] },
      { sectionKey: "featuredProducts", heading: "Featured Products", subheading: "A dark catalog carousel inspired by premium stone storefronts.", sortOrder: 6 },
      { sectionKey: "projects", heading: "Installed Projects", subheading: "Featured project cards from MongoDB.", sortOrder: 8 },
      { sectionKey: "export", heading: "Export Ready", bodyText: "Container loading, documentation and project supply support for international buyers.", backgroundImage: mediaByKey.get("demo-export-container"), ctaLabel: "Send export enquiry", ctaUrl: "/export", sortOrder: 9, items: [
        { key: "containers", title: "Container loading support", data: { seed: true }, isActive: true, sortOrder: 0 },
        { key: "packing", title: "Slab A-frame packing", data: { seed: true }, isActive: true, sortOrder: 1 },
        { key: "docs", title: "Export documentation handled", data: { seed: true }, isActive: true, sortOrder: 2 },
      ] },
      { sectionKey: "blog", heading: "Stone Journal", subheading: "Latest published posts.", sortOrder: 13 },
      { sectionKey: "cta", heading: "Plan a stone order", subheading: "Send a quote request with material, quantity and timeline.", ctaLabel: "Request a quote", ctaUrl: "/quote", sortOrder: 14 },
    ];
    for (const section of homeSections) {
      const sectionPayload = {
        ...section,
        items: "items" in section ? section.items : [],
        isActive: true,
        isDeleted: false,
        createdBy: user._id,
        updatedBy: user._id,
      };
      const homeSection = await HomeSection.findOne({ sectionKey: section.sectionKey, isDeleted: false });
      if (homeSection) {
        homeSection.set({ ...sectionPayload, createdBy: homeSection.createdBy ?? user._id });
        await homeSection.save();
      } else {
        await HomeSection.create(sectionPayload);
      }
    }

    const nav = [
      ["Materials", "/materials", 0],
      ["Projects", "/projects", 1],
      ["Export", "/export", 2],
      ["Blog", "/blog", 3],
      ["Contact", "/contact", 4],
    ] as const;
    for (const [label, url, sortOrder] of nav) {
      const navPayload = {
        label,
        url,
        location: "header",
        openInNewTab: false,
        isActive: true,
        isDeleted: false,
        sortOrder,
        createdBy: user._id,
        updatedBy: user._id,
      };
      const item = await NavigationItem.findOne({ label, location: "header", isDeleted: false });
      if (item) {
        item.set({ ...navPayload, createdBy: item.createdBy ?? user._id });
        await item.save();
      } else {
        await NavigationItem.create(navPayload);
      }
    }

    await Promise.all([Media.createIndexes(), Category.createIndexes(), Product.createIndexes(), Project.createIndexes(), BlogPost.createIndexes(), Page.createIndexes()]);
    console.info(`Demo media seed complete: ${assets.length} media assets wired to categories, products, pages, homepage sections, project, exhibition and blog.`);
  } finally {
    await db.disconnect();
  }
}

main().catch((error: unknown) => {
  if (error instanceof z.ZodError) {
    console.error(error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("\n"));
  } else if (error instanceof Error) {
    console.error(`${error.name}: ${error.message}`);
  } else {
    console.error(`Demo media seed failed with ${Object.prototype.toString.call(error)}.`);
    if (typeof error === "object" && error !== null) {
      const cloudinaryError = error as { message?: unknown; name?: unknown; http_code?: unknown };
      console.error(`Name: ${String(cloudinaryError.name ?? "unknown")}`);
      console.error(`HTTP: ${String(cloudinaryError.http_code ?? "unknown")}`);
      console.error(`Message: ${String(cloudinaryError.message ?? "unknown")}`);
    }
  }
  process.exitCode = 1;
});
