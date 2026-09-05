import { z } from "zod";
import { baseValidation, text, optionalText, objectId, slug, seoValidation } from "@/lib/validation/common";

export const categoryValidation = baseValidation.extend({
  name: text,
  slug: slug,
  description: text,
  shortDescription: optionalText,
  parentCategory: objectId.nullable().optional(),
  coverImage: objectId.nullable().optional(),
  iconKey: optionalText,
  seo: seoValidation,
  isFeatured: z.boolean(),
  showInMenu: z.boolean(),
  showOnHomepage: z.boolean(),
});

