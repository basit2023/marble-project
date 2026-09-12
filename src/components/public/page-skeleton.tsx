const shimmer = "animate-pulse rounded bg-white/10";

/** Route-segment loading placeholder. Mirrors the PageHero + content rhythm. */
export function PageSkeleton({ variant = "listing" }: { variant?: "listing" | "detail" | "article" }) {
  return (
    <div aria-hidden="true">
      <div className="relative min-h-[58vh] bg-charcoal/90">
        <div className="page-shell flex min-h-[58vh] flex-col justify-end gap-4 pb-16 pt-32">
          <div className={`h-3 w-24 ${shimmer} bg-white/10`} />
          <div className={`h-12 w-3/4 max-w-2xl ${shimmer} bg-white/10`} />
          <div className={`h-4 w-2/3 max-w-xl ${shimmer} bg-white/10`} />
        </div>
      </div>
      {variant === "listing" ? (
        <div className="page-shell grid gap-8 py-section md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="grid gap-4">
              <div className={`aspect-[4/3] w-full ${shimmer}`} />
              <div className={`h-6 w-2/3 ${shimmer}`} />
              <div className={`h-3 w-1/3 ${shimmer}`} />
            </div>
          ))}
        </div>
      ) : (
        <div className="page-shell grid gap-6 py-section lg:grid-cols-[1fr_1.4fr]">
          <div className={`aspect-square w-full ${shimmer} ${variant === "article" ? "hidden" : ""}`} />
          <div className="grid content-start gap-4">
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className={`h-4 ${shimmer}`} style={{ width: `${90 - index * 7}%` }} />
            ))}
          </div>
        </div>
      )}
      <span className="sr-only" role="status">Loading…</span>
    </div>
  );
}
