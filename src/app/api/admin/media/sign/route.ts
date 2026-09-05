import { requireMediaAdmin, readJson, json, apiFailure } from "@/lib/media/http";
import { signInputSchema } from "@/lib/media/contracts";
import { createUploadSignature } from "@/lib/media/cloud";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const user = await requireMediaAdmin(request);
    return json(createUploadSignature(user._id.toString(), signInputSchema.parse(await readJson(request))));
  } catch (error) { return apiFailure(error); }
}
