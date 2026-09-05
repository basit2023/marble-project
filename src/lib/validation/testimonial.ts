import { z } from "zod";
import { baseValidation, text, optionalText, objectId } from "@/lib/validation/common";

export const testimonialValidation = baseValidation.extend({
  clientName: text,
  clientTitle: optionalText,
  company: optionalText,
  city: optionalText,
  country: optionalText,
  rating: z.number().int().min(1).max(5),
  message: text,
  clientPhoto: objectId.nullable().optional(),
  projectRef: objectId.nullable().optional(),
  isFeatured: z.boolean(),
});

