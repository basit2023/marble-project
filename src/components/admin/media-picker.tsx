"use client";
import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MediaUploader } from "./media-uploader";
import { mediaDeliveryUrl } from "@/lib/media/delivery";
import { mediaRequest, errorCode, reorder } from "@/lib/media/client";
import { mediaListSchema, UPLOAD_FOLDERS, type MediaDTO, type MediaErrorCode } from "@/lib/media/contracts";
import { MEDIA_CONTEXTS } from "@/types/enums";
import type { MediaCopy } from "@/lib/media/copy-schema";

const filtersSchema = z.object({ search: z.string().max(100), folder: z.string(), tag: z.string().max(60), usageContext: z.string(), state: z.enum(["active", "all", "deleted"]) });
type Filters = z.infer<typeof filtersSchema>;
const defaults: Filters = { search: "", folder: "", tag: "", usageContext: "", state: "active" };
export function MediaPicker({ open, onClose, value, onChange, copy, multiple = true, manage = false }: {
  open: boolean; onClose: () => void; value: MediaDTO[]; onChange: (items: MediaDTO[]) => void;
  copy: MediaCopy; multiple?: boolean; manage?: boolean;
}) {
  const [tab, setTab] = useState<"library" | "upload">("library");
  const [chosen, setChosen] = useState<MediaDTO[]>(value);
  const [items, setItems] = useState<MediaDTO[]>([]);
  const [filters, setFilters] = useState<Filters>(defaults);
  const [page, setPage] = useState(1), [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false), [error, setError] = useState<MediaErrorCode | null>(null);
  const [refresh, setRefresh] = useState(0);
  const dragged = useRef<number | null>(null);
  const prefix = useId();
  const { register, handleSubmit } = useForm<Filters>({ resolver: zodResolver(filtersSchema), defaultValues: defaults });
  useEffect(() => { if (open) setChosen(value); }, [open, value]);
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const params = new URLSearchParams({ page: String(page), state: manage ? filters.state : "active" });
    for (const key of ["search", "folder", "tag", "usageContext"] as const) if (filters[key]) params.set(key, filters[key]);
    setLoading(true); setError(null);
    mediaRequest("/api/admin/media?" + params, mediaListSchema, { signal: controller.signal })
      .then((result) => { if (!controller.signal.aborted) { setItems((current) => page === 1 ? result.items : [...current, ...result.items]); setTotal(result.total); } })
      .catch((failure: unknown) => { if (!controller.signal.aborted) setError(errorCode(failure)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [open, filters, page, manage, refresh]);
  function toggle(item: MediaDTO) {
    setChosen((current) => current.some((entry) => entry.id === item.id) ? current.filter((entry) => entry.id !== item.id) : multiple ? [...current, item] : [item]);
  }
  return <Modal open={open} onClose={onClose} title={copy.labels.heading} closeLabel={copy.labels.close} className="max-w-5xl">
    <div className="mb-6 flex gap-3" role="tablist" aria-label={copy.labels.heading}>
      {(["library", "upload"] as const).map((name, index) => <button key={name} id={prefix + name} type="button" role="tab"
        aria-selected={tab === name} aria-controls={prefix + name + "-panel"} tabIndex={tab === name ? 0 : -1}
        onKeyDown={(event) => {
          if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
            event.preventDefault();
            const next = event.key === "Home" ? "library" : event.key === "End" ? "upload" : index === 0 ? "upload" : "library";
            setTab(next); document.getElementById(prefix + next)?.focus();
          }
        }} onClick={() => setTab(name)} className="min-h-11 border-b-2 px-3 aria-selected:border-accent">
        {name === "library" ? copy.labels.libraryTab : copy.labels.uploadTab}
      </button>)}
    </div>
    <div role="tabpanel" id={prefix + "library-panel"} aria-labelledby={prefix + "library"} hidden={tab !== "library"}>
      <form onSubmit={handleSubmit((next) => { setFilters(next); setPage(1); })} className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Input id={prefix + "-search"} label={copy.labels.search} {...register("search")} />
        <Input id={prefix + "-tag"} label={copy.labels.tag} {...register("tag")} />
        <label className="grid gap-2">{copy.labels.folder}<select {...register("folder")} className="min-h-11 border border-muted bg-ivory p-2">
          <option value="">{copy.labels.all}</option>{UPLOAD_FOLDERS.map((folder) => <option key={folder} value={folder}>{copy.folders[folder]}</option>)}
        </select></label>
        <label className="grid gap-2">{copy.labels.usageContext}<select {...register("usageContext")} className="min-h-11 border border-muted bg-ivory p-2">
          <option value="">{copy.labels.all}</option>{MEDIA_CONTEXTS.map((context) => <option key={context} value={context}>{copy.contexts[context]}</option>)}
        </select></label>
        {manage && <label className="grid gap-2">{copy.labels.state}<select {...register("state")} className="min-h-11 border border-muted bg-ivory p-2">
          {(["active", "all", "deleted"] as const).map((state) => <option key={state} value={state}>{copy.labels[state]}</option>)}
        </select></label>}
        <Button type="submit">{copy.labels.filter}</Button>
      </form>
      {error && <div role="alert"><p>{copy.errors[error]}</p><button type="button" onClick={() => setRefresh((current) => current + 1)} className="min-h-11 underline">{copy.labels.retry}</button></div>}
      <p className="mb-3 text-sm">{copy.labels.total}: {total}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" aria-busy={loading}>
        {items.map((item) => <button key={item.id} type="button" aria-pressed={chosen.some((entry) => entry.id === item.id)}
          onClick={() => toggle(item)} className="overflow-hidden border border-muted text-left aria-pressed:ring-2 aria-pressed:ring-accent">
          <Image src={item.secureUrl} loader={({ width }) => mediaDeliveryUrl(item, width)} alt={item.altText} width={item.width} height={item.height}
            sizes="(max-width: 640px) 40vw, (max-width: 1024px) 25vw, 210px" className="aspect-[4/3] w-full object-cover" />
          <span className="block break-words p-2 text-sm">{item.altText}</span>
          {item.deletionStatus === "pending" && <span className="block p-2 text-sm">{copy.labels.deletionPending}</span>}
        </button>)}
      </div>
      {!loading && !items.length && <p>{copy.labels.empty}</p>}
      {loading && <p role="status">{copy.labels.loading}</p>}
      {items.length < total && <Button className="mt-4" disabled={loading} onClick={() => setPage((current) => current + 1)}>{copy.labels.loadMore}</Button>}
    </div>
    <div role="tabpanel" id={prefix + "upload-panel"} aria-labelledby={prefix + "upload"} hidden={tab !== "upload"}>
      <MediaUploader copy={copy} onUploaded={(item) => { setChosen((current) => multiple ? [...current.filter((entry) => entry.id !== item.id), item] : [item]); setPage(1); setRefresh((current) => current + 1); }} />
    </div>
    <section className="mt-8 border-t border-muted pt-6" aria-labelledby={prefix + "-selected"}>
      <h3 id={prefix + "-selected"}>{copy.labels.selectedCount}: {chosen.length}</h3>
      <p className="my-3 text-sm text-muted">{copy.labels.selectionHint}</p>
      <ol className="grid gap-2">
        {chosen.map((item, index) => <li key={item.id} draggable onDragStart={() => { dragged.current = index; }}
          onDragEnd={() => { dragged.current = null; }} onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => { event.preventDefault(); if (dragged.current !== null) setChosen((current) => reorder(current, dragged.current ?? index, index)); dragged.current = null; }}
          className="flex flex-wrap items-center gap-2 border border-muted p-2">
          <span className="min-w-0 flex-1 break-words">{item.altText}</span>
          <button type="button" disabled={index === 0} aria-label={copy.labels.moveEarlier + ": " + item.altText} onClick={() => setChosen((current) => reorder(current, index, index - 1))} className="min-h-11 px-2 disabled:opacity-40">↑</button>
          <button type="button" disabled={index === chosen.length - 1} aria-label={copy.labels.moveLater + ": " + item.altText} onClick={() => setChosen((current) => reorder(current, index, index + 1))} className="min-h-11 px-2 disabled:opacity-40">↓</button>
          <button type="button" onClick={() => toggle(item)} className="min-h-11 px-2 underline">{copy.labels.remove}</button>
        </li>)}
      </ol>
      <Button className="mt-4" onClick={() => { onChange(chosen); onClose(); }}>{copy.labels.confirmSelection}</Button>
    </section>
  </Modal>;
}

