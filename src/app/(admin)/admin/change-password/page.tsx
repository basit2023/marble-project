import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/require-auth";
import { getAdminCopy } from "@/lib/admin/copy";
import { PasswordForm } from "@/components/admin/password-form";
export default async function ChangePasswordPage() {
  const [, copy] = await Promise.all([requireAuth(undefined, { allowForcedChange: true }), getAdminCopy()]);
  if (!copy) notFound();
  return <main className="grid min-h-dvh place-items-center bg-charcoal p-5">
    <section className="w-full max-w-md bg-ivory p-8 shadow-2xl" aria-labelledby="password-heading">
      <p className="editorial-label mb-6 text-accent">{copy.brand}</p>
      <h1 id="password-heading" className="font-heading text-title">{copy.labels.passwordHeading}</h1>
      <p className="mb-8 mt-3 text-muted">{copy.labels.passwordIntro}</p>
      <PasswordForm copy={copy} />
    </section>
  </main>;
}
