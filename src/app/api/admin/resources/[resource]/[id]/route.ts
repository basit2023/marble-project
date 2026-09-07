import { z } from "zod";
import { getResourceConfig, isResourceKey } from "@/lib/admin/resources";
import { mutationSchema, getRecord, updateRecord, deleteRecord } from "@/lib/admin/service";
import { requireAdminAction, parseJson, adminJson, adminFailure, AdminApiError } from "@/lib/admin/http";
const idSchema = z.string().regex(/^[a-f\d]{24}$/i);
type Context = { params: Promise<{ resource: string; id: string }> };
export const runtime = "nodejs";
async function params(context: Context) {
  const { resource, id } = await context.params;
  if (!isResourceKey(resource)) throw new AdminApiError(404, "NOT_FOUND");
  return { key: resource, id: idSchema.parse(id), config: getResourceConfig(resource) };
}
export async function GET(request: Request, context: Context) {
  try {
    const { key, id, config } = await params(context);
    await requireAdminAction(request, config.resource, "view");
    return adminJson(await getRecord(key, id));
  } catch (error) { return adminFailure(error); }
}
export async function PATCH(request: Request, context: Context) {
  try {
    const { key, id, config } = await params(context);
    const { actorId } = await requireAdminAction(request, config.resource, config.resource === "users" ? "manageUsers" : "edit");
    return adminJson(await updateRecord(key, id, actorId, mutationSchema.parse(await parseJson(request))));
  } catch (error) { return adminFailure(error); }
}
export async function DELETE(request: Request, context: Context) {
  try {
    const { key, id, config } = await params(context);
    const hard = new URL(request.url).searchParams.get("hard") === "true";
    const { actorId } = await requireAdminAction(request, config.resource, hard ? "hardDelete" : "delete");
    if (hard && request.headers.get("x-confirm-delete") !== id) throw new AdminApiError(400, "VALIDATION");
    await deleteRecord(key, id, actorId, hard);
    return adminJson({ success: true });
  } catch (error) { return adminFailure(error); }
}
