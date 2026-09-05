import "server-only";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { cloudinary } from "@/lib/cloudinary";
import { env } from "@/lib/env";
import { signInputSchema, MAX_UPLOAD_BYTES, cloudUploadSchema } from "./contracts";
import { equalSignature, signTicket, verifyTicket } from "./tickets";
import { MediaApiError } from "./errors";

export const INCOMING_TRANSFORMATION = "c_limit,w_2560/fl_strip_profile";
export function createUploadSignature(actorId: string, input: z.infer<typeof signInputSchema>) {
  const folder = "marble-site/" + input.folder;
  const leaf = randomUUID();
  const publicId = folder + "/" + leaf;
  const timestamp = Math.floor(Date.now() / 1000);
  const params: Record<string, string> = {
    timestamp: String(timestamp), upload_preset: env.CLOUDINARY_UPLOAD_PRESET,
    overwrite: "false", allowed_formats: "jpg,png,webp,avif",
    transformation: INCOMING_TRANSFORMATION,
    ...(env.CLOUDINARY_FOLDER_MODE === "dynamic"
      ? { public_id: publicId, asset_folder: folder }
      : { public_id: leaf, folder }),
  };
  const signature = cloudinary.utils.api_sign_request(params, env.CLOUDINARY_API_SECRET);
  return {
    uploadUrl: `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`,
    apiKey: env.CLOUDINARY_API_KEY, params: { ...params, signature },
    ticket: signTicket({ ...input, publicId, actorId, timestamp, expiresAt: Date.now() + 24 * 60 * 60 * 1000 }, env.NEXTAUTH_SECRET),
  };
}
const resourceSchema = cloudUploadSchema.omit({ signature: true }).extend({
  resource_type: z.literal("image"), type: z.literal("upload"),
  width: z.number().int().min(1).max(2560),
  bytes: z.number().int().min(1).max(MAX_UPLOAD_BYTES),
});
export async function verifyUploadedAsset(actorId: string, ticketValue: string, upload: z.infer<typeof cloudUploadSchema>) {
  const ticket = verifyTicket(ticketValue, actorId, env.NEXTAUTH_SECRET);
  if (!ticket) throw new MediaApiError(400, "UPLOAD_EXPIRED");
  if (ticket.publicId !== upload.public_id) throw new MediaApiError(400, "VALIDATION");
  const expected = cloudinary.utils.api_sign_request({ public_id: upload.public_id, version: upload.version }, env.CLOUDINARY_API_SECRET);
  if (!equalSignature(expected, upload.signature)) throw new MediaApiError(400, "VALIDATION");
  // A response signature covers only public_id/version, not width, bytes or URL.
  // Fetch trusted provider metadata rather than accepting those client fields.
  const raw: unknown = await cloudinary.api.resource(ticket.publicId, { resource_type: "image", type: "upload" });
  const resource = resourceSchema.parse(raw);
  const expectedPrefix = `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/image/upload/`;
  if (resource.public_id !== ticket.publicId || resource.version !== upload.version || !resource.secure_url.startsWith(expectedPrefix)) {
    throw new MediaApiError(400, "VALIDATION");
  }
  return { ticket, resource };
}
export async function generateBlurDataUrl(publicId: string, version: number): Promise<string> {
  const url = cloudinary.url(publicId, {
    secure: true, version, resource_type: "image", type: "upload",
    transformation: [{ width: 16, height: 16, crop: "limit", quality: 30, fetch_format: "jpg", effect: "blur:300", flags: "strip_profile" }],
  });
  const response = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(10000), cache: "no-store" });
  if (!response.ok || !response.headers.get("content-type")?.startsWith("image/jpeg") || !response.body) throw new MediaApiError(502, "UPLOAD_FAILED");
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 10000) { await reader.cancel(); throw new MediaApiError(502, "UPLOAD_FAILED"); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const buffer = Buffer.concat(chunks);
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) throw new MediaApiError(502, "UPLOAD_FAILED");
  return "data:image/jpeg;base64," + buffer.toString("base64");
}
export async function destroyCloudinaryAsset(publicId: string): Promise<void> {
  try {
    const result: unknown = await cloudinary.uploader.destroy(publicId, { resource_type: "image", type: "upload", invalidate: true });
    const parsed = z.object({ result: z.enum(["ok", "not found"]) }).safeParse(result);
    if (!parsed.success) throw new Error("Unexpected destroy result.");
  } catch { throw new MediaApiError(502, "UPLOAD_FAILED"); }
}
