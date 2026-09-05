"use client";
import Image from "next/image";
import { mediaDeliveryUrl, type ImageMedia } from "@/lib/media/delivery";

export function CloudinaryImage({ media, sizes, className, priority = false }: {
  media: ImageMedia; sizes: string; className?: string; priority?: boolean;
}) {
  if (!media.isActive || media.isDeleted) return null;
  return <Image src={media.secureUrl} alt={media.altText} width={media.width} height={media.height}
    loader={({ width }) => mediaDeliveryUrl(media, width)} sizes={sizes} className={className}
    priority={priority} placeholder={media.blurDataUrl ? "blur" : "empty"} blurDataURL={media.blurDataUrl} />;
}

