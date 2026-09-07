import type { MediaDTO } from "@/lib/media/contracts";
export interface PublicNavigation { id: string; label: string; url: string; parentItem?: string; openInNewTab: boolean; location: string; sortOrder: number }
export interface PublicCategory { id: string; name: string; slug: string; shortDescription?: string; coverImage?: MediaDTO }
export interface PublicSectionItem {
  key: string; title?: string; body?: string; value?: string; iconKey?: string; image?: MediaDTO;
  ctaLabel?: string; ctaUrl?: string; data: Record<string, string | number | boolean | string[]>; sortOrder: number;
}
export interface PublicSection {
  id: string; sectionKey: string; heading?: string; subheading?: string; eyebrowLabel?: string;
  bodyText?: string; ctaLabel?: string; ctaUrl?: string; backgroundImage?: MediaDTO;
  items: PublicSectionItem[]; sortOrder: number;
}
export interface PublicSettings {
  siteName: string; tagline?: string; logo?: MediaDTO; logoLight?: MediaDTO; phone: string[];
  whatsappNumber?: string; email: string[]; addresses: Array<{ label: string; line1: string; city: string; country: string; mapUrl?: string }>;
  businessHours?: string; socialLinks: Array<{ platform: string; url: string }>; whatsappDefaultMessage?: string;
  announcementBar: { text?: string; url?: string; isActive: boolean };
  defaultSeo: { metaTitle?: string; metaDescription?: string; keywords: string[]; canonicalUrl?: string; noIndex: boolean; ogImage?: MediaDTO };
}
export interface PublicProduct { id: string; name: string; slug: string; categorySlug?: string; origin?: string; colourFamily: string; primaryImage?: MediaDTO }
export interface PublicProject { id: string; title: string; slug: string; location: string; country: string; coverImage?: MediaDTO; materials: string[] }
export interface PublicExhibition { id: string; name: string; slug: string; venue: string; city: string; country: string; startDate: string; endDate: string; coverImage?: MediaDTO }
export interface PublicTestimonial { id: string; clientName: string; clientTitle?: string; company?: string; rating: number; message: string; clientPhoto?: MediaDTO }
export interface PublicFaq { id: string; question: string; answer: string }
export interface PublicPost { id: string; title: string; slug: string; excerpt?: string; publishedAt?: string; coverImage?: MediaDTO; readTimeMinutes: number }
export interface HomepageData {
  settings: PublicSettings; navigation: PublicNavigation[]; categories: PublicCategory[]; sections: PublicSection[];
  products: PublicProduct[]; heroMedia: MediaDTO[]; gallery: MediaDTO[]; projects: PublicProject[]; exhibitions: PublicExhibition[];
  testimonials: PublicTestimonial[]; faqs: PublicFaq[]; posts: PublicPost[];
}
