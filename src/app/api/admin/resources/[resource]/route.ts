import { getResourceConfig, isResourceKey } from "@/lib/admin/resources";
import { listInputSchema, mutationSchema, listRecords, createRecord } from "@/lib/admin/service";
import { requireAdminAction, parseJson, adminJson, adminFailure, AdminApiError } from "@/lib/admin/http";
type Context = { params: Promise<{ resource: string }> };
export const runtime = "nodejs";
export async function GET(request: Request, context: Context) {
  try {
    const key = (await context.params).resource;
    if (!isResourceKey(key)) throw new AdminApiError(404, "NOT_FOUND");
    const config = getResourceConfig(key);
    await requireAdminAction(request, config.resource, "view");
    const query = Object.fromEntries(new URL(request.url).searchParams);
    return adminJson(await listRecords(key, listInputSchema.parse(query)));
  } catch (error) { return adminFailure(error); }
}
export async function POST(request: Request, context: Context) {
  try {
    const key = (await context.params).resource;
    if (!isResourceKey(key)) throw new AdminApiError(404, "NOT_FOUND");
    const config = getResourceConfig(key);
    const { actorId } = await requireAdminAction(request, config.resource, config.resource === "users" ? "manageUsers" : "create");
    return adminJson(await createRecord(key, actorId, mutationSchema.parse(await parseJson(request))), 201);
  } catch (error) { return adminFailure(error); }
}
