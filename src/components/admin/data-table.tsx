"use client";
import Link from "next/link";
import type { Route } from "next";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Copy, Eye, GripVertical, Pencil, Trash2 } from "lucide-react";
import type { AdminCopy } from "@/lib/admin/copy-schema";
import type { ResourceConfig } from "@/lib/admin/resources";
import type { AdminRole } from "@/lib/permissions";
import { can } from "@/lib/permissions";
import { adminRequest, AdminClientError } from "@/lib/admin/client";
import { Toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { cn, formatDate } from "@/lib/utils";

export type AdminRow = Record<string, unknown> & { _id: string; isActive: boolean; isDeleted: boolean; sortOrder: number; updatedAt?: string };
interface ListResult { records: AdminRow[]; total: number; page: number; pageSize: number }
function display(value: unknown): string {
  if (value === undefined || value === null || value === "") return "—";
  if (Array.isArray(value)) return value.map(String).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
export function DataTable({ config, copy, role, initialState = "all", status }: {
  config: ResourceConfig; copy: AdminCopy; role: AdminRole; initialState?: "all" | "active" | "inactive" | "deleted"; status?: string;
}) {
  const [rows, setRows] = useState<AdminRow[]>([]), [total, setTotal] = useState(0), [page, setPage] = useState(1);
  const [search, setSearch] = useState(""), [submittedSearch, setSubmittedSearch] = useState("");
  const [state, setState] = useState(initialState), [sort, setSort] = useState("sortOrder"), [direction, setDirection] = useState<"asc" | "desc">("asc");
  const [selected, setSelected] = useState<Set<string>>(new Set()), [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const dragged = useRef<number | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ page: String(page), search: submittedSearch, state, sort, direction });
      if (status) query.set("status", status);
      const result = await adminRequest<ListResult>(`/api/admin/resources/${config.key}?${query}`);
      setRows(result.records); setTotal(result.total); setSelected(new Set());
    } catch (error) { setToast(copy.errors[error instanceof AdminClientError ? error.code : "UNKNOWN"] ?? copy.labels.failed); }
    finally { setLoading(false); }
  }, [config.key, copy, direction, page, sort, state, status, submittedSearch]);
  useEffect(() => { void load(); }, [load]);
  const columns = useMemo(() => {
    const preferred = config.fields.filter((field) => ["text", "email", "select", "number", "date", "datetime"].includes(field.kind)).slice(0, 3);
    return preferred.some((field) => field.path === config.titleField) ? preferred : [{ path: config.titleField, kind: "text" as const }, ...preferred].slice(0, 3);
  }, [config]);
  async function toggle(row: AdminRow) {
    const active = !row.isActive;
    setRows((current) => current.map((item) => item._id === row._id ? { ...item, isActive: active } : item));
    try {
      await adminRequest(`/api/admin/resources/${config.key}/${row._id}/toggle`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: active }),
      });
      setToast(copy.labels.rowUpdated);
    } catch (error) {
      setRows((current) => current.map((item) => item._id === row._id ? { ...item, isActive: row.isActive } : item));
      setToast(copy.errors[error instanceof AdminClientError ? error.code : "UNKNOWN"] ?? copy.labels.failed);
    }
  }
  async function bulk(action: "enable" | "disable" | "delete") {
    if (!selected.size || action === "delete" && !window.confirm(copy.labels.confirmDelete)) return;
    try {
      await adminRequest(`/api/admin/resources/${config.key}/bulk`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: [...selected], action }),
      });
      setToast(copy.labels.bulkUpdated); await load();
    } catch (error) { setToast(copy.errors[error instanceof AdminClientError ? error.code : "UNKNOWN"] ?? copy.labels.failed); }
  }
  async function reorderRows(from: number, to: number) {
    if (from === to) return;
    const next = [...rows]; const [item] = next.splice(from, 1); next.splice(to, 0, item); setRows(next);
    try {
      await adminRequest(`/api/admin/resources/${config.key}/reorder`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderedIds: next.map((row) => row._id) }),
      });
      setToast(copy.labels.orderSaved);
    } catch (error) { setRows(rows); setToast(copy.errors[error instanceof AdminClientError ? error.code : "UNKNOWN"] ?? copy.labels.failed); }
  }
  async function rowAction(action: "duplicate" | "delete", row: AdminRow) {
    if (action === "delete" && !window.confirm(copy.labels.confirmDelete)) return;
    try {
      await adminRequest(`/api/admin/resources/${config.key}/${row._id}${action === "duplicate" ? "/duplicate" : ""}`, { method: action === "duplicate" ? "POST" : "DELETE" });
      setToast(action === "duplicate" ? copy.labels.duplicated : copy.labels.deletedSuccess); await load();
    } catch (error) { setToast(copy.errors[error instanceof AdminClientError ? error.code : "UNKNOWN"] ?? copy.labels.failed); }
  }
  const allSelected = rows.length > 0 && rows.every((row) => selected.has(row._id));
  return <div className="grid gap-4">
    <div className="flex flex-wrap items-end gap-3">
      <form onSubmit={(event) => { event.preventDefault(); setPage(1); setSubmittedSearch(search); }} className="flex min-w-64 flex-1 gap-2">
        <label className="grid flex-1 gap-1 text-xs">{copy.labels.search}<input value={search} onChange={(event) => setSearch(event.target.value)} className="min-h-11 border border-black/20 bg-white px-3" /></label>
        <Button type="submit">{copy.labels.search}</Button>
      </form>
      <label className="grid gap-1 text-xs">{copy.labels.filter}<select value={state} onChange={(event) => { setState(event.target.value as typeof state); setPage(1); }} className="min-h-11 border border-black/20 bg-white px-3">
        {(["all", "active", "inactive", "deleted"] as const).map((value) => <option key={value} value={value}>{copy.labels[value]}</option>)}
      </select></label>
      {selected.size > 0 && <div className="flex flex-wrap gap-2" aria-label={copy.labels.bulkActions}>
        {can(role, "toggle", config.resource) && <><Button onClick={() => void bulk("enable")}>{copy.labels.enable}</Button><Button onClick={() => void bulk("disable")}>{copy.labels.disable}</Button></>}
        {can(role, "delete", config.resource) && <Button onClick={() => void bulk("delete")}>{copy.labels.delete}</Button>}
      </div>}
    </div>
    <div className="overflow-x-auto border border-black/10 bg-white" role="region" aria-label={copy.modules[config.key].plural} tabIndex={0}>
      <table className="w-full min-w-[760px] border-collapse text-sm">
        <thead className="bg-charcoal text-left text-ivory"><tr>
          <th className="w-12 p-3"><input type="checkbox" checked={allSelected} aria-label={copy.labels.selectAll} onChange={() => setSelected(allSelected ? new Set() : new Set(rows.map((row) => row._id)))} /></th>
          <th className="w-10 p-3">{copy.labels.reorder}</th>
          {columns.map((column) => <th key={column.path} className="p-3"><button type="button" className="text-left" onClick={() => { setSort(column.path); setDirection(sort === column.path && direction === "asc" ? "desc" : "asc"); }}>{copy.fields[column.path.split(".").at(-1) ?? column.path]}</button></th>)}
          <th className="p-3">{copy.labels.active}</th><th className="p-3">{copy.fields.updatedAt ?? copy.labels.actions}</th><th className="p-3">{copy.labels.actions}</th>
        </tr></thead>
        <tbody aria-busy={loading}>{rows.map((row, index) => <tr key={row._id} draggable={can(role, "edit", config.resource)}
          onDragStart={() => { dragged.current = index; }} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (dragged.current !== null) void reorderRows(dragged.current, index); dragged.current = null; }}
          className={cn("border-b border-black/10", config.key === "inquiries" && !row.isRead && "font-bold")}>
          <td className="p-3"><input type="checkbox" checked={selected.has(row._id)} aria-label={copy.labels.selectRow} onChange={() => setSelected((current) => { const next = new Set(current); if (next.has(row._id)) next.delete(row._id); else next.add(row._id); return next; })} /></td>
          <td className="p-3"><GripVertical className="size-4 text-muted" /></td>
          {columns.map((column) => <td key={column.path} className="max-w-64 truncate p-3">{display(column.path.split(".").reduce<unknown>((value, key) => typeof value === "object" && value !== null ? (value as Record<string, unknown>)[key] : undefined, row))}</td>)}
          <td className="p-3"><button type="button" role="switch" aria-checked={row.isActive} disabled={!can(role, "toggle", config.resource) || row.isDeleted} onClick={() => void toggle(row)}
            className="relative h-6 w-11 rounded-full bg-black/20 disabled:opacity-40 aria-checked:bg-accent"><span className="absolute left-1 top-1 size-4 rounded-full bg-white transition-transform [[aria-checked=true]_&]:translate-x-5" /></button></td>
          <td className="whitespace-nowrap p-3">{row.updatedAt ? formatDate(row.updatedAt) : "—"}</td>
          <td className="p-3"><div className="flex">
            <Link href={`/admin/${config.key}/${row._id}` as Route} aria-label={copy.labels.edit} className="grid min-h-11 min-w-11 place-items-center"><Pencil className="size-4" /></Link>
            {!["users", "settings", "inquiries"].includes(config.key) && <button type="button" aria-label={copy.labels.duplicate} onClick={() => void rowAction("duplicate", row)} className="grid min-h-11 min-w-11 place-items-center"><Copy className="size-4" /></button>}
            {config.publicBase && typeof row[config.slugField ?? "slug"] === "string" && <Link target="_blank" href={`${config.publicBase}/${row[config.slugField ?? "slug"]}` as Route} aria-label={copy.labels.view} className="grid min-h-11 min-w-11 place-items-center"><Eye className="size-4" /></Link>}
            {can(role, "delete", config.resource) && <button type="button" aria-label={copy.labels.delete} onClick={() => void rowAction("delete", row)} className="grid min-h-11 min-w-11 place-items-center"><Trash2 className="size-4" /></button>}
          </div></td>
        </tr>)}</tbody>
      </table>
      {!loading && !rows.length && <p className="p-8 text-center text-muted">{copy.labels.noResults}</p>}
    </div>
    <div className="flex items-center justify-between">
      <p>{copy.labels.total}: {total}</p><div className="flex items-center gap-3"><Button disabled={page === 1} onClick={() => setPage((value) => value - 1)}>{copy.labels.previous}</Button>
      <span>{copy.labels.page} {page} {copy.labels.of} {Math.max(1, Math.ceil(total / 20))}</span>
      <Button disabled={page * 20 >= total} onClick={() => setPage((value) => value + 1)}>{copy.labels.next}</Button></div>
    </div>
    <Toast message={toast} dismissLabel={copy.labels.closeMenu} onDismiss={() => setToast(null)} />
  </div>;
}
