import { getResourceConfig, isResourceKey } from "@/lib/admin/resources";
import { bulkSchema, bulkMutate } from "@/lib/admin/service";
import { requireAdminAction, parseJson, adminJson, adminFailure, AdminApiError } from "@/lib/admin/http";
type Context = { params: Promise<{ resource: string }> };
export const runtime = "nodejs";
export async function POST(request: Request, context: Context) {
  try {
    const key = (await context.params).resource;
    if (!isResourceKey(key)) throw new AdminApiError(404, "NOT_FOUND");
    const config = getResourceConfig(key);
    const input = bulkSchema.parse(await parseJson(request));
    const action = input.action === "delete" ? "delete" : "toggle";
    const { actorId } = await requireAdminAction(request, config.resource, action);
    await bulkMutate(key, actorId, input);
    return adminJson({ success: true });
  } catch (error) { return adminFailure(error); }
}
