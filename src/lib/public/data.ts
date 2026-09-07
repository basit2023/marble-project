import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { connectDB } from "@/lib/db";
import { publicFilter } from "@/models/content-fields";
import { SiteSettings, NavigationItem, Category, HomeSection, Product, Media, Project, Exhibition, Testimonial, Faq, BlogPost, PublicUiContent } from "@/models";
import { publicCopySchema, type PublicCopy } from "./copy-schema";
import { DEFAULT_CATEGORIES, DEFAULT_COPY, DEFAULT_NAV, DEFAULT_SETTINGS } from "./defaults";
import { toMediaDTO } from "@/lib/media/service";
import type { IMedia } from "@/types/media";
import type { HomepageData, PublicCategory, PublicExhibition, PublicFaq, PublicNavigation, PublicPost, PublicProduct, PublicProject, PublicSection, PublicSettings, PublicTestimonial } from "@/types/public-data";

export interface PublicLayoutData {
  copy: PublicCopy;
  settings: PublicSettings;
  navigation: PublicNavigation[];
  categories: PublicCategory[];
}
const FALLBACK_LAYOUT: PublicLayoutData = {
  copy: DEFAULT_COPY, settings: DEFAULT_SETTINGS, navigation: DEFAULT_NAV, categories: DEFAULT_CATEGORIES,
};

type PopulatedMedia = IMedia | null | undefined;
const media = (value: PopulatedMedia) => value && value.isActive && !value.isDeleted ? toMediaDTO(value) : undefined;
const id = (value: { toString(): string }) => value.toString();
const loadPublicLayoutData = unstable_cache(async (): Promise<PublicLayoutData> => {
  await connectDB();
  const [settingsRaw, navigationRaw, categoriesRaw, copyRaw] = await Promise.all([
    SiteSettings.findOne().activeOnly().populate([
      { path: "logo", match: publicFilter }, { path: "logoLight", match: publicFilter },
      { path: "defaultSeo.ogImage", match: publicFilter },
    ]).lean(),
    NavigationItem.find().activeOnly().sort({ sortOrder: 1 }).lean(),
    Category.find({ showInMenu: true }).activeOnly().sort({ sortOrder: 1 }).populate({ path: "coverImage", match: publicFilter }).lean(),
    PublicUiContent.findOne({ key: "public-ui" }).activeOnly().lean(),
  ]);

  let copy = DEFAULT_COPY;
  if (copyRaw) {
    const parsed = publicCopySchema.safeParse(copyRaw.copy);
    if (parsed.success) copy = parsed.data;
  }

  let settings = DEFAULT_SETTINGS;
  if (settingsRaw) {
    const s = settingsRaw as typeof settingsRaw & { logo?: PopulatedMedia; logoLight?: PopulatedMedia; defaultSeo: typeof settingsRaw.defaultSeo & { ogImage?: PopulatedMedia } };
    settings = {
      siteName: s.siteName, tagline: s.tagline, logo: media(s.logo), logoLight: media(s.logoLight),
      phone: s.phone, whatsappNumber: s.whatsappNumber, email: s.email,
      addresses: s.addresses.map((address) => ({ label: address.label, line1: address.line1, city: address.city, country: address.country, mapUrl: address.mapUrl })),
      businessHours: s.businessHours,
      socialLinks: s.socialLinks.filter((link) => link.isActive).map((link) => ({ platform: link.platform, url: link.url })),
      whatsappDefaultMessage: s.whatsappDefaultMessage,
      announcementBar: s.announcementBar,
      defaultSeo: {
        metaTitle: s.defaultSeo.metaTitle, metaDescription: s.defaultSeo.metaDescription,
        keywords: s.defaultSeo.keywords, canonicalUrl: s.defaultSeo.canonicalUrl,
        noIndex: s.defaultSeo.noIndex, ogImage: media(s.defaultSeo.ogImage),
      },
    } satisfies PublicSettings;
  }

  const navigation = navigationRaw.length
    ? navigationRaw.map((item) => ({
        id: id(item._id), label: item.label, url: item.url, parentItem: item.parentItem?.toString(),
        openInNewTab: item.openInNewTab, location: item.location, sortOrder: item.sortOrder,
      })) satisfies PublicNavigation[]
    : DEFAULT_NAV;

  const categories = categoriesRaw.length
    ? categoriesRaw.map((item) => {
        const category = item as typeof item & { coverImage?: PopulatedMedia };
        return { id: id(category._id), name: category.name, slug: category.slug, shortDescription: category.shortDescription, coverImage: media(category.coverImage) };
      }) satisfies PublicCategory[]
    : DEFAULT_CATEGORIES;

  return { copy, settings, navigation, categories };
}, ["public-layout-data"], { tags: ["site-settings", "navigation", "categories", "public-ui"], revalidate: 60 });

/**
 * Header/footer/nav/settings shared by every public route. Cached cross-request
 * under content tags. NEVER returns null or throws: a failed connection or empty
 * collection yields the hardcoded DEFAULT_* chrome (with a dev-only warning).
 */
export const getPublicLayoutData = cache(async (): Promise<PublicLayoutData> => {
  try {
    return await loadPublicLayoutData();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[public/data] header/footer falling back to DEFAULT_NAV / DEFAULT_SETTINGS —", error);
    }
    return FALLBACK_LAYOUT;
  }
});

export const getHomepageData = cache(async (): Promise<HomepageData | null> => {
  const layout = await getPublicLayoutData();
  if (!layout) return null;
  await connectDB();
  const now = new Date();
  const [sectionsRaw, categoriesRaw, productsRaw, heroRaw, galleryRaw, projectsRaw, exhibitionsRaw, testimonialsRaw, faqsRaw, postsRaw] = await Promise.all([
    HomeSection.aggregate([
      { $match: publicFilter },
      { $set: { items: { $sortArray: { input: { $filter: { input: "$items", as: "item", cond: { $eq: ["$$item.isActive", true] } } }, sortBy: { sortOrder: 1 } } } } },
      { $sort: { sortOrder: 1 } },
    ]).exec().then((rows) => HomeSection.populate(rows, [
      { path: "backgroundImage", match: publicFilter }, { path: "items.image", match: publicFilter },
    ])),
    Category.find({ isFeatured: true, showOnHomepage: true }).activeOnly().sort({ sortOrder: 1 }).populate({ path: "coverImage", match: publicFilter }).lean(),
    Product.find({ isFeatured: true }).activeOnly().sort({ sortOrder: 1 }).limit(12).populate([
      { path: "primaryImage", match: publicFilter }, { path: "category", match: publicFilter, select: "slug" },
    ]).lean(),
    Media.find({ usageContext: "hero" }).activeOnly().sort({ sortOrder: 1 }).limit(8).lean(),
    Media.find({ usageContext: "gallery" }).activeOnly().sort({ sortOrder: 1 }).limit(18).lean(),
    Project.find({ isFeatured: true }).activeOnly().sort({ sortOrder: 1 }).limit(6).populate([
      { path: "coverImage", match: publicFilter }, { path: "materialsUsed", match: publicFilter, select: "name" },
    ]).lean(),
    Exhibition.find().activeOnly().sort({ startDate: -1 }).limit(8).populate({ path: "coverImage", match: publicFilter }).lean(),
    Testimonial.find({ isFeatured: true }).activeOnly().sort({ sortOrder: 1 }).limit(10).populate({ path: "clientPhoto", match: publicFilter }).lean(),
    Faq.find().activeOnly().sort({ sortOrder: 1 }).limit(12).lean(),
    BlogPost.find({ isPublished: true, publishedAt: { $lte: now } }).activeOnly().sort({ publishedAt: -1 }).limit(3).populate({ path: "coverImage", match: publicFilter }).lean(),
  ]);
  const sections = sectionsRaw.map((item) => ({
    id: id(item._id), sectionKey: item.sectionKey, heading: item.heading, subheading: item.subheading,
    eyebrowLabel: item.eyebrowLabel, bodyText: item.bodyText, ctaLabel: item.ctaLabel, ctaUrl: item.ctaUrl,
    backgroundImage: media(item.backgroundImage as PopulatedMedia), sortOrder: item.sortOrder,
    items: (item.items ?? []).map((entry) => ({
      key: String(entry.key), title: entry.title ? String(entry.title) : undefined, body: entry.body ? String(entry.body) : undefined,
      value: entry.value ? String(entry.value) : undefined, iconKey: entry.iconKey ? String(entry.iconKey) : undefined,
      image: media(entry.image as PopulatedMedia), ctaLabel: entry.ctaLabel ? String(entry.ctaLabel) : undefined,
      ctaUrl: entry.ctaUrl ? String(entry.ctaUrl) : undefined,
      data: (entry.data ?? {}) as PublicSection["items"][number]["data"], sortOrder: Number(entry.sortOrder ?? 0),
    })),
  })) satisfies PublicSection[];
  return {
    settings: layout.settings, navigation: layout.navigation,
    categories: categoriesRaw.map((item) => {
      const row = item as typeof item & { coverImage?: PopulatedMedia };
      return { id: id(row._id), name: row.name, slug: row.slug, shortDescription: row.shortDescription, coverImage: media(row.coverImage) };
    }), sections,
    products: productsRaw.map((item) => {
      const row = item as typeof item & { primaryImage?: PopulatedMedia; category?: { slug?: string } | null };
      return { id: id(row._id), name: row.name, slug: row.slug, categorySlug: row.category?.slug, origin: row.origin, colourFamily: row.colourFamily, primaryImage: media(row.primaryImage) };
    }) satisfies PublicProduct[],
    heroMedia: heroRaw.map((item) => toMediaDTO(item)),
    gallery: galleryRaw.map((item) => toMediaDTO(item)),
    projects: projectsRaw.map((item) => {
      const row = item as unknown as Omit<typeof item, "materialsUsed"> & { coverImage?: PopulatedMedia; materialsUsed: Array<{ name: string }> };
      return { id: id(row._id), title: row.title, slug: row.slug, location: row.location, country: row.country, coverImage: media(row.coverImage), materials: row.materialsUsed.map((entry) => entry.name) };
    }) satisfies PublicProject[],
    exhibitions: exhibitionsRaw.map((item) => {
      const row = item as typeof item & { coverImage?: PopulatedMedia };
      return { id: id(row._id), name: row.name, slug: row.slug, venue: row.venue, city: row.city, country: row.country, startDate: row.startDate.toISOString(), endDate: row.endDate.toISOString(), coverImage: media(row.coverImage) };
    }) satisfies PublicExhibition[],
    testimonials: testimonialsRaw.map((item) => {
      const row = item as typeof item & { clientPhoto?: PopulatedMedia };
      return { id: id(row._id), clientName: row.clientName, clientTitle: row.clientTitle, company: row.company, rating: row.rating, message: row.message, clientPhoto: media(row.clientPhoto) };
    }) satisfies PublicTestimonial[],
    faqs: faqsRaw.map((item) => ({ id: id(item._id), question: item.question, answer: item.answer })) satisfies PublicFaq[],
    posts: postsRaw.map((item) => {
      const row = item as typeof item & { coverImage?: PopulatedMedia };
      return { id: id(row._id), title: row.title, slug: row.slug, excerpt: row.excerpt, publishedAt: row.publishedAt?.toISOString(), coverImage: media(row.coverImage), readTimeMinutes: row.readTimeMinutes };
    }) satisfies PublicPost[],
  };
});
