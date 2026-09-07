import { z } from "zod";
import { getResourceConfig, isResourceKey } from "@/lib/admin/resources";
import { duplicateRecord } from "@/lib/admin/service";
import { requireAdminAction, adminJson, adminFailure, AdminApiError } from "@/lib/admin/http";
const idSchema = z.string().regex(/^[a-f\d]{24}$/i);
type Context = { params: Promise<{ resource: string; id: string }> };
export const runtime = "nodejs";
export async function POST(request: Request, context: Context) {
  try {
    const { resource, id } = await context.params;
    if (!isResourceKey(resource)) throw new AdminApiError(404, "NOT_FOUND");
    const config = getResourceConfig(resource);
    const { actorId } = await requireAdminAction(request, config.resource, "create");
    return adminJson(await duplicateRecord(resource, idSchema.parse(id), actorId), 201);
  } catch (error) { return adminFailure(error); }
}
