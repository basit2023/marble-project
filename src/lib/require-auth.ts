import "server-only";
import { auth } from "./auth";
import { connectDB } from "./db";
import { User } from "@/models";
import { AuthError } from "./auth-errors";
import type { AdminRole } from "./permissions";

export async function requireAuth(roles?: readonly AdminRole[], options?: { allowForcedChange?: boolean }) {
  const session = await auth();
  if (!session?.user.id) throw new AuthError(401, "UNAUTHORIZED");
  await connectDB();
  const user = await User.findById(session.user.id).activeOnly().lean();
  if (!user) throw new AuthError(401, "UNAUTHORIZED");
  if (roles && !roles.includes(user.role)) throw new AuthError(403, "FORBIDDEN");
  if (user.forcePasswordChange && !options?.allowForcedChange) throw new AuthError(403, "PASSWORD_CHANGE_REQUIRED");
  return { ...session, user: { ...session.user, id: user._id.toString(), name: user.name, email: user.email, role: user.role, forcePasswordChange: user.forcePasswordChange } };
}
