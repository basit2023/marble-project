import { notFound } from "next/navigation";
import { getSystemCopy } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const copy = (await getSystemCopy()).foundation;
  return copy ? buildMetadata(copy, "/") : {};
}
export default async function FoundationPage() {
  const copy = (await getSystemCopy()).foundation;
  if (!copy) notFound();
  return <main className="page-shell flex min-h-screen flex-col justify-center gap-6 py-section">
    <h1 className="max-w-5xl font-heading text-display">{copy.heading}</h1>
    <p className="max-w-prose text-body text-muted">{copy.body}</p>
  </main>;
}

