import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string { return twMerge(clsx(inputs)); }
// Public environment values are validated at build time by next.config.ts.
// Pass the database-owned contact number when site settings become available.
export function buildWhatsAppLink(message: string, number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER): string {
  if (!number || !/^[1-9]\d{7,14}$/.test(number)) throw new Error("Invalid international WhatsApp number.");
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
export function slugify(value: string): string {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "");
}
export function formatDate(value: Date | string, locale = "en-PK"): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new RangeError("Invalid date.");
  return new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }).format(date);
}
export function truncate(value: string, length = 160): string {
  if (!Number.isInteger(length) || length < 1) throw new RangeError("Length must be a positive integer.");
  const characters = Array.from(value);
  return characters.length <= length ? value : characters.slice(0, length - 1).join("").trimEnd() + "…";
}
