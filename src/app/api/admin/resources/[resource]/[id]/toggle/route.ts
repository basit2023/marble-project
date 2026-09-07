import { z } from "zod";
import { getResourceConfig, isResourceKey } from "@/lib/admin/resources";
import { toggleRecord } from "@/lib/admin/service";
import { requireAdminAction, parseJson, adminJson, adminFailure, AdminApiError } from "@/lib/admin/http";
const inputSchema = z.object({ isActive: z.boolean() }).strict();
const idSchema = z.string().regex(/^[a-f\d]{24}$/i);
type Context = { params: Promise<{ resource: string; id: string }> };
export const runtime = "nodejs";
export async function PATCH(request: Request, context: Context) {
  try {
    const { resource, id } = await context.params;
    if (!isResourceKey(resource)) throw new AdminApiError(404, "NOT_FOUND");
    const config = getResourceConfig(resource);
    const { actorId } = await requireAdminAction(request, config.resource, "toggle");
    const input = inputSchema.parse(await parseJson(request));
    return adminJson(await toggleRecord(resource, idSchema.parse(id), actorId, input.isActive));
  } catch (error) { return adminFailure(error); }
}
