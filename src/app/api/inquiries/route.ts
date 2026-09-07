import { NextResponse } from "next/server";
import { publicInquirySchema } from "@/lib/public/forms";
import { createPublicInquiry } from "@/lib/public/pages-data";

export const runtime = "nodejs";

const NO_STORE = { "Cache-Control": "no-store" } as const;

export async function POST(request: Request) {
  const parsed = publicInquirySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the highlighted fields." }, { status: 400, headers: NO_STORE });
  }
  const id = await createPublicInquiry(parsed.data);
  return NextResponse.json({ id }, { headers: NO_STORE });
}
