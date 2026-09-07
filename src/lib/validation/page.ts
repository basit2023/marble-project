import { z } from "zod";
import { PUBLIC_PAGE_KINDS } from "@/types/page";
import { baseValidation, objectId, optionalText, seoValidation, slug, text } from "@/lib/validation/common";

export const pageSectionValidation = z.object({
  key: text,
  title: optionalText,
  body: optionalText,
  items: z.array(z.string().trim().min(1).max(500)).default([]),
  image: objectId.nullable().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const pageValidation = baseValidation.extend({
  title: text,
  slug,
  kind: z.enum(PUBLIC_PAGE_KINDS),
  excerpt: optionalText,
  content: text,
  coverImage: objectId.nullable().optional(),
  gallery: z.array(objectId).default([]),
  sections: z.array(pageSectionValidation).default([]),
  seo: seoValidation,
});
