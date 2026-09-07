import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Inquiry } from "@/models";
import { withinRateLimit } from "@/lib/rate-limit";
import { getRequestIp } from "@/lib/request-ip";

export const runtime = "nodejs";

const schema = z.object({ email: z.email().trim().toLowerCase() }).strict();
const jsonNoStore = (body: unknown, init?: ResponseInit) =>
  Response.json(body, { ...init, headers: { ...init?.headers, "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) {
      return jsonNoStore({ error: "FORBIDDEN" }, { status: 403 });
    }
    const ip = getRequestIp(request.headers);
    if (!(await withinRateLimit("newsletter:" + ip, 5, 15 * 60 * 1000))) {
      return jsonNoStore({ error: "RATE_LIMITED" }, { status: 429 });
    }
    const { email } = schema.parse(await request.json());
    await connectDB();
    await Inquiry.create({
      name: email,
      email,
      inquiryType: "General",
      source: "Newsletter",
      message: "Newsletter subscription request.",
      createdBy: null,
      updatedBy: null,
    });
    return jsonNoStore({ success: true }, { status: 201 });
  } catch {
    return jsonNoStore({ error: "VALIDATION" }, { status: 400 });
  }
}
