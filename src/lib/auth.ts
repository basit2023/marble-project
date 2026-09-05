import "server-only";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { env } from "./env";
import { User, AuditLog } from "@/models";
import { connectDB } from "./db";
import { verifyPassword } from "./password";
import { withinRateLimit } from "./rate-limit";

const credentialsSchema = z.object({ email: z.email().trim().toLowerCase(), password: z.string().min(1).max(256) });
export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: env.NEXTAUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/admin/sign-in", error: "/admin/sign-in" },
  providers: [Credentials({
    credentials: { email: { type: "email" }, password: { type: "password" } },
    async authorize(input) {
      const parsed = credentialsSchema.safeParse(input);
      if (!parsed.success) return null;
      if (!await withinRateLimit("login:" + parsed.data.email, 10, 15 * 60 * 1000)) return null;
      const db = await connectDB();
      const user = await User.findOne({ email: parsed.data.email }).activeOnly().select("+passwordHash");
      if (!await verifyPassword(parsed.data.password, user?.passwordHash ?? "") || !user) return null;
      await db.connection.transaction(async (session) => {
        user.lastLoginAt = new Date();
        user.updatedBy = user._id;
        await user.save({ session });
        await AuditLog.create([{ user: user._id, action: "login", collectionName: "users", documentId: user._id, changes: {} }], { session });
      });
      return { id: user._id.toString(), name: user.name, email: user.email };
    },
  })],
  callbacks: {
    jwt({ token, user }) { if (user) token.sub = user.id; return token; },
    session({ session, token }) { session.user.id = token.sub ?? ""; return session; },
  },
  logger: { error() { console.error("Authentication failed."); } },
});

