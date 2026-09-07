"use client";
import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useState, type ReactNode } from "react";
import { BarChart3, Images, FolderTree, Gem, Building2, CalendarDays, Newspaper, Quote, CircleHelp, PanelsTopLeft, Menu as MenuIcon, MessageSquare, Settings, Users, Search, ChevronLeft, ExternalLink, X, UserRound } from "lucide-react";
import type { AdminCopy } from "@/lib/admin/copy-schema";
import type { AdminRole } from "@/lib/permissions";
import { cn } from "@/lib/utils";

const nav = [
  ["dashboard", "/admin", BarChart3], ["media", "/admin/media", Images], ["categories", "/admin/categories", FolderTree],
  ["products", "/admin/products", Gem], ["projects", "/admin/projects", Building2], ["exhibitions", "/admin/exhibitions", CalendarDays],
  ["blog", "/admin/blog", Newspaper], ["testimonials", "/admin/testimonials", Quote], ["faqs", "/admin/faqs", CircleHelp],
  ["home-sections", "/admin/home-sections", PanelsTopLeft], ["navigation", "/admin/navigation", MenuIcon],
  ["inquiries", "/admin/inquiries", MessageSquare], ["seo", "/admin/seo", Search],
  ["settings", "/admin/settings", Settings], ["users", "/admin/users", Users],
] as const;
const NAV_FALLBACK: Record<string, string> = { seo: "SEO Health" };
export function AdminShell({ copy, user, unread, children }: {
  copy: AdminCopy; user: { name?: string | null; email?: string | null; role: AdminRole }; unread: number; children: ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false), [drawer, setDrawer] = useState(false), [account, setAccount] = useState(false);
  useEffect(() => setDrawer(false), [pathname]);
  const items = nav.filter(([key]) => key !== "users" || user.role === "superadmin");
  const sidebar = <div className="flex h-full flex-col bg-charcoal text-ivory">
    <div className="flex min-h-20 items-center justify-between border-b border-white/10 px-4">
      {!collapsed && <span className="font-heading text-xl">{copy.brand}</span>}
      <button type="button" className="hidden min-h-11 min-w-11 place-items-center lg:grid" aria-label={collapsed ? copy.labels.expand : copy.labels.collapse} onClick={() => setCollapsed((value) => !value)}><ChevronLeft className={cn("size-5 transition-transform", collapsed && "rotate-180")} /></button>
      <button type="button" className="grid min-h-11 min-w-11 place-items-center lg:hidden" aria-label={copy.labels.closeMenu} onClick={() => setDrawer(false)}><X className="size-5" /></button>
    </div>
    <nav className="flex-1 overflow-y-auto p-2" aria-label={copy.brand}>
      {items.map(([key, href, Icon]) => {
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
        const label = copy.navigation[key] ?? NAV_FALLBACK[key] ?? key;
        return <Link key={key} href={href as Route} title={collapsed ? label : undefined}
          className={cn("my-1 flex min-h-11 items-center gap-3 rounded px-3 text-sm text-white/75 hover:bg-white/10 hover:text-white focus-visible:outline-offset-[-2px]", active && "bg-white/10 text-white")}>
          <Icon className="size-5 shrink-0" />{!collapsed && <span className="flex-1">{label}</span>}
          {!collapsed && key === "inquiries" && unread > 0 && <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-white">{unread}</span>}
        </Link>;
      })}
    </nav>
  </div>;
  return <div className="min-h-dvh bg-[#f4f1e9] text-charcoal">
    <aside className={cn("fixed inset-y-0 left-0 z-40 hidden transition-[width] lg:block", collapsed ? "w-16" : "w-64")}>{sidebar}</aside>
    {drawer && <div className="fixed inset-0 z-50 lg:hidden"><button type="button" aria-label={copy.labels.closeMenu} className="absolute inset-0 bg-black/60" onClick={() => setDrawer(false)} /><aside className="relative h-full w-72 max-w-[85vw]">{sidebar}</aside></div>}
    <div className={cn("transition-[padding] lg:pl-64", collapsed && "lg:pl-16")}>
      <div className="flex min-h-16 items-center justify-between border-b border-black/10 bg-ivory px-4 md:px-8">
        <button type="button" className="grid min-h-11 min-w-11 place-items-center lg:hidden" aria-label={copy.labels.openMenu} onClick={() => setDrawer(true)}><MenuIcon className="size-5" /></button>
        <Link href="/" target="_blank" className="ml-auto flex min-h-11 items-center gap-2 px-3 text-sm"><ExternalLink className="size-4" />{copy.labels.viewSite}</Link>
        <div className="relative">
          <button type="button" aria-expanded={account} aria-label={copy.labels.accountMenu} onClick={() => setAccount((value) => !value)} className="flex min-h-11 items-center gap-2 px-3">
            <UserRound className="size-5" /><span className="hidden text-left text-sm sm:block">{user.name}<small className="block text-muted">{user.role}</small></span>
          </button>
          {account && <div className="absolute right-0 z-30 w-52 border border-black/10 bg-ivory p-2 shadow-xl">
            <Link href="/admin/change-password" className="flex min-h-11 items-center px-3 text-sm">{copy.labels.changePassword}</Link>
            <button type="button" onClick={() => signOut({ callbackUrl: "/admin/login" })} className="min-h-11 w-full px-3 text-left text-sm">{copy.labels.signOut}</button>
          </div>}
        </div>
      </div>
      <main className="px-4 pb-10 md:px-8">{children}</main>
    </div>
  </div>;
}
