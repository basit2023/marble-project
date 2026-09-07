import Link from "next/link";
import type { Route } from "next";
import { CloudinaryImage } from "@/components/ui/cloudinary-image";
import type { MediaDTO } from "@/lib/media/contracts";

export function CardImage({ href, title, meta, image }: { href: string; title: string; meta?: string; image?: MediaDTO }) {
  return (
    <Link href={href as Route} className="group block focus-visible:outline-accent">
      <div className="aspect-[4/3] overflow-hidden bg-charcoal/10">
        {image ? <CloudinaryImage media={image} sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 100vw" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /> : null}
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-3xl leading-tight">{title}</h2>
          {meta ? <p className="mt-2 text-sm uppercase tracking-[0.14em] text-muted">{meta}</p> : null}
        </div>
        <span aria-hidden className="text-2xl text-accent transition group-hover:translate-x-1">-&gt;</span>
      </div>
    </Link>
  );
}
