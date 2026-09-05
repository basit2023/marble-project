import { z } from "zod";
import * as E from "@/types/enums";
import { baseValidation, text, optionalText, objectId, slug, seoValidation } from "@/lib/validation/common";

export const blogPostValidation = baseValidation.extend({
  title: text,
  slug: slug,
  excerpt: optionalText,
  content: text,
  coverImage: objectId.nullable().optional(),
  author: objectId,
  category: z.enum(E.BLOG_CATEGORIES),
  tags: z.array(text),
  readTimeMinutes: z.number().int().min(1),
  publishedAt: z.date().optional(),
  isPublished: z.boolean(),
  viewCount: z.number().int().nonnegative(),
  seo: seoValidation,
}).refine((value) => !value.isPublished || Boolean(value.publishedAt), { path: ["publishedAt"], message: "Published posts require a publication date." });

