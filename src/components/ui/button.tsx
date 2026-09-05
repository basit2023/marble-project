import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
export function Button({ className, type = "button", ...props }: ComponentProps<"button">) {
  return <button type={type} className={cn("inline-flex min-h-11 items-center justify-center bg-charcoal px-6 py-3 text-ivory disabled:cursor-not-allowed disabled:opacity-60", className)} {...props} />;
}
