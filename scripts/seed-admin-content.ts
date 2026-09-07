import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

const navigation: Record<string, string> = {
  dashboard: "Dashboard", media: "Media Library", categories: "Categories", products: "Products",
  projects: "Projects", exhibitions: "Exhibitions", blog: "Blog", testimonials: "Testimonials",
  faqs: "FAQs", "home-sections": "Homepage Sections", navigation: "Navigation",
  inquiries: "Inquiries", settings: "Settings", users: "Users", seo: "SEO Health",
};
const names: Record<string, [string, string, string]> = {
  categories: ["Category", "Categories", "Organise the material catalogue."],
  products: ["Product", "Products", "Manage stone colours, formats and specifications."],
  projects: ["Project", "Projects", "Publish completed installations and case studies."],
  exhibitions: ["Exhibition", "Exhibitions", "Manage trade shows and events."],
  blog: ["Article", "Blog", "Publish guides, news and project stories."],
  testimonials: ["Testimonial", "Testimonials", "Manage client reviews."],
  faqs: ["FAQ", "FAQs", "Manage common customer questions."],
  "home-sections": ["Homepage section", "Homepage Sections", "Reorder and configure the homepage."],
  navigation: ["Navigation item", "Navigation", "Manage header, footer and mobile links."],
  inquiries: ["Inquiry", "Inquiries", "Review and respond to customer leads."],
  settings: ["Site settings", "Settings", "Manage contact, SEO and site-wide configuration."],
  users: ["User", "Users", "Manage administrator access and roles."],
  media: ["Media item", "Media Library", "Upload and manage site imagery."],
};
const fields: Record<string, string> = {
  name: "Name", title: "Title", slug: "Slug", description: "Description", shortDescription: "Short description",
  parentCategory: "Parent category ID", coverImage: "Cover image", iconKey: "Icon key", isFeatured: "Featured",
  showInMenu: "Show in menu", showOnHomepage: "Show on homepage", category: "Category ID", origin: "Origin",
  colourFamily: "Colour family", finishes: "Finishes", availableFormats: "Available formats",
  thicknessOptions: "Thickness options", sizeOptions: "Size options", applications: "Applications",
  density: "Density (kg/m³)", waterAbsorption: "Water absorption (%)", compressiveStrength: "Compressive strength (MPa)",
  flexuralStrength: "Flexural strength (MPa)", abrasionResistance: "Abrasion resistance", priceMin: "Minimum price",
  priceMax: "Maximum price", currency: "Currency", unit: "Unit", isPriceVisible: "Show price",
  images: "Gallery", primaryImage: "Primary image", tags: "Tags", isExportAvailable: "Export available",
  stockStatus: "Stock status", client: "Client", location: "Location", country: "Country", projectType: "Project type",
  year: "Year", materialsUsed: "Product IDs", finishesUsed: "Finishes used", gallery: "Gallery",
  venue: "Venue", city: "City", startDate: "Start date", endDate: "End date", excerpt: "Excerpt",
  content: "Content", author: "Author ID", readTimeMinutes: "Reading time", publishedAt: "Published at",
  isPublished: "Published", viewCount: "View count", clientName: "Client name", clientTitle: "Client title",
  company: "Company", rating: "Rating", message: "Message", clientPhoto: "Client photo", projectRef: "Project ID",
  question: "Question", answer: "Answer", sectionKey: "Section", heading: "Heading", subheading: "Subheading",
  eyebrowLabel: "Eyebrow label", bodyText: "Body", ctaLabel: "CTA label", ctaUrl: "CTA URL",
  backgroundImage: "Background image", items: "Section items", label: "Label", url: "URL", parentItem: "Parent item ID",
  openInNewTab: "Open in new tab", inquiryType: "Inquiry type", productInterest: "Product IDs", quantity: "Quantity",
  source: "Source", pageUrl: "Page URL", status: "Status", adminNotes: "Admin notes", assignedTo: "Assigned user ID",
  isRead: "Read", email: "Email", role: "Role", password: "Password", lastLoginAt: "Last login",
  siteName: "Site name", tagline: "Tagline", logo: "Logo", logoLight: "Light logo", favicon: "Favicon",
  phone: "Phone numbers", whatsappNumber: "WhatsApp number", addresses: "Locations", businessHours: "Business hours",
  socialLinks: "Social links", googleAnalyticsId: "Google Analytics ID", googleTagManagerId: "Google Tag Manager ID",
  facebookPixelId: "Facebook Pixel ID", whatsappDefaultMessage: "Default WhatsApp message",
  maintenanceMode: "Maintenance mode", announcementBar: "Announcement bar", priceRange: "Price range (schema.org)",
  metaTitle: "Meta title",
  metaDescription: "Meta description", keywords: "Keywords", ogImage: "Open Graph image", canonicalUrl: "Canonical URL",
  noIndex: "Prevent search indexing", isActive: "Active", sortOrder: "Sort order",
};
const labels: Record<string, string> = {
  viewSite: "View site", collapse: "Collapse sidebar", expand: "Expand sidebar", openMenu: "Open navigation",
  closeMenu: "Close navigation", accountMenu: "Account menu", signOut: "Sign out", changePassword: "Change password",
  create: "Add new", edit: "Edit", duplicate: "Duplicate", view: "View on site", delete: "Delete",
  hardDelete: "Delete permanently", search: "Search", filter: "Filter", all: "All", active: "Active",
  inactive: "Inactive", deleted: "Deleted", previous: "Previous", next: "Next", page: "Page", of: "of",
  selectAll: "Select all rows", selectRow: "Select row", actions: "Actions", bulkActions: "Bulk actions",
  enable: "Enable", disable: "Disable", reorder: "Drag to reorder", save: "Save", saveAdd: "Save & add another",
  saveDraft: "Save as draft", cancel: "Cancel", saved: "Changes saved.", created: "Record created.",
  deletedSuccess: "Record deleted.", duplicated: "Record duplicated.", failed: "The request could not be completed.",
  confirmDelete: "Delete this record?", confirmHardDelete: "Permanently delete this record and its asset?",
  unsaved: "You have unsaved changes. Leave this page?", seo: "SEO", seoPreview: "Search result preview",
  characters: "characters", chooseMedia: "Choose media", changeMedia: "Change media", removeMedia: "Remove media",
  toggleMedia: "Toggle image visibility", selected: "selected", noResults: "No records found.", loading: "Loading…",
  dashboardIntro: "A live view of content, leads and system activity.", activeCount: "Active", inactiveCount: "Inactive",
  unreadInquiries: "Unread inquiries", recentInquiries: "Recent inquiries", recentActivity: "Recent activity",
  storageUsed: "Cloudinary storage used", unavailable: "Unavailable", quickLinks: "Quick links",
  loginHeading: "Administrator sign in", loginIntro: "Use your administrator credentials to continue.",
  email: "Email", password: "Password", signIn: "Sign in", signingIn: "Signing in…",
  loginError: "The email or password is incorrect.", rateLimited: "Too many attempts. Try again later.",
  passwordHeading: "Change your password", passwordIntro: "Choose a new password before continuing.",
  currentPassword: "Current password", newPassword: "New password", confirmPassword: "Confirm new password",
  passwordRules: "Use at least 12 characters with upper and lowercase letters, a number and a symbol.",
  passwordChanged: "Password changed. Sign in with your new password.", required: "This field is required.",
  slugAvailable: "Slug is available.", slugTaken: "That slug is already in use.", generateSlug: "Generate from title",
  seoTitleHint: "Recommended maximum: 60 characters.", seoDescriptionHint: "Recommended maximum: 160 characters.",
  dashboard: "Dashboard", media: "Media Library", inbox: "Inbox", details: "Details", replyWhatsapp: "Reply on WhatsApp",
  exportCsv: "Export CSV", notes: "Admin notes", assign: "Assign to user", sourcePage: "Source page",
  homepageHint: "Drag sections to change their public order.", settingsGeneral: "General",
  settingsContact: "Contact & Locations", settingsSocial: "Social Links", settingsSeo: "SEO Defaults",
  settingsAnalytics: "Analytics", settingsAnnouncement: "Announcement Bar", settingsMaintenance: "Maintenance Mode",
  rowUpdated: "Row updated.", bulkUpdated: "Selected records updated.", orderSaved: "Order saved.",
  noPermission: "You do not have permission for this action.", total: "Total", retry: "Retry",
};
const errors = {
  UNAUTHORIZED: "Your session has expired. Sign in again.", FORBIDDEN: "You do not have permission for this action.",
  VALIDATION: "Review the highlighted fields.", NOT_FOUND: "The record could not be found.",
  CONFLICT: "The record changed elsewhere. Refresh and try again.", SERVICE_UNAVAILABLE: "The service is temporarily unavailable.",
  IN_USE: "This record is still referenced elsewhere.", UNKNOWN: "The request could not be completed.",
};
async function main() {
  const [{ connectDB }, { AdminUiContent }] = await Promise.all([import("../src/lib/db"), import("../src/models")]);
  const db = await connectDB();
  try {
    if (await AdminUiContent.exists({ key: "admin-ui" })) {
      console.info("Admin UI content already exists; no changes made.");
      return;
    }
    await AdminUiContent.create({
      key: "admin-ui", createdBy: null, updatedBy: null,
      copy: {
        brand: "Stone Catalogue",
        labels, navigation,
        modules: Object.fromEntries(Object.entries(names).map(([key, [singular, plural, description]]) => [key, { singular, plural, description }])),
        fields,
        options: { yes: "Yes", no: "No", draft: "Draft", unknown: "Unknown" },
        errors,
      },
    });
    console.info("Admin UI content seeded.");
  } finally { await db.disconnect(); }
}
main().catch(() => { console.error("Admin UI seed failed. Verify environment and Atlas access."); process.exitCode = 1; });
