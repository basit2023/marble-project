import { notFound } from "next/navigation";
import { getAdminCopy } from "@/lib/admin/copy";
import { LoginForm } from "@/components/admin/login-form";
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string; changed?: string }> }) {
  const [copy, query] = await Promise.all([getAdminCopy(), searchParams]);
  if (!copy) notFound();
  const callbackUrl = query.callbackUrl?.startsWith("/admin") && !query.callbackUrl.startsWith("//") ? query.callbackUrl : "/admin";
  return <main className="grid min-h-dvh place-items-center bg-charcoal p-5">
    <section className="w-full max-w-md bg-ivory p-8 shadow-2xl" aria-labelledby="login-heading">
      <p className="editorial-label mb-6 text-accent">{copy.brand}</p>
      <h1 id="login-heading" className="font-heading text-title">{copy.labels.loginHeading}</h1>
      <p className="mb-8 mt-3 text-muted">{copy.labels.loginIntro}</p>
      {query.changed === "true" && <p role="status" className="mb-5 border border-accent p-3">{copy.labels.passwordChanged}</p>}
      <LoginForm copy={copy} callbackUrl={callbackUrl} />
    </section>
  </main>;
}
