import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
type InputProps = ComponentProps<"input"> & { id: string; label: string; error?: string };
export function Input({ id, label, error, className, ...props }: InputProps) {
  const description = [props["aria-describedby"], error ? `${id}-error` : undefined].filter(Boolean).join(" ") || undefined;
  return <div className="grid gap-2">
    <label htmlFor={id}>{label}</label>
    <input {...props} id={id} aria-invalid={error ? true : props["aria-invalid"]} aria-describedby={description}
      className={cn("min-h-11 w-full border border-muted bg-transparent px-3 py-2", className)} />
    {error && <p id={`${id}-error`} role="alert">{error}</p>}
  </div>;
}
