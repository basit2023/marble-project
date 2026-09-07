import Link from "next/link";
import type { Route } from "next";
import { Plus } from "lucide-react";
import { PageHeader } from "./page-header";
import { DataTable } from "./data-table";
import type { ResourceConfig } from "@/lib/admin/resources";
import type { AdminCopy } from "@/lib/admin/copy-schema";
import type { AdminRole } from "@/lib/permissions";
import { can } from "@/lib/permissions";
export function ResourceListPage({ config, copy, role }: { config: ResourceConfig; copy: AdminCopy; role: AdminRole }) {
  const moduleCopy = copy.modules[config.key];
  return <><PageHeader title={moduleCopy.plural} description={moduleCopy.description} action={can(role, "create", config.resource) && !config.singleton
    ? <Link href={`/admin/${config.key}/new` as Route} className="inline-flex min-h-11 items-center gap-2 bg-charcoal px-4 text-sm text-ivory"><Plus className="size-4" />{copy.labels.create}</Link> : undefined} />
    <DataTable config={config} copy={copy} role={role} /></>;
}
