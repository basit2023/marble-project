"use client";
import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useState, type ReactNode } from "react";
import { BarChart3, Images, FolderTree, Gem, Building2, CalendarDays, Newspaper, Quote, CircleHelp, PanelsTopLeft, Menu as MenuIcon, MessageSquare, Settings, Users, Search, ChevronLeft, ExternalLink, X } from "lucide-react";
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
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [account, setAccount] = useState(false);

  useEffect(() => setDrawer(false), [pathname]);

  const items = nav.filter(([key]) => key !== "users" || user.role === "superadmin");

  const sidebar = (
    <div className="flex h-full flex-col bg-[#090909] text-ivory border-r border-white/10 stone-vein">
      <div className="flex min-h-20 items-center justify-between border-b border-white/10 px-5">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded border border-accent/40 bg-accent/10 font-heading font-bold text-accent text-xs">A</span>
            <span className="font-heading text-lg font-bold uppercase tracking-wider text-white">{copy.brand}</span>
          </div>
        )}
        <button type="button" className="hidden size-9 place-items-center rounded border border-white/10 text-ivory/70 hover:border-accent hover:text-accent lg:grid" aria-label={collapsed ? copy.labels.expand : copy.labels.collapse} onClick={() => setCollapsed((value) => !value)}>
          <ChevronLeft className={cn("size-4 transition-transform", collapsed && "rotate-180")} />
        </button>
        <button type="button" className="grid size-9 place-items-center text-ivory/70 lg:hidden" aria-label={copy.labels.closeMenu} onClick={() => setDrawer(false)}>
          <X className="size-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1" aria-label={copy.brand}>
        {items.map(([key, href, Icon]) => {
          const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
          const label = copy.navigation[key] ?? NAV_FALLBACK[key] ?? key;
          return (
            <Link
              key={key}
              href={href as Route}
              title={collapsed ? label : undefined}
              className={cn(
                "group flex min-h-11 items-center gap-3 rounded px-3.5 text-xs font-semibold uppercase tracking-wider transition-colors",
                active
                  ? "bg-accent/15 border border-accent/40 text-accent font-bold shadow-md shadow-accent/10"
                  : "text-ivory/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className={cn("size-4 shrink-0 transition-colors", active ? "text-accent" : "text-ivory/60 group-hover:text-white")} />
              {!collapsed && <span className="flex-1 truncate">{label}</span>}
              {!collapsed && key === "inquiries" && unread > 0 && (
                <span className="rounded bg-accent px-2 py-0.5 text-[10px] font-bold text-charcoal shadow">{unread}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className="min-h-dvh bg-[#0c0c0c] text-ivory font-sans antialiased">
      <aside className={cn("fixed inset-y-0 left-0 z-40 hidden transition-[width] duration-300 lg:block", collapsed ? "w-16" : "w-64")}>
        {sidebar}
      </aside>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label={copy.labels.closeMenu} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setDrawer(false)} />
          <aside className="relative h-full w-72 max-w-[85vw]">{sidebar}</aside>
        </div>
      )}

      <div className={cn("transition-[padding] duration-300 lg:pl-64", collapsed && "lg:pl-16")}>
        <div className="flex min-h-16 items-center justify-between border-b border-white/10 bg-[#090909]/90 px-4 backdrop-blur-md md:px-8">
          <button type="button" className="grid size-10 place-items-center rounded border border-white/10 text-white lg:hidden" aria-label={copy.labels.openMenu} onClick={() => setDrawer(true)}>
            <MenuIcon className="size-5" />
          </button>

          <div className="ml-auto flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="inline-flex min-h-9 items-center gap-2 rounded border border-accent/40 bg-accent/10 px-3.5 text-xs font-bold uppercase tracking-wider text-accent transition-colors hover:bg-accent hover:text-charcoal"
            >
              <ExternalLink className="size-3.5" />
              <span>{copy.labels.viewSite}</span>
            </Link>

            <div className="relative">
              <button
                type="button"
                aria-expanded={account}
                aria-label={copy.labels.accountMenu}
                onClick={() => setAccount((value) => !value)}
                className="flex min-h-10 items-center gap-2.5 rounded border border-white/15 bg-white/5 px-3.5 text-xs font-semibold text-white transition-colors hover:border-accent"
              >
                <div className="grid size-6 place-items-center rounded-full bg-accent text-charcoal font-bold text-[10px]">
                  {(user.name ?? "A").charAt(0).toUpperCase()}
                </div>
                <span className="hidden text-left sm:block">
                  <span className="block leading-none">{user.name}</span>
                  <span className="block text-[9px] uppercase tracking-wider text-accent font-bold mt-0.5">{user.role}</span>
                </span>
              </button>

              {account && (
                <div className="absolute right-0 z-50 mt-2 w-56 rounded-sm border border-white/15 bg-[#121212] p-2 shadow-2xl stone-vein">
                  <Link href="/admin/change-password" className="block rounded px-3 py-2.5 text-xs text-ivory/80 hover:bg-white/10 hover:text-white transition-colors">
                    {copy.labels.changePassword}
                  </Link>
                  <button type="button" onClick={() => signOut({ callbackUrl: "/admin/login" })} className="w-full text-left rounded px-3 py-2.5 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors">
                    {copy.labels.signOut}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

