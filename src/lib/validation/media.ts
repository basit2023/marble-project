import { z } from "zod";
import * as E from "@/types/enums";
import { baseValidation, text, optionalText, objectId, httpUrl } from "@/lib/validation/common";

export const mediaValidation = baseValidation.extend({
  cloudinaryPublicId: text,
  secureUrl: httpUrl.refine((value) => {
    if (!URL.canParse(value)) return false;
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "res.cloudinary.com" && url.pathname.includes("/image/upload/");
  }, "Expected a Cloudinary HTTPS image upload URL"),
  format: text,
  width: z.number().int().min(1),
  height: z.number().int().min(1),
  bytes: z.number().int().min(1),
  version: z.number().int().positive().optional(),
  deletionStatus: z.enum(["none", "pending"]).optional(),
  altText: text,
  caption: optionalText,
  title: optionalText,
  folder: optionalText,
  tags: z.array(text),
  usageContext: z.enum(E.MEDIA_CONTEXTS),
  blurDataUrl: z.string().max(16384).regex(/^data:image\/(?:png|jpeg|webp|avif);base64,[a-zA-Z0-9+/]+=*$/).optional(),
  uploadedBy: objectId,
});
