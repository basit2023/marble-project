import "server-only";
import { z } from "zod";
import { Types } from "mongoose";
import { env } from "@/lib/env";
import { requireAuth } from "@/lib/require-auth";
import { AuthError } from "@/lib/auth-errors";
import { can, type AdminAction, type AdminResource } from "@/lib/permissions";

export class AdminApiError extends Error {
  constructor(public status: number, public code: "VALIDATION" | "NOT_FOUND" | "CONFLICT" | "IN_USE" | "SERVICE_UNAVAILABLE") { super(code); }
}
export async function requireAdminAction(request: Request, resource: AdminResource, action: AdminAction, options?: { allowForcedChange?: boolean }) {
  const session = await requireAuth(undefined, options);
  if (!can(session.user.role, action, resource)) throw new AuthError(403, "FORBIDDEN");
  if (request.method !== "GET") {
    const origin = request.headers.get("origin");
    const allowed = new Set([new URL(env.NEXTAUTH_URL).origin, new URL(env.NEXT_PUBLIC_SITE_URL).origin]);
    if (!origin || !allowed.has(origin)) throw new AuthError(403, "FORBIDDEN");
  }
  return { session, actorId: new Types.ObjectId(session.user.id) };
}
export async function parseJson(request: Request): Promise<unknown> {
  const type = request.headers.get("content-type");
  if (!type?.includes("application/json")) throw new AdminApiError(400, "VALIDATION");
  const text = await request.text();
  if (Buffer.byteLength(text) > 256 * 1024) throw new AdminApiError(413, "VALIDATION");
  try { return JSON.parse(text) as unknown; } catch { throw new AdminApiError(400, "VALIDATION"); }
}
export function adminJson(value: unknown, status = 200): Response {
  return Response.json(value, { status, headers: { "Cache-Control": "private, no-store" } });
}
export function adminFailure(error: unknown): Response {
  if (error instanceof AuthError) return adminJson({ error: error.code }, error.status);
  if (error instanceof AdminApiError) return adminJson({ error: error.code }, error.status);
  if (error instanceof z.ZodError || error instanceof Error && ["ValidationError", "CastError", "StrictModeError"].includes(error.name)) {
    return adminJson({ error: "VALIDATION" }, 400);
  }
  if (error instanceof Error && error.name === "VersionError") return adminJson({ error: "CONFLICT" }, 409);
  if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) return adminJson({ error: "CONFLICT" }, 409);
  console.error("Admin operation failed.");
  return adminJson({ error: "SERVICE_UNAVAILABLE" }, 503);
}
