import { z } from "zod";
import { getResourceConfig, isResourceKey } from "@/lib/admin/resources";
import { checkSlug } from "@/lib/admin/service";
import { requireAdminAction, adminJson, adminFailure, AdminApiError } from "@/lib/admin/http";
const querySchema = z.object({ slug: z.string().min(1).max(200), exclude: z.string().regex(/^[a-f\d]{24}$/i).optional() });
type Context = { params: Promise<{ resource: string }> };
export const runtime = "nodejs";
export async function GET(request: Request, context: Context) {
  try {
    const key = (await context.params).resource;
    if (!isResourceKey(key)) throw new AdminApiError(404, "NOT_FOUND");
    const config = getResourceConfig(key);
    await requireAdminAction(request, config.resource, "view");
    const input = querySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    return adminJson(await checkSlug(key, input.slug, input.exclude));
  } catch (error) { return adminFailure(error); }
}
