import type { NextAuthConfig } from "next-auth";

// This module stays Edge-safe for middleware. Database and password work live in auth.ts.
export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/admin/login", error: "/admin/login" },
  providers: [],
  callbacks: {
    authorized({ auth }) { return Boolean(auth?.user?.id); },
  },
} satisfies NextAuthConfig;
