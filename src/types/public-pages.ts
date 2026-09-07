import type { MediaDTO } from "@/lib/media/contracts";

export interface SeoDTO {
  metaTitle?: string;
  metaDescription?: string;
  keywords: string[];
  canonicalUrl?: string;
  noIndex: boolean;
  ogImage?: MediaDTO;
}

export interface PageSectionDTO {
  key: string;
  title?: string;
  body?: string;
  items: string[];
  image?: MediaDTO;
  sortOrder: number;
}

export interface PageDTO {
  id: string;
  title: string;
  slug: string;
  kind: string;
  excerpt?: string;
  content: string;
  coverImage?: MediaDTO;
  gallery: MediaDTO[];
  sections: PageSectionDTO[];
  seo: SeoDTO;
}

export interface CategoryCardDTO {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  coverImage?: MediaDTO;
  seo: SeoDTO;
}

export interface ProductCardDTO {
  id: string;
  name: string;
  slug: string;
  categorySlug: string;
  categoryName: string;
  description: string;
  origin?: string;
  colourFamily: string;
  finishes: string[];
  availableFormats: string[];
  applications: string[];
  primaryImage?: MediaDTO;
  isPriceVisible: boolean;
  priceRange?: { min?: number; max?: number; currency?: string; unit?: string };
}

export interface ProductDetailDTO extends ProductCardDTO {
  images: MediaDTO[];
  technicalSpecs?: Record<string, string | number | boolean | null>;
  thicknessOptions: string[];
  sizeOptions: string[];
  stockStatus: string;
  tags: string[];
  seo: SeoDTO;
}

export interface ProjectCardDTO {
  id: string;
  title: string;
  slug: string;
  client?: string;
  location: string;
  country: string;
  projectType: string;
  year: number;
  description: string;
  coverImage?: MediaDTO;
}

export interface ProjectDetailDTO extends ProjectCardDTO {
  gallery: MediaDTO[];
  finishesUsed: string[];
  materialsUsed: ProductCardDTO[];
  seo: SeoDTO;
}

export interface ExhibitionDTO {
  id: string;
  name: string;
  slug: string;
  venue: string;
  city: string;
  country: string;
  startDate: string;
  endDate: string;
  description: string;
  coverImage?: MediaDTO;
  gallery: MediaDTO[];
  seo: SeoDTO;
}

export interface BlogPostDTO {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  category: string;
  tags: string[];
  readTimeMinutes: number;
  publishedAt?: string;
  coverImage?: MediaDTO;
  author?: { name: string; role?: string };
  seo: SeoDTO;
}

export interface SearchResultDTO {
  id: string;
  title: string;
  url: string;
  type: "Product" | "Project" | "Blog";
  excerpt?: string;
  image?: MediaDTO;
}
