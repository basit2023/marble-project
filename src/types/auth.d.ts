import type { DefaultSession } from "next-auth";
import type { AdminRole } from "@/lib/permissions";
declare module "next-auth" {
  interface Session { user: DefaultSession["user"] & { id: string; role: AdminRole; forcePasswordChange: boolean } }
  interface User { role: AdminRole; forcePasswordChange: boolean }
}
declare module "next-auth/jwt" {
  interface JWT { role?: AdminRole; forcePasswordChange?: boolean }
}
