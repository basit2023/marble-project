import { z } from "zod";
import { apiErrorSchema, cloudUploadSchema, uploadFileSchema, type MediaErrorCode, type MediaUsage, type UploadResult } from "./contracts";

export class ClientMediaError extends Error {
  constructor(public code: MediaErrorCode, public usages?: MediaUsage[]) { super(code); }
}
export async function mediaRequest<T>(url: string, schema: z.ZodType<T>, init?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, { ...init, credentials: "same-origin", cache: "no-store" });
    const data: unknown = await response.json();
    if (!response.ok) {
      const error = apiErrorSchema.safeParse(data);
      throw new ClientMediaError(error.success ? error.data.error : "SERVICE_UNAVAILABLE", error.success ? error.data.usages : undefined);
    }
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ClientMediaError || error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ClientMediaError("SERVICE_UNAVAILABLE");
  }
}
export function errorCode(error: unknown): MediaErrorCode { return error instanceof ClientMediaError ? error.code : "SERVICE_UNAVAILABLE"; }
export async function compressImage(file: File): Promise<File> {
  uploadFileSchema.parse(file);
  let bitmap: ImageBitmap | undefined;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    if (bitmap.width * bitmap.height > 40_000_000) throw new Error("Image dimensions too large.");
    const ratio = Math.min(1, 2560 / bitmap.width, 2560 / bitmap.height);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
    canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas unavailable.");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(
      (result) => result ? resolve(result) : reject(new Error("Compression failed.")), "image/webp", 0.86,
    ));
    if (ratio === 1 && blob.size >= file.size) return file;
    const extension = blob.type === "image/webp" ? "webp" : "png";
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + "." + extension, { type: blob.type });
  } catch { throw new ClientMediaError("COMPRESSION_FAILED"); }
  finally { bitmap?.close(); }
}
export function uploadDirect(file: File, payload: { uploadUrl: string; apiKey: string; params: Record<string, string> }, progress: (value: number) => void, signal: AbortSignal): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const form = new FormData();
    form.append("file", file);
    form.append("api_key", payload.apiKey);
    for (const [key, value] of Object.entries(payload.params)) form.append(key, value);
    const abort = () => xhr.abort();
    const cleanup = () => signal.removeEventListener("abort", abort);
    xhr.open("POST", payload.uploadUrl);
    xhr.timeout = 120000;
    xhr.upload.onprogress = (event) => { if (event.lengthComputable) progress(Math.round(event.loaded / event.total * 100)); };
    xhr.onerror = xhr.ontimeout = () => { cleanup(); reject(new ClientMediaError("UPLOAD_FAILED")); };
    xhr.onabort = () => { cleanup(); reject(new ClientMediaError("CANCELLED")); };
    xhr.onload = () => {
      cleanup();
      try {
        if (xhr.status < 200 || xhr.status >= 300) throw new Error("Upload failed.");
        resolve(cloudUploadSchema.parse(JSON.parse(xhr.responseText)));
      } catch { reject(new ClientMediaError("UPLOAD_FAILED")); }
    };
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) { cleanup(); reject(new ClientMediaError("CANCELLED")); return; }
    xhr.send(form);
  });
}
export function reorder<T>(items: T[], from: number, to: number): T[] {
  if (from < 0 || to < 0 || from >= items.length || to >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

