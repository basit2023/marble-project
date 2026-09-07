import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/require-auth";
import { getAdminCopy } from "@/lib/admin/copy";
import { isResourceKey, resources } from "@/lib/admin/resources";
import { ResourceListPage } from "@/components/admin/resource-list-page";
export default async function ResourcePage({ params }: { params: Promise<{ resource: string }> }) {
  const key = (await params).resource;
  if (!isResourceKey(key)) notFound();
  const [session, copy] = await Promise.all([requireAuth(), getAdminCopy()]);
  if (!copy || key === "settings") notFound();
  if (key === "users" && session.user.role !== "superadmin") notFound();
  return <ResourceListPage config={resources[key]} copy={copy} role={session.user.role} />;
}
