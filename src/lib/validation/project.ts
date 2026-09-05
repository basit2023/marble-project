import { z } from "zod";
import * as E from "@/types/enums";
import { baseValidation, text, optionalText, objectId, slug, seoValidation } from "@/lib/validation/common";

export const projectValidation = baseValidation.extend({
  title: text,
  slug: slug,
  client: optionalText,
  location: text,
  country: text,
  projectType: z.enum(E.PROJECT_TYPES),
  year: z.number().int().min(1000).max(9999),
  description: text,
  materialsUsed: z.array(objectId),
  finishesUsed: z.array(text),
  coverImage: objectId.nullable().optional(),
  gallery: z.array(objectId),
  isFeatured: z.boolean(),
  seo: seoValidation,
});

