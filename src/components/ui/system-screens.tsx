"use client";
import { createContext, useContext, type ReactNode } from "react";
import Link from "next/link";
import type { ScreenKey, SystemCopy } from "@/types/content";

const CopyContext = createContext<SystemCopy>({});
export function SystemCopyProvider({ copy, children }: { copy: SystemCopy; children: ReactNode }) {
  return <CopyContext.Provider value={copy}>{children}</CopyContext.Provider>;
}
export function SystemScreen({ screen, reset, landmark = true }: { screen: ScreenKey; reset?: () => void; landmark?: boolean }) {
  const copy = useContext(CopyContext)[screen];
  const Wrapper = landmark ? "main" : "div";
  if (!copy) return <Wrapper className="page-shell min-h-96" />;
  return <Wrapper className="page-shell flex min-h-[65vh] flex-col justify-center gap-6 py-16" aria-busy={screen === "loading" || undefined}>
    <div role={screen === "loading" ? "status" : undefined}>
      <h1 className="font-heading text-display">{copy.heading}</h1>
      <p className="mt-6 max-w-prose text-body text-muted">{copy.body}</p>
    </div>
    {reset && <button type="button" onClick={reset} className="min-h-11 w-fit border border-charcoal px-6 py-3">{copy.actionLabel}</button>}
    {screen === "notFound" && <Link href="/" className="w-fit underline underline-offset-4">{copy.actionLabel}</Link>}
  </Wrapper>;
}
