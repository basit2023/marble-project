import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAdminCopy } from "@/lib/admin/copy";
import { connectDB } from "@/lib/db";
import { Inquiry } from "@/models";
import { AdminShell } from "@/components/admin/admin-shell";
export const metadata: Metadata = { robots: { index: false, follow: false } };
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const [session, copy] = await Promise.all([auth(), getAdminCopy()]);
  if (!copy) notFound();
  if (!session?.user.id) return children;
  await connectDB();
  const unread = await Inquiry.countDocuments({ isDeleted: false, isRead: false });
  return <AdminShell copy={copy} user={session.user} unread={unread}>{children}</AdminShell>;
}
