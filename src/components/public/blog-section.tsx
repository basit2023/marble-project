import Link from "next/link";
import type { Route } from "next";
import { CloudinaryImage } from "@/components/ui/cloudinary-image";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";
import type { PublicPost, PublicSection } from "@/types/public-data";
import type { PublicCopy } from "@/lib/public/copy-schema";
import { formatDate } from "@/lib/utils";
export function BlogSection({ section, posts, copy }: { section: PublicSection; posts: PublicPost[]; copy: PublicCopy }) {
  return <section className="bg-white py-section"><div className="page-shell"><Reveal><SectionHeading eyebrow={section.eyebrowLabel} heading={section.heading} subheading={section.subheading} /></Reveal>
    <div className="grid gap-8 md:grid-cols-3">{posts.map((post) => <Reveal key={post.id}><article><Link href={`/blog/${post.slug}` as Route} className="group block">
      <div className="aspect-[4/3] overflow-hidden bg-charcoal">{post.coverImage && <CloudinaryImage media={post.coverImage} sizes="(max-width: 768px) 90vw, 30vw" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />}</div>
      {post.publishedAt && <p className="editorial-label mt-5 text-accent">{formatDate(post.publishedAt)}</p>}<h3 className="mt-2 font-heading text-3xl">{post.title}</h3>{post.excerpt && <p className="mt-3 leading-7 text-muted">{post.excerpt}</p>}<span className="mt-4 inline-block border-b border-accent">{copy.labels.readArticle}</span>
    </Link></article></Reveal>)}</div>
  </div></section>;
}
