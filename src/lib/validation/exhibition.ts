import { z } from "zod";
import { baseValidation, text, objectId, slug, seoValidation } from "@/lib/validation/common";

export const exhibitionValidation = baseValidation.extend({
  name: text,
  slug: slug,
  venue: text,
  city: text,
  country: text,
  startDate: z.date(),
  endDate: z.date(),
  description: text,
  coverImage: objectId.nullable().optional(),
  gallery: z.array(objectId),
  seo: seoValidation,
}).refine((value) => value.endDate >= value.startDate, { path: ["endDate"], message: "End date must be on or after start date." });

