import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Inquiry, PublicUiContent } from "@/models";
import { publicFilter } from "@/models/content-fields";
import { withinRateLimit } from "@/lib/rate-limit";
import { getRequestIp } from "@/lib/request-ip";
const schema = z.object({ email: z.email().trim().toLowerCase() }).strict();
export const runtime = "nodejs";
const jsonNoStore = (body: unknown, init?: ResponseInit) =>
  Response.json(body, { ...init, headers: { ...init?.headers, "Cache-Control": "no-store" } });
export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) return jsonNoStore({ error: "FORBIDDEN" }, { status: 403 });
    const ip = getRequestIp(request.headers);
    if (!await withinRateLimit("newsletter:" + ip, 5, 15 * 60 * 1000)) return jsonNoStore({ error: "RATE_LIMITED" }, { status: 429 });
    const input = schema.parse(await request.json());
    await connectDB();
    const content = await PublicUiContent.findOne({ key: "public-ui", ...publicFilter }).lean();
    if (!content) return jsonNoStore({ error: "SERVICE_UNAVAILABLE" }, { status: 503 });
    await Inquiry.create({ name: input.email, email: input.email, inquiryType: "General", source: "Newsletter", message: content.copy.labels.newsletter, createdBy: null, updatedBy: null });
    return jsonNoStore({ success: true }, { status: 201 });
  } catch { return jsonNoStore({ error: "VALIDATION" }, { status: 400 }); }
}
