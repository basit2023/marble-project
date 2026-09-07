import type { ReactNode } from "react";
export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <header className="sticky top-0 z-20 -mx-4 mb-6 flex min-h-20 items-center justify-between gap-4 border-b border-black/10 bg-[#f4f1e9]/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
    <div><h1 className="font-heading text-3xl leading-none">{title}</h1>{description && <p className="mt-1 text-sm text-muted">{description}</p>}</div>
    {action}
  </header>;
}
