import { z } from "zod";

// This module is also imported by next.config.ts: invalid builds fail before compilation.
// Never import it from a Client Component or log the input environment.
const httpUrl = z.url().refine((value) => {
  if (!URL.canParse(value)) return false;
  const url = new URL(value);
  return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password;
}, "Must be an HTTP(S) URL without credentials");
export const envSchema = z.object({
  MONGODB_URI: z.string().regex(/^mongodb(?:\+srv)?:\/\/\S+$/),
  CLOUDINARY_CLOUD_NAME: z.string().regex(/^[a-zA-Z0-9_-]+$/),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  CLOUDINARY_UPLOAD_PRESET: z.string().regex(/^[a-zA-Z0-9_-]+$/).default("marble-site-signed"),
  CLOUDINARY_FOLDER_MODE: z.enum(["dynamic", "fixed"]).default("dynamic"),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: httpUrl,
  NEXT_PUBLIC_SITE_URL: httpUrl,
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.string().regex(/^[1-9]\d{7,14}$/),
});
const result = envSchema.safeParse(process.env);
if (!result.success) {
  const fields = [...new Set(result.error.issues.map((issue) => issue.path.join(".")))];
  throw new Error(`Invalid or missing environment variables: ${fields.join(", ")}. See .env.example.`);
}
export const env = Object.freeze(result.data);
