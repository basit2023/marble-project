import { z } from "zod";
import type { Types } from "mongoose";

// Accept hydrated ObjectIds here. Form DTOs must explicitly parse ID strings.
export const objectId = z.custom<Types.ObjectId>((value) =>
  typeof value === "object" && value !== null && "toHexString" in value &&
  typeof value.toHexString === "function" && /^[a-f\d]{24}$/i.test(value.toHexString()),
  "Expected an ObjectId",
);
export const text = z.string().trim().min(1);
export const optionalText = z.string().trim().optional();
export const httpUrl = z.url().refine((value) => {
  if (!URL.canParse(value)) return false;
  const url = new URL(value);
  return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password;
}, "Expected an HTTP(S) URL without credentials");
export const linkUrl = z.string().refine((value) => {
  if (/[\s\\\u0000-\u001f]/.test(value)) return false;
  if (/^\/(?!\/)/.test(value) || /^#[\w-]+$/.test(value)) return true;
  if (/^mailto:[^@]+@[^@]+\.[^@]+$/.test(value) || /^tel:\+?[\d()-]+$/.test(value)) return true;
  return httpUrl.safeParse(value).success;
}, "Expected a safe internal, HTTP(S), mailto or tel link");
export const slug = text.regex(/^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u);
export const baseValidation = z.object({
  isActive: z.boolean(), isDeleted: z.boolean(), sortOrder: z.number().int(),
  createdBy: objectId.nullable(), updatedBy: objectId.nullable(),
  createdAt: z.date().optional(), updatedAt: z.date().optional(),
});
export const seoValidation = z.object({
  metaTitle: z.string().trim().max(60).optional(),
  metaDescription: z.string().trim().max(160).optional(),
  keywords: z.array(text),
  ogImage: objectId.nullable().optional(),
  canonicalUrl: httpUrl.optional(),
  noIndex: z.boolean(),
});
