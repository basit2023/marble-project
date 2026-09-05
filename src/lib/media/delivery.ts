import type { IMedia } from "@/types/media";
export type ImageMedia = Pick<IMedia, "secureUrl" | "cloudinaryPublicId" | "format" | "width" | "height" | "altText" | "blurDataUrl" | "isActive" | "isDeleted" | "version">;
export function mediaDeliveryUrl(media: Pick<ImageMedia, "secureUrl" | "cloudinaryPublicId" | "format" | "version">, width: number): string {
  const url = new URL(media.secureUrl);
  if (url.protocol !== "https:" || url.hostname !== "res.cloudinary.com" || !Number.isInteger(width) || width < 1 || width > 8192) throw new Error("Invalid image delivery input.");
  const cloud = url.pathname.split("/")[1];
  const version = media.version ?? Number(/\/v(\d+)\//.exec(url.pathname)?.[1] ?? 1);
  const publicId = media.cloudinaryPublicId.split("/").map(encodeURIComponent).join("/");
  return `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto,dpr_auto,c_limit,w_${width}/v${version}/${publicId}.${encodeURIComponent(media.format)}`;
}

