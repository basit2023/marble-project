import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { signInputSchema, idSchema } from "./contracts";

export const ticketSchema = signInputSchema.extend({
  actorId: idSchema, publicId: z.string().min(1).max(250),
  timestamp: z.number().int().positive(), expiresAt: z.number().int().positive(),
});
export type UploadTicket = z.infer<typeof ticketSchema>;
export function signTicket(ticket: UploadTicket, secret: string): string {
  const payload = Buffer.from(JSON.stringify(ticketSchema.parse(ticket))).toString("base64url");
  const mac = createHmac("sha256", secret).update("media-upload:" + payload).digest("base64url");
  return payload + "." + mac;
}
export function verifyTicket(value: string, actorId: string, secret: string, now = Date.now()): UploadTicket | null {
  try {
    const [payload, signature, extra] = value.split(".");
    if (!payload || !signature || extra || value.length > 2048) return null;
    const expected = createHmac("sha256", secret).update("media-upload:" + payload).digest();
    const actual = Buffer.from(signature, "base64url");
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
    const ticket = ticketSchema.parse(JSON.parse(Buffer.from(payload, "base64url").toString("utf8")));
    if (ticket.actorId !== actorId || ticket.expiresAt <= now || ticket.timestamp * 1000 > now + 30000) return null;
    return ticket;
  } catch { return null; }
}
export function equalSignature(a: string, b: string): boolean {
  if (!/^[a-f\d]+$/i.test(a) || !/^[a-f\d]+$/i.test(b)) return false;
  const left = Buffer.from(a, "hex"), right = Buffer.from(b, "hex");
  return left.length === right.length && timingSafeEqual(left, right);
}

