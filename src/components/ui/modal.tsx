"use client";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
export function Modal({ open, onClose, title, closeLabel, children, className }: {
  open: boolean; onClose: () => void; title: string; closeLabel: string; children: ReactNode; className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  // Native modal dialog supplies focus trapping, Escape and inert background.
  return <dialog ref={ref} onCancel={(event) => { event.preventDefault(); onClose(); }} onClose={onClose}
    aria-labelledby={titleId} className={cn("fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%_-_2.5rem)] max-w-xl overflow-auto bg-ivory p-6 text-charcoal backdrop:bg-black/60", className)}>
    <h2 id={titleId} className="mb-6 font-heading text-title">{title}</h2>
    {children}
    <Button className="mt-6" onClick={onClose}>{closeLabel}</Button>
  </dialog>;
}
