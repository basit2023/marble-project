import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";
import { env } from "@/lib/env";
import { publicUploadSignSchema } from "@/lib/public/forms";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const parsed = publicUploadSignSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Unsupported upload." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  const extension = parsed.data.fileName.split(".").pop()?.toLowerCase() ?? "file";
  const folder = "marble-site/quotes";
  const timestamp = Math.floor(Date.now() / 1000);
  const params: Record<string, string> = {
    timestamp: String(timestamp),
    public_id: `${folder}/${randomUUID()}.${extension}`,
    overwrite: "false",
  };
  const signature = cloudinary.utils.api_sign_request(params, env.CLOUDINARY_API_SECRET);
  return NextResponse.json({
    uploadUrl: `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/auto/upload`,
    apiKey: env.CLOUDINARY_API_KEY,
    params: { ...params, signature },
  }, { headers: { "Cache-Control": "no-store" } });
}
