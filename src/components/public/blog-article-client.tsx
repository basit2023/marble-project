"use client";

import { useEffect, useMemo, useState } from "react";

export function BlogArticleClient({ html, title }: { html: string; title: string }) {
  const [progress, setProgress] = useState(0);
  const headings = useMemo(() => [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/gi)].map((match, index) => ({
    id: `section-${index + 1}`,
    title: match[1].replace(/<[^>]+>/g, ""),
  })), [html]);
  const articleHtml = useMemo(() => {
    let index = 0;
    return html.replace(/<h2([^>]*)>/gi, () => `<h2 id="section-${++index}">`);
  }, [html]);
  useEffect(() => {
    const onScroll = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(height > 0 ? Math.min(100, Math.max(0, (window.scrollY / height) * 100)) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const share = (platform: "x" | "linkedin" | "facebook") => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(title);
    const href = platform === "x" ? `https://twitter.com/intent/tweet?url=${url}&text=${text}` : platform === "linkedin" ? `https://www.linkedin.com/sharing/share-offsite/?url=${url}` : `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    window.open(href, "_blank", "noopener,noreferrer");
  };
  return (
    <>
      <div className="fixed left-0 top-0 z-50 h-1 bg-accent" style={{ width: `${progress}%` }} />
      <div className="page-shell grid gap-10 py-section lg:grid-cols-[16rem_1fr]">
        <aside className="hidden lg:block">
          <nav className="sticky top-28 grid gap-3 text-sm text-muted" aria-label="Table of contents">
            {headings.map((heading) => <a key={heading.id} href={`#${heading.id}`} className="hover:text-charcoal">{heading.title}</a>)}
          </nav>
        </aside>
        <article>
          <div className="mb-8 flex gap-3">
            {(["x", "linkedin", "facebook"] as const).map((item) => <button key={item} type="button" onClick={() => share(item)} className="border border-charcoal/20 px-4 py-2 text-xs uppercase tracking-[0.14em]">{item}</button>)}
          </div>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: articleHtml }} />
        </article>
      </div>
    </>
  );
}
