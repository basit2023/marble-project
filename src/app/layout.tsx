import type { ReactNode } from "react";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { getSystemCopy } from "@/lib/content";
import { SystemCopyProvider } from "@/components/ui/system-screens";
import "./globals.css";

const heading = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], display: "swap", variable: "--font-cormorant" });
const body = Manrope({ subsets: ["latin"], display: "swap", variable: "--font-manrope" });
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export default async function RootLayout({ children }: { children: ReactNode }) {
  const copy = await getSystemCopy();
  return <html lang="en"><body className={`${heading.variable} ${body.variable}`}>
    <SystemCopyProvider copy={copy}>{children}</SystemCopyProvider>
  </body></html>;
}

