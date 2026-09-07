"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CloudinaryImage } from "@/components/ui/cloudinary-image";
import type { SearchResultDTO } from "@/types/public-pages";

export function SearchResults({ results, query }: { results: SearchResultDTO[]; query: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const activeTypes = params.getAll("type");
  const toggleType = (type: string) => {
    const next = new URLSearchParams(params.toString());
    const existing = next.getAll("type");
    next.delete("type");
    const values = existing.includes(type) ? existing.filter((item) => item !== type) : [...existing, type];
    values.forEach((item) => next.append("type", item));
    router.replace(`${pathname}?${next.toString()}` as Route);
  };
  return (
    <section className="page-shell py-section">
      <form className="mb-8 flex flex-col gap-3 sm:flex-row" action="/search">
        <input name="q" defaultValue={query} placeholder="Search products, projects and articles" className="min-w-0 flex-1 border border-charcoal/20 bg-transparent px-4 py-3" />
        {activeTypes.map((type) => <input key={type} type="hidden" name="type" value={type} />)}
        <button className="bg-charcoal px-6 py-3 text-sm uppercase tracking-[0.18em] text-ivory">Search</button>
      </form>
      <div className="mb-10 flex flex-wrap gap-3">
        {(["Product", "Project", "Blog"] as const).map((type) => <button key={type} type="button" onClick={() => toggleType(type)} className={`border px-4 py-2 text-sm ${activeTypes.includes(type) ? "border-accent text-accent" : "border-charcoal/20"}`}>{type}</button>)}
      </div>
      <div className="grid gap-6">
        {results.map((result) => (
          <Link href={result.url as Route} key={`${result.type}-${result.id}`} className="grid gap-5 border-t border-charcoal/10 pt-6 sm:grid-cols-[10rem_1fr]">
            <div className="aspect-[4/3] bg-charcoal/10">{result.image ? <CloudinaryImage media={result.image} sizes="160px" className="h-full w-full object-cover" /> : null}</div>
            <div><p className="editorial-label text-accent">{result.type}</p><h2 className="mt-2 font-heading text-4xl">{result.title}</h2>{result.excerpt ? <p className="mt-3 line-clamp-2 text-muted">{result.excerpt.replace(/<[^>]+>/g, "")}</p> : null}</div>
          </Link>
        ))}
      </div>
      {query && !results.length ? <p className="text-muted">No active public results found.</p> : null}
    </section>
  );
}
