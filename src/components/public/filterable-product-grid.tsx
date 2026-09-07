"use client";

import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import { CardImage } from "@/components/public/card-image";
import type { ProductCardDTO } from "@/types/public-pages";

const PAGE_SIZE = 9;
const filters = [
  ["colourFamily", "Colour"],
  ["finishes", "Finish"],
  ["applications", "Application"],
  ["availableFormats", "Format"],
] as const;

export function FilterableProductGrid({ products }: { products: ProductCardDTO[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [, startTransition] = useTransition();
  const selected = Object.fromEntries(filters.map(([key]) => [key, searchParams.get(key) ?? ""]));
  const options = useMemo(() => Object.fromEntries(filters.map(([key]) => [key, [...new Set(products.flatMap((product) => {
    const value = product[key];
    return Array.isArray(value) ? value : [value];
  }))].filter(Boolean).sort()])), [products]);
  const filtered = products.filter((product) => filters.every(([key]) => {
    const wanted = selected[key];
    const value = product[key];
    return !wanted || (Array.isArray(value) ? value.includes(wanted) : value === wanted);
  }));
  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    startTransition(() => {
      setVisible(PAGE_SIZE);
      router.replace(`${pathname}?${params.toString()}` as Route, { scroll: false });
    });
  };
  return (
    <section className="page-shell py-section">
      <div className="mb-10 grid gap-4 md:grid-cols-4">
        {filters.map(([key, label]) => (
          <label key={key} className="grid gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-muted">
            {label}
            <select value={selected[key]} onChange={(event) => setFilter(key, event.target.value)} className="border border-charcoal/20 bg-ivory px-3 py-3 text-charcoal">
              <option value="">All</option>
              {(options[key] as string[]).map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
        ))}
      </div>
      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {filtered.slice(0, visible).map((product) => (
          <CardImage key={product.id} href={`/materials/${product.categorySlug}/${product.slug}`} title={product.name} meta={[product.colourFamily, product.origin].filter(Boolean).join(" / ")} image={product.primaryImage} />
        ))}
      </div>
      {filtered.length > visible ? <button type="button" onClick={() => setVisible((count) => count + PAGE_SIZE)} className="mt-10 border border-charcoal px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em]">Load more</button> : null}
    </section>
  );
}
