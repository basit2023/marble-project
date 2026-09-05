import "server-only";
import type { Metadata } from "next";
import { env } from "@/lib/env";
import type { ScreenCopy } from "@/types/content";

export function buildMetadata(copy: ScreenCopy, path: string): Metadata {
  const canonical = new URL(path, env.NEXT_PUBLIC_SITE_URL);
  if (canonical.origin !== new URL(env.NEXT_PUBLIC_SITE_URL).origin) throw new Error("Canonical must belong to this site.");
  return { title: copy.seoTitle, description: copy.seoDescription, metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL), alternates: { canonical } };
}
// Escape HTML-sensitive characters before embedding database-owned structured data.
export function serializeJsonLd(value: Record<string, unknown>): string {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}

