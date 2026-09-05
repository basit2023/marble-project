import type { Types } from "mongoose";
import type * as E from "@/types/enums";
import type { IBaseContent, ISeo } from "@/types/base";

export interface IBlogPost extends IBaseContent {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: Types.ObjectId | null;
  author: Types.ObjectId;
  category: (typeof E.BLOG_CATEGORIES)[number];
  tags: string[];
  readTimeMinutes: number;
  publishedAt?: Date;
  isPublished: boolean;
  viewCount: number;
  seo: ISeo;
}

