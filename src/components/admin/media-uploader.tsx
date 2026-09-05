"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MediaCopy } from "@/lib/media/copy-schema";
import { UPLOAD_FOLDERS, MAX_UPLOAD_BYTES, uploadFileSchema, signaturePayloadSchema, mediaDtoSchema, type MediaDTO, type UploadResult, type MediaErrorCode } from "@/lib/media/contracts";
import { compressImage, uploadDirect, mediaRequest, errorCode } from "@/lib/media/client";

const formSchema = z.object({ files: z.array(z.object({
  clientId: z.string(), altText: z.string().trim().min(1).max(500), folder: z.enum(UPLOAD_FOLDERS),
})).min(1) });
type FormValues = z.infer<typeof formSchema>;
type FileState = {
  file: File; preview: string; progress: number; status: "queued" | "compressing" | "uploading" | "saving" | "done";
  error?: MediaErrorCode; upload?: UploadResult; ticket?: string;
};
export function MediaUploader({ copy, onUploaded, usageContext = "other" }: {
  copy: MediaCopy; onUploaded: (media: MediaDTO) => void; usageContext?: MediaDTO["usageContext"];
}) {
  const { register, control, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { files: [] } });
  const { fields, append, remove } = useFieldArray({ control, name: "files" });
  const [states, setStates] = useState<Record<string, FileState>>({});
  const stateRef = useRef(states);
  stateRef.current = states;
  const previews = useRef(new Set<string>());
  const controller = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  const [busy, setBusy] = useState(false);
  const [rejected, setRejected] = useState<Array<{ name: string; code: MediaErrorCode }>>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    mounted.current = true;
    const urls = previews.current;
    return () => { mounted.current = false; controller.current?.abort(); for (const url of urls) URL.revokeObjectURL(url); };
  }, []);
  function update(id: string, patch: Partial<FileState>) {
    if (mounted.current) setStates((current) => ({ ...current, [id]: { ...current[id], ...patch } }));
  }
  function addFiles(files: FileList | File[]) {
    if (busy) return;
    const invalid: Array<{ name: string; code: MediaErrorCode }> = [];
    for (const file of Array.from(files)) {
      if (!uploadFileSchema.safeParse(file).success) { invalid.push({ name: file.name, code: file.size > MAX_UPLOAD_BYTES ? "FILE_SIZE" : "FILE_TYPE" }); continue; }
      const clientId = crypto.randomUUID(), preview = URL.createObjectURL(file);
      previews.current.add(preview);
      setStates((current) => ({ ...current, [clientId]: { file, preview, progress: 0, status: "queued" } }));
      append({ clientId, altText: "", folder: "products" });
    }
    setRejected(invalid);
  }
  const submit = handleSubmit(async (values) => {
    if (busy) return;
    setBusy(true);
    const abort = new AbortController();
    controller.current = abort;
    for (const row of values.files) {
      if (abort.signal.aborted) break;
      const state = stateRef.current[row.clientId];
      if (!state || state.status === "done") continue;
      try {
        let upload = state.upload, ticket = state.ticket;
        if (!upload || !ticket) {
          update(row.clientId, { status: "compressing", error: undefined });
          const file = await compressImage(state.file);
          if (abort.signal.aborted) break;
          const payload = await mediaRequest("/api/admin/media/sign", signaturePayloadSchema, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folder: row.folder, usageContext }), signal: abort.signal,
          });
          update(row.clientId, { status: "uploading", progress: 0 });
          upload = await uploadDirect(file, payload, (progress) => update(row.clientId, { progress }), abort.signal);
          ticket = payload.ticket;
          update(row.clientId, { upload, ticket });
        }
        update(row.clientId, { status: "saving", error: undefined });
        const media = await mediaRequest("/api/admin/media", mediaDtoSchema, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticket, upload, altText: row.altText, caption: "", tags: [] }), signal: abort.signal,
        });
        update(row.clientId, { status: "done", progress: 100 });
        if (mounted.current) onUploaded(media);
      } catch (error) { update(row.clientId, { error: errorCode(error) }); }
    }
    if (mounted.current) setBusy(false);
  });
  return <form onSubmit={submit} noValidate className="grid gap-6">
    <div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); addFiles(event.dataTransfer.files); }}
      className="grid gap-3 rounded border border-dashed border-muted p-6 text-center">
      <p>{copy.labels.dropHint}</p><p className="text-sm text-muted">{copy.labels.fileHint}</p>
      <input ref={fileInput} className="sr-only" type="file" multiple accept=".jpg,.jpeg,.png,.webp,.avif" aria-label={copy.labels.chooseFiles}
        disabled={busy} onChange={(event) => { if (event.target.files) addFiles(event.target.files); event.target.value = ""; }} />
      <Button disabled={busy} onClick={() => fileInput.current?.click()}>{copy.labels.chooseFiles}</Button>
    </div>
    {rejected.map((item, index) => <p key={index} role="alert">{item.name}: {copy.errors[item.code]}</p>)}
    {fields.map((field, index) => {
      const state = states[field.clientId];
      if (!state) return null;
      const disabled = busy || state.status === "done";
      return <fieldset key={field.id} className="grid gap-4 border border-muted p-4 sm:grid-cols-[8rem_1fr]">
        <legend className="max-w-full break-all px-2">{state.file.name}</legend>
        <Image src={state.preview} alt="" width={128} height={96} unoptimized className="aspect-[4/3] w-32 object-cover" />
        <div className="grid min-w-0 gap-3">
          <Input id={field.clientId + "-alt"} label={copy.labels.altText} {...register(`files.${index}.altText`)}
            disabled={disabled} error={errors.files?.[index]?.altText ? copy.labels.required : undefined} />
          <label className="grid gap-2">{copy.labels.folder}
            <select {...register(`files.${index}.folder`)} disabled={disabled || Boolean(state.upload)} className="min-h-11 border border-muted bg-ivory p-2">
              {UPLOAD_FOLDERS.map((folder) => <option key={folder} value={folder}>{copy.folders[folder]}</option>)}
            </select>
          </label>
          <div role="status">{copy.labels[state.status]}</div>
          <progress max={100} value={state.progress} aria-label={copy.labels.progress + ": " + state.file.name} className="h-2 w-full accent-accent" />
          {state.error && <p role="alert">{copy.errors[state.error]}</p>}
          <button type="button" className="min-h-11 w-fit underline" disabled={busy} onClick={() => {
            URL.revokeObjectURL(state.preview); previews.current.delete(state.preview); remove(index);
            setStates((current) => { const next = { ...current }; delete next[field.clientId]; return next; });
          }}>{copy.labels.remove}</button>
        </div>
      </fieldset>;
    })}
    <Button type="submit" disabled={busy || fields.length === 0 || fields.every((field) => states[field.clientId]?.status === "done")}>{copy.labels.upload}</Button>
  </form>;
}

