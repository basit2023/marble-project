import { z } from "zod";
import { connectDB } from "@/lib/db";
import { User, AuditLog } from "@/models";
import { verifyPassword, hashPassword } from "@/lib/password";
import { requireAdminAction, parseJson, adminJson, adminFailure } from "@/lib/admin/http";
import { AuthError } from "@/lib/auth-errors";
const password = z.string().min(12).max(128).regex(/[a-z]/).regex(/[A-Z]/).regex(/\d/).regex(/[^A-Za-z0-9]/);
const inputSchema = z.object({ currentPassword: z.string().min(1).max(256), newPassword: password }).strict()
  .refine((value) => value.currentPassword !== value.newPassword, { path: ["newPassword"] });
export const runtime = "nodejs";
export async function PATCH(request: Request) {
  try {
    const { actorId } = await requireAdminAction(request, "dashboard", "edit", { allowForcedChange: true });
    const input = inputSchema.parse(await parseJson(request));
    const db = await connectDB();
    const user = await User.findById(actorId).select("+passwordHash");
    if (!user || !await verifyPassword(input.currentPassword, user.passwordHash)) throw new AuthError(401, "UNAUTHORIZED");
    const passwordHash = await hashPassword(input.newPassword);
    await db.connection.transaction(async (session) => {
      const current = await User.findById(actorId).select("+passwordHash").session(session);
      if (!current || !await verifyPassword(input.currentPassword, current.passwordHash)) throw new AuthError(401, "UNAUTHORIZED");
      current.passwordHash = passwordHash;
      current.forcePasswordChange = false;
      current.updatedBy = actorId;
      await current.save({ session });
      await AuditLog.create([{ user: actorId, action: "update", collectionName: "users", documentId: actorId, changes: { passwordChanged: true, forcePasswordChange: false } }], { session });
    });
    return adminJson({ success: true });
  } catch (error) { return adminFailure(error); }
}
