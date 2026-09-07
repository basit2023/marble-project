import "server-only";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { authConfig } from "./auth.config";
import { env } from "./env";
import { User, AuditLog } from "@/models";
import { connectDB } from "./db";
import { verifyPassword } from "./password";
import { withinRateLimit } from "./rate-limit";
import { getRequestIp } from "./request-ip";
import type { AdminRole } from "./permissions";

const credentialsSchema = z.object({ email: z.email().trim().toLowerCase(), password: z.string().min(1).max(256) });
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: env.NEXTAUTH_SECRET,
  providers: [Credentials({
    credentials: { email: { type: "email" }, password: { type: "password" } },
    async authorize(input, request) {
      const ip = getRequestIp(request.headers);
      if (!await withinRateLimit("login-ip:" + ip, 5, 15 * 60 * 1000)) return null;
      const parsed = credentialsSchema.safeParse(input);
      if (!parsed.success) { await verifyPassword("", ""); return null; }
      const db = await connectDB();
      const user = await User.findOne({ email: parsed.data.email }).activeOnly().select("+passwordHash");
      if (!await verifyPassword(parsed.data.password, user?.passwordHash ?? "") || !user) return null;
      await db.connection.transaction(async (session) => {
        user.lastLoginAt = new Date();
        user.updatedBy = user._id;
        await user.save({ session });
        await AuditLog.create([{ user: user._id, action: "login", collectionName: "users", documentId: user._id, changes: {}, ipAddress: ip === "unknown" ? undefined : ip }], { session });
      });
      return { id: user._id.toString(), name: user.name, email: user.email, role: user.role, forcePasswordChange: user.forcePasswordChange };
    },
  })],
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
        token.forcePasswordChange = user.forcePasswordChange;
      }
      if (trigger === "update" && session?.forcePasswordChange === false) token.forcePasswordChange = false;
      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub ?? "";
      session.user.role = (token.role ?? "editor") as AdminRole;
      session.user.forcePasswordChange = Boolean(token.forcePasswordChange);
      return session;
    },
  },
  logger: { error() { console.error("Authentication failed."); } },
});
