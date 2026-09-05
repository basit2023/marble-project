import type { ReactNode } from "react";
import type { Metadata } from "next";
// Technical exclusion, not editable marketing metadata. No admin features are exposed in Phase 0.
export const metadata: Metadata = { robots: { index: false, follow: false } };
export default function AdminLayout({ children }: { children: ReactNode }) { return children; }

