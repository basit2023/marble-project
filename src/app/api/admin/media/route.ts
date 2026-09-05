import { requireMediaAdmin, readJson, json, apiFailure } from "@/lib/media/http";
import { createMediaSchema, listMediaSchema } from "@/lib/media/contracts";
import { registerMedia, listMedia } from "@/lib/media/service";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const user = await requireMediaAdmin(request);
    return json(await registerMedia(user._id, createMediaSchema.parse(await readJson(request))), 201);
  } catch (error) { return apiFailure(error); }
}
export async function GET(request: Request) {
  try {
    await requireMediaAdmin(request);
    return json(await listMedia(listMediaSchema.parse(Object.fromEntries(new URL(request.url).searchParams))));
  } catch (error) { return apiFailure(error); }
}
