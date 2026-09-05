import { z } from "zod";
import * as E from "@/types/enums";
import { baseValidation, text, optionalText, objectId, slug, seoValidation } from "@/lib/validation/common";
import { priceRangeValidation, technicalSpecsValidation } from "@/lib/validation/subdocuments";

export const productValidation = baseValidation.extend({
  name: text,
  slug: slug,
  category: objectId,
  description: text,
  origin: optionalText,
  colourFamily: z.enum(E.COLOUR_FAMILIES),
  finishes: z.array(z.enum(E.FINISHES)),
  availableFormats: z.array(z.enum(E.PRODUCT_FORMATS)),
  thicknessOptions: z.array(text),
  sizeOptions: z.array(text),
  applications: z.array(z.enum(E.APPLICATIONS)),
  technicalSpecs: technicalSpecsValidation.optional(),
  priceRange: priceRangeValidation.optional(),
  isPriceVisible: z.boolean(),
  images: z.array(objectId),
  primaryImage: objectId.nullable().optional(),
  tags: z.array(text),
  isFeatured: z.boolean(),
  isExportAvailable: z.boolean(),
  stockStatus: z.enum(E.STOCK_STATUSES),
  seo: seoValidation,
}).superRefine((value, ctx) => {
  if (value.isPriceVisible && !value.priceRange) ctx.addIssue({ code: "custom", path: ["priceRange"], message: "Visible prices require a price range." });
  if (value.primaryImage && !value.images.some((id) => id.equals(value.primaryImage))) ctx.addIssue({ code: "custom", path: ["primaryImage"], message: "Primary image must appear in the ordered image list." });
});

