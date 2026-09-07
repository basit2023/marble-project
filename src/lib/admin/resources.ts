import * as E from "@/types/enums";
import type { AdminResource } from "@/lib/permissions";

export const RESOURCE_KEYS = ["categories", "products", "projects", "exhibitions", "blog", "testimonials", "faqs", "home-sections", "navigation", "inquiries", "settings", "users"] as const;
export type ResourceKey = (typeof RESOURCE_KEYS)[number];
export type FieldKind = "text" | "email" | "password" | "textarea" | "richtext" | "number" | "boolean" | "select" | "tags" | "date" | "datetime" | "media" | "mediaMany" | "json";
export interface AdminField {
  path: string; kind: FieldKind; required?: boolean; options?: readonly string[];
  tab?: string; rows?: number;
}
export interface ResourceConfig {
  key: ResourceKey; modelName: string; resource: AdminResource; titleField: string;
  slugSource?: string; slugField?: string; searchFields: string[]; fields: AdminField[];
  publicBase?: string; revalidatePaths: string[]; singleton?: boolean; readOnlyCreate?: boolean;
}
const f = (path: string, kind: FieldKind, options: Partial<Omit<AdminField, "path" | "kind">> = {}): AdminField => ({ path, kind, ...options });
const seo: AdminField[] = [
  f("seo.metaTitle", "text"), f("seo.metaDescription", "textarea", { rows: 3 }),
  f("seo.keywords", "tags"), f("seo.ogImage", "media"), f("seo.canonicalUrl", "text"), f("seo.noIndex", "boolean"),
];
export const resources: Record<ResourceKey, ResourceConfig> = {
  categories: {
    key: "categories", modelName: "Category", resource: "categories", titleField: "name", slugSource: "name", slugField: "slug",
    searchFields: ["name", "slug", "shortDescription"], publicBase: "/materials", revalidatePaths: ["/", "/materials"],
    fields: [f("name", "text", { required: true }), f("slug", "text", { required: true }), f("description", "richtext", { required: true }),
      f("shortDescription", "textarea"), f("parentCategory", "text"), f("coverImage", "media"), f("iconKey", "text"),
      f("isFeatured", "boolean"), f("showInMenu", "boolean"), f("showOnHomepage", "boolean"), ...seo],
  },
  products: {
    key: "products", modelName: "Product", resource: "products", titleField: "name", slugSource: "name", slugField: "slug",
    searchFields: ["name", "slug", "description", "tags"], publicBase: "/products", revalidatePaths: ["/", "/products"],
    fields: [f("name", "text", { required: true }), f("slug", "text", { required: true }), f("category", "text", { required: true }),
      f("description", "richtext", { required: true }), f("origin", "text"), f("colourFamily", "select", { required: true, options: E.COLOUR_FAMILIES }),
      f("finishes", "tags"), f("availableFormats", "tags"), f("thicknessOptions", "tags"), f("sizeOptions", "tags"), f("applications", "tags"),
      f("technicalSpecs.density", "number"), f("technicalSpecs.waterAbsorption", "number"), f("technicalSpecs.compressiveStrength", "number"),
      f("technicalSpecs.flexuralStrength", "number"), f("technicalSpecs.abrasionResistance", "text"),
      f("priceRange.min", "number"), f("priceRange.max", "number"), f("priceRange.currency", "text"), f("priceRange.unit", "text"),
      f("isPriceVisible", "boolean"), f("images", "mediaMany"), f("primaryImage", "media"), f("tags", "tags"),
      f("isFeatured", "boolean"), f("isExportAvailable", "boolean"), f("stockStatus", "select", { required: true, options: E.STOCK_STATUSES }), ...seo],
  },
  projects: {
    key: "projects", modelName: "Project", resource: "projects", titleField: "title", slugSource: "title", slugField: "slug",
    searchFields: ["title", "slug", "client", "location", "country"], publicBase: "/projects", revalidatePaths: ["/", "/projects"],
    fields: [f("title", "text", { required: true }), f("slug", "text", { required: true }), f("client", "text"), f("location", "text", { required: true }),
      f("country", "text", { required: true }), f("projectType", "select", { required: true, options: E.PROJECT_TYPES }), f("year", "number", { required: true }),
      f("description", "richtext", { required: true }), f("materialsUsed", "tags"), f("finishesUsed", "tags"), f("coverImage", "media"),
      f("gallery", "mediaMany"), f("isFeatured", "boolean"), ...seo],
  },
  exhibitions: {
    key: "exhibitions", modelName: "Exhibition", resource: "exhibitions", titleField: "name", slugSource: "name", slugField: "slug",
    searchFields: ["name", "slug", "venue", "city", "country"], publicBase: "/exhibitions", revalidatePaths: ["/", "/exhibitions"],
    fields: [f("name", "text", { required: true }), f("slug", "text", { required: true }), f("venue", "text", { required: true }),
      f("city", "text", { required: true }), f("country", "text", { required: true }), f("startDate", "date", { required: true }),
      f("endDate", "date", { required: true }), f("description", "richtext", { required: true }), f("coverImage", "media"), f("gallery", "mediaMany"), ...seo],
  },
  blog: {
    key: "blog", modelName: "BlogPost", resource: "blog", titleField: "title", slugSource: "title", slugField: "slug",
    searchFields: ["title", "slug", "excerpt", "tags"], publicBase: "/blog", revalidatePaths: ["/", "/blog"],
    fields: [f("title", "text", { required: true }), f("slug", "text", { required: true }), f("excerpt", "textarea"),
      f("content", "richtext", { required: true }), f("coverImage", "media"), f("author", "text", { required: true }),
      f("category", "select", { required: true, options: E.BLOG_CATEGORIES }), f("tags", "tags"), f("publishedAt", "datetime"),
      f("isPublished", "boolean"), ...seo],
  },
  testimonials: {
    key: "testimonials", modelName: "Testimonial", resource: "testimonials", titleField: "clientName",
    searchFields: ["clientName", "company", "city", "country", "message"], revalidatePaths: ["/"],
    fields: [f("clientName", "text", { required: true }), f("clientTitle", "text"), f("company", "text"), f("city", "text"),
      f("country", "text"), f("rating", "number", { required: true }), f("message", "textarea", { required: true }),
      f("clientPhoto", "media"), f("projectRef", "text"), f("isFeatured", "boolean")],
  },
  faqs: {
    key: "faqs", modelName: "Faq", resource: "faqs", titleField: "question", searchFields: ["question", "answer"],
    revalidatePaths: ["/", "/faq"], fields: [f("question", "text", { required: true }), f("answer", "richtext", { required: true }),
      f("category", "select", { required: true, options: E.FAQ_CATEGORIES })],
  },
  "home-sections": {
    key: "home-sections", modelName: "HomeSection", resource: "home-sections", titleField: "sectionKey",
    searchFields: ["sectionKey", "heading", "subheading"], revalidatePaths: ["/"],
    fields: [f("sectionKey", "select", { required: true, options: E.HOME_SECTION_KEYS }), f("heading", "text"), f("subheading", "text"),
      f("eyebrowLabel", "text"), f("bodyText", "richtext"), f("ctaLabel", "text"), f("ctaUrl", "text"),
      f("backgroundImage", "media"), f("items", "json")],
  },
  navigation: {
    key: "navigation", modelName: "NavigationItem", resource: "navigation", titleField: "label",
    searchFields: ["label", "url"], revalidatePaths: ["/"],
    fields: [f("label", "text", { required: true }), f("url", "text", { required: true }), f("parentItem", "text"),
      f("openInNewTab", "boolean"), f("location", "select", { required: true, options: E.NAV_LOCATIONS })],
  },
  inquiries: {
    key: "inquiries", modelName: "Inquiry", resource: "inquiries", titleField: "name",
    searchFields: ["name", "email", "phone", "company", "message"], revalidatePaths: [],
    fields: [f("name", "text", { required: true }), f("email", "email", { required: true }), f("phone", "text"), f("country", "text"),
      f("company", "text"), f("inquiryType", "select", { required: true, options: E.INQUIRY_TYPES }), f("productInterest", "tags"),
      f("quantity", "text"), f("unit", "text"), f("message", "textarea", { required: true }), f("source", "select", { required: true, options: E.INQUIRY_SOURCES }),
      f("pageUrl", "text"), f("status", "select", { required: true, options: E.INQUIRY_STATUSES }), f("adminNotes", "textarea"),
      f("assignedTo", "text"), f("isRead", "boolean")],
  },
  settings: {
    key: "settings", modelName: "SiteSettings", resource: "settings", titleField: "siteName", singleton: true,
    searchFields: ["siteName", "tagline"], revalidatePaths: ["/"],
    fields: [f("siteName", "text", { required: true, tab: "general" }), f("tagline", "text", { tab: "general" }),
      f("logo", "media", { tab: "general" }), f("logoLight", "media", { tab: "general" }), f("favicon", "media", { tab: "general" }),
      f("phone", "tags", { tab: "contact" }), f("whatsappNumber", "text", { tab: "contact" }), f("email", "tags", { tab: "contact" }),
      f("addresses", "json", { tab: "contact" }), f("businessHours", "textarea", { tab: "contact" }),
      f("priceRange", "text", { tab: "seo" }),
      f("socialLinks", "json", { tab: "social" }), f("defaultSeo.metaTitle", "text", { tab: "seo" }),
      f("defaultSeo.metaDescription", "textarea", { tab: "seo" }), f("defaultSeo.keywords", "tags", { tab: "seo" }),
      f("defaultSeo.ogImage", "media", { tab: "seo" }), f("defaultSeo.canonicalUrl", "text", { tab: "seo" }),
      f("defaultSeo.noIndex", "boolean", { tab: "seo" }), f("googleAnalyticsId", "text", { tab: "analytics" }),
      f("googleTagManagerId", "text", { tab: "analytics" }), f("facebookPixelId", "text", { tab: "analytics" }),
      f("whatsappDefaultMessage", "textarea", { tab: "contact" }), f("announcementBar", "json", { tab: "announcement" }),
      f("maintenanceMode", "boolean", { tab: "maintenance" })],
  },
  users: {
    key: "users", modelName: "User", resource: "users", titleField: "name",
    searchFields: ["name", "email", "role"], revalidatePaths: [], fields: [
      f("name", "text", { required: true }), f("email", "email", { required: true }), f("password", "password"),
      f("role", "select", { required: true, options: E.USER_ROLES }), f("forcePasswordChange", "boolean"),
    ],
  },
};
export function isResourceKey(value: string): value is ResourceKey {
  return (RESOURCE_KEYS as readonly string[]).includes(value);
}
export function getResourceConfig(value: string): ResourceConfig {
  if (!isResourceKey(value)) throw new Error("Unknown resource.");
  return resources[value];
}
