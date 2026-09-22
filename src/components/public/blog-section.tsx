import Link from "next/link";
import type { Route } from "next";
import { CloudinaryImage } from "@/components/ui/cloudinary-image";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";
import type { PublicPost, PublicSection } from "@/types/public-data";
import type { PublicCopy } from "@/lib/public/copy-schema";
import { formatDate } from "@/lib/utils";

export function BlogSection({ section, posts, copy }: { section: PublicSection; posts: PublicPost[]; copy: PublicCopy }) {
  return <section className="py-section"><div className="page-shell"><Reveal><SectionHeading eyebrow={section.eyebrowLabel} heading={section.heading} subheading={section.subheading} /></Reveal>
    <div className="grid gap-px bg-white/10 md:grid-cols-3">{posts.map((post) => <Reveal key={post.id}><article className="bg-charcoal"><Link href={`/blog/${post.slug}` as Route} className="group block p-3">
      <div className="aspect-[4/3] overflow-hidden bg-black">{post.coverImage && <CloudinaryImage media={post.coverImage} sizes="(max-width: 768px) 90vw, 30vw" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />}</div>
      <div className="p-3">{post.publishedAt && <p className="editorial-label mt-2 text-accent">{formatDate(post.publishedAt)}</p>}<h3 className="mt-2 font-heading text-3xl uppercase">{post.title}</h3>{post.excerpt && <p className="mt-3 leading-7 text-muted">{post.excerpt}</p>}<span className="mt-4 inline-block border-b border-accent text-sm uppercase tracking-[0.14em]">{copy.labels.readArticle}</span></div>
    </Link></article></Reveal>)}</div>
  </div></section>;
}
