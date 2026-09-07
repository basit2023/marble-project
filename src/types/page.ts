import type { Types } from "mongoose";
import type { IBaseContent, ISeo } from "@/types/base";

export const PUBLIC_PAGE_KINDS = ["about", "export", "contact", "privacy-policy", "terms", "return-policy", "general"] as const;

export interface IPage extends IBaseContent {
  title: string;
  slug: string;
  kind: (typeof PUBLIC_PAGE_KINDS)[number];
  excerpt?: string;
  content: string;
  coverImage?: Types.ObjectId | null;
  gallery: Types.ObjectId[];
  sections: Array<{
    key: string;
    title?: string;
    body?: string;
    items: string[];
    image?: Types.ObjectId | null;
    sortOrder: number;
    isActive: boolean;
  }>;
  seo: ISeo;
}
