import "server-only";
import { v2 as cloudinary } from "cloudinary";
import { z } from "zod";
import { env } from "@/lib/env";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});
export { cloudinary };

const imageOptions = z.object({
  publicId: z.string().trim().min(1),
  width: z.number().int().positive().max(8192),
  version: z.number().int().positive().optional(),
  dpr: z.union([z.literal("auto"), z.literal(1)]).default("auto"),
});
export function buildImageUrl(options: z.input<typeof imageOptions>): string {
  const { publicId, width, version, dpr } = imageOptions.parse(options);
  return cloudinary.url(publicId, {
    secure: true, resource_type: "image", type: "upload", version,
    transformation: [{ crop: "limit", width, fetch_format: "auto", quality: "auto", dpr }],
  });
}
export function buildImageSrcSet(publicId: string, widths: number[] = [360, 390, 768, 1024, 1440, 1920], version?: number): string {
  // Width descriptors describe physical pixels; avoid applying DPR twice.
  return [...new Set(widths)].sort((a, b) => a - b)
    .map((width) => `${buildImageUrl({ publicId, width, version, dpr: 1 })} ${width}w`).join(", ");
}

