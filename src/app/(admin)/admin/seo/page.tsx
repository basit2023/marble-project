import Link from "next/link";
import type { Route } from "next";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/require-auth";
import { getAdminCopy } from "@/lib/admin/copy";
import { getSeoHealth } from "@/lib/seo/health";
import { PageHeader } from "@/components/admin/page-header";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function SeoHealthPage() {
  const [, copy, report] = await Promise.all([requireAuth(), getAdminCopy(), getSeoHealth()]);
  if (!copy) notFound();

  return (
    <>
      <PageHeader
        title={copy.navigation.seo ?? "SEO Health"}
        description="Published pages missing a meta title, meta description or image alt text."
      />
      <div className="grid gap-6">
        <dl className="flex flex-wrap gap-8 border border-black/10 bg-white p-5 text-sm">
          <div><dt className="text-muted">Documents scanned</dt><dd className="text-2xl">{report.totals.scanned}</dd></div>
          <div><dt className="text-muted">With issues</dt><dd className="text-2xl">{report.totals.withIssues}</dd></div>
          <div><dt className="text-muted">Last checked</dt><dd className="text-2xl">{formatDate(report.generatedAt)}</dd></div>
        </dl>

        {report.issues.length === 0 ? (
          <p className="border border-black/10 bg-white p-8 text-center text-muted">
            Every active page has a meta title, meta description and image alt text.
          </p>
        ) : (
          <div className="overflow-x-auto border border-black/10 bg-white">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead className="bg-charcoal text-left text-ivory">
                <tr>
                  <th className="p-3">Collection</th>
                  <th className="p-3">Document</th>
                  <th className="p-3">Missing</th>
                  <th className="p-3">Fix</th>
                </tr>
              </thead>
              <tbody>
                {report.issues.map((issue) => (
                  <tr key={`${issue.collection}-${issue.id}`} className="border-b border-black/10">
                    <td className="p-3">{issue.collection}</td>
                    <td className="max-w-72 truncate p-3">{issue.label}</td>
                    <td className="p-3">{issue.missing.join(", ")}</td>
                    <td className="p-3">
                      {issue.editUrl ? (
                        <Link href={issue.editUrl as Route} className="text-accent underline">Edit</Link>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
