import "server-only";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { User } from "@/models";
import { connectDB } from "@/lib/db";
import { env } from "@/lib/env";
import { withinRateLimit } from "@/lib/rate-limit";
import { MediaApiError } from "./errors";
export { MediaApiError } from "./errors";
export async function requireMediaAdmin(request?: Request) {
  const session = await auth();
  if (!session?.user.id) throw new MediaApiError(401, "UNAUTHORIZED");
  await connectDB();
  const user = await User.findById(session.user.id).activeOnly();
  if (!user || !["superadmin", "admin", "editor"].includes(user.role)) throw new MediaApiError(403, "FORBIDDEN");
  if (request && request.method !== "GET") {
    const origin = request.headers.get("origin");
    const allowed = [new URL(env.NEXTAUTH_URL).origin, new URL(env.NEXT_PUBLIC_SITE_URL).origin];
    if (!origin || !allowed.includes(origin)) throw new MediaApiError(403, "FORBIDDEN");
  }
  if (request && !await withinRateLimit("media:" + user.id, 180, 60000)) throw new MediaApiError(429, "RATE_LIMITED");
  return user;
}
export async function readJson(request: Request): Promise<unknown> {
  if (!request.headers.get("content-type")?.includes("application/json")) throw new MediaApiError(400, "VALIDATION");
  const reader = request.body?.getReader();
  if (!reader) throw new MediaApiError(400, "VALIDATION");
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 65536) { await reader.cancel(); throw new MediaApiError(413, "VALIDATION"); }
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
  } catch (error) {
    if (error instanceof MediaApiError) throw error;
    throw new MediaApiError(400, "VALIDATION");
  } finally { reader.releaseLock(); }
}
export function json(value: unknown, status = 200): Response {
  return Response.json(value, { status, headers: { "Cache-Control": "private, no-store" } });
}
export function apiFailure(error: unknown): Response {
  if (error instanceof MediaApiError) return json({ error: error.code, usages: error.usages }, error.status);
  if (error instanceof z.ZodError) return json({ error: "VALIDATION" }, 400);
  if (error instanceof Error && ["ValidationError", "CastError"].includes(error.name)) return json({ error: "VALIDATION" }, 400);
  if (error instanceof Error && error.name === "VersionError") return json({ error: "CONFLICT" }, 409);
  console.error("Media operation failed."); // Never expose credentials/provider payloads.
  return json({ error: "SERVICE_UNAVAILABLE" }, 503);
}
