import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
export function Table({ caption, className, children, ...props }: ComponentProps<"table"> & { caption: string }) {
  return <div className="overflow-x-auto" role="region" aria-label={caption} tabIndex={0}>
    <table {...props} className={cn("w-full border-collapse text-left [&_td]:border-b [&_td]:border-muted [&_td]:p-3 [&_th]:border-b [&_th]:border-muted [&_th]:p-3", className)}>
      <caption className="mb-4 text-left">{caption}</caption>{children}
    </table>
  </div>;
}
