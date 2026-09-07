"use client";
import { SystemScreen } from "@/components/ui/system-screens";
export default function ErrorBoundary({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <SystemScreen screen="error" reset={reset} landmark={false} />;
}

