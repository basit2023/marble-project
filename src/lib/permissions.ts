import type { IUser } from "@/types/user";
export const ADMIN_ROLES = ["superadmin", "admin", "editor"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];
export type AdminAction = "view" | "create" | "edit" | "toggle" | "delete" | "hardDelete" | "manageUsers";
export type AdminResource =
  | "dashboard" | "media" | "categories" | "products" | "projects" | "exhibitions"
  | "blog" | "testimonials" | "faqs" | "home-sections" | "navigation"
  | "inquiries" | "settings" | "users" | "audit";
export function can(role: IUser["role"], action: AdminAction, resource: AdminResource): boolean {
  if (role === "superadmin") return true;
  if (action === "hardDelete" || action === "manageUsers" || resource === "users") return false;
  if (role === "admin") return true;
  if (action === "delete") return false;
  if (action === "toggle" && (resource === "categories" || resource === "settings")) return false;
  return true;
}
