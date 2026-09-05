import { requireMediaAdmin, readJson, json, apiFailure, MediaApiError } from "@/lib/media/http";
import { idSchema, patchMediaSchema } from "@/lib/media/contracts";
import { patchMedia, deleteMedia } from "@/lib/media/service";
export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
export async function PATCH(request: Request, context: Context) {
  try {
    const user = await requireMediaAdmin(request);
    const id = idSchema.parse((await context.params).id);
    return json(await patchMedia(user._id, id, patchMediaSchema.parse(await readJson(request))));
  } catch (error) { return apiFailure(error); }
}
export async function DELETE(request: Request, context: Context) {
  try {
    const user = await requireMediaAdmin(request);
    const id = idSchema.parse((await context.params).id);
    const parameter = new URL(request.url).searchParams.get("hard");
    if (parameter !== null && parameter !== "true" && parameter !== "false") throw new MediaApiError(400, "VALIDATION");
    const hard = parameter === "true";
    if (hard && (user.role === "editor" || request.headers.get("x-confirm-delete") !== id)) throw new MediaApiError(403, "FORBIDDEN");
    await deleteMedia(user._id, id, hard);
    return json({ success: true });
  } catch (error) { return apiFailure(error); }
}
