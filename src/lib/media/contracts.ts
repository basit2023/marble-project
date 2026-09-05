import { z } from "zod";
import { MEDIA_CONTEXTS } from "@/types/enums";

export const UPLOAD_FOLDERS = ["products", "projects", "exhibitions", "blog", "home", "brand"] as const;
export const IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const idSchema = z.string().regex(/^[a-f\d]{24}$/i);
export const uploadFileSchema = z.object({
  name: z.string().regex(/\.(jpe?g|png|webp|avif)$/i),
  type: z.enum(IMAGE_MIMES),
  size: z.number().int().positive().max(MAX_UPLOAD_BYTES),
});
export const signInputSchema = z.object({
  folder: z.enum(UPLOAD_FOLDERS), usageContext: z.enum(MEDIA_CONTEXTS),
}).strict();
export const cloudUploadSchema = z.object({
  public_id: z.string().min(1).max(250), version: z.number().int().positive(),
  signature: z.string().regex(/^[a-f\d]{40,64}$/i),
  secure_url: z.url(), format: z.enum(["jpg", "png", "webp", "avif"]),
  width: z.number().int().positive(), height: z.number().int().positive(),
  bytes: z.number().int().positive(),
});
export const editableMediaSchema = z.object({
  altText: z.string().trim().min(1).max(500),
  caption: z.string().trim().max(2000),
  tags: z.array(z.string().trim().min(1).max(60)).max(30),
  isActive: z.boolean(), sortOrder: z.number().int().min(-100000).max(100000),
});
export const createMediaSchema = editableMediaSchema.pick({ altText: true, caption: true, tags: true }).extend({
  ticket: z.string().max(2048), upload: cloudUploadSchema,
}).strict();
export const patchMediaSchema = editableMediaSchema.partial().strict().refine((value) => Object.keys(value).length > 0);
export const listMediaSchema = z.object({
  search: z.string().trim().max(100).default(""),
  folder: z.enum(UPLOAD_FOLDERS).optional(),
  tag: z.string().trim().max(60).optional(),
  usageContext: z.enum(MEDIA_CONTEXTS).optional(),
  state: z.enum(["active", "all", "deleted"]).default("active"),
  page: z.coerce.number().int().positive().max(10000).default(1),
});
export const mediaDtoSchema = z.object({
  id: idSchema, cloudinaryPublicId: z.string(), secureUrl: z.url(), format: z.string(),
  width: z.number(), height: z.number(), bytes: z.number(), version: z.number().optional(),
  altText: z.string(), caption: z.string(), folder: z.string(), tags: z.array(z.string()),
  usageContext: z.enum(MEDIA_CONTEXTS), blurDataUrl: z.string().optional(),
  isActive: z.boolean(), isDeleted: z.boolean(), sortOrder: z.number(),
  deletionStatus: z.enum(["none", "pending"]),
});
export type MediaDTO = z.infer<typeof mediaDtoSchema>;
export type MediaEdit = z.infer<typeof editableMediaSchema>;
export type UploadResult = z.infer<typeof cloudUploadSchema>;
export const signaturePayloadSchema = z.object({
  uploadUrl: z.url(), apiKey: z.string(), ticket: z.string(),
  params: z.record(z.string(), z.string()),
});
export const mediaListSchema = z.object({ items: z.array(mediaDtoSchema), total: z.number(), page: z.number(), pageSize: z.number() });
export const ERROR_CODES = ["VALIDATION", "UNAUTHORIZED", "FORBIDDEN", "UPLOAD_FAILED", "UPLOAD_EXPIRED", "MEDIA_IN_USE", "NOT_FOUND", "CONFLICT", "SERVICE_UNAVAILABLE", "FILE_TYPE", "FILE_SIZE", "COMPRESSION_FAILED", "CANCELLED", "RATE_LIMITED"] as const;
export type MediaErrorCode = (typeof ERROR_CODES)[number];
export const usageSchema = z.object({ collection: z.string(), documentId: idSchema, label: z.string() });
export type MediaUsage = z.infer<typeof usageSchema>;
export const apiErrorSchema = z.object({ error: z.enum(ERROR_CODES), usages: z.array(usageSchema).optional() });

