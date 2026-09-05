import { z } from "zod";
import { baseValidation, text } from "@/lib/validation/common";
export const systemContentValidation = baseValidation.extend({
  key: z.enum(["foundation", "error", "notFound", "loading"]),
  heading: text, body: text, actionLabel: text,
  seoTitle: text.max(60), seoDescription: text.max(160),
});

