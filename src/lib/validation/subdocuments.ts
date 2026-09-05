import { z } from "zod";
import { text, optionalText, objectId, httpUrl, linkUrl } from "@/lib/validation/common";

// Density: kg/m³; absorption: % by mass; strengths: MPa.
// Abrasion varies by test method, so retain the reported value and unit together.
export const technicalSpecsValidation = z.object({
  density: z.number().positive().optional(),
  waterAbsorption: z.number().min(0).max(100).optional(),
  compressiveStrength: z.number().nonnegative().optional(),
  flexuralStrength: z.number().nonnegative().optional(),
  abrasionResistance: optionalText,
});
export const priceRangeValidation = z.object({
  min: z.number().nonnegative(),
  max: z.number().nonnegative(),
  currency: z.string().regex(/^[A-Z]{3}$/),
  unit: text,
}).refine((price) => price.max >= price.min, {
  path: ["max"], message: "Maximum price must be at least the minimum price.",
});
export const homeItemValidation = z.object({
  key: text, title: optionalText, body: optionalText, value: optionalText, iconKey: optionalText,
  image: objectId.nullable().optional(), ctaLabel: optionalText, ctaUrl: linkUrl.optional(),
  data: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])),
  isActive: z.boolean(), sortOrder: z.number().int(),
});
export const addressValidation = z.object({
  label: text, line1: text, city: text, country: text,
  mapUrl: httpUrl.optional(), latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
}).refine((address) => (address.latitude === undefined) === (address.longitude === undefined), {
  path: ["longitude"], message: "Provide both coordinates or neither.",
});
export const socialLinkValidation = z.object({ platform: text, url: httpUrl, isActive: z.boolean() });
export const announcementValidation = z.object({
  text: optionalText, url: linkUrl.optional(), isActive: z.boolean(),
}).refine((bar) => !bar.isActive || Boolean(bar.text), {
  path: ["text"], message: "Active announcements require text.",
});
