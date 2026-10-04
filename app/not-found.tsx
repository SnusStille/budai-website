import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import BudAILogo from "@/components/ui/BudAILogo";
import SiteAmbient from "@/components/effects/SiteAmbient";

export const metadata: Metadata = {
  title: "Not found · BudAI",
  robots: { index: false, follow: false },
};

/** A dead end should still feel like the product — and lead back to it. */
export default function NotFound() {
  return (
    <main id="main-content" className="site-page relative flex min-h-screen items-center justify-center overflow-x-clip bg-background px-6 text-white">
      <SiteAmbient />
      <div className="relative z-10 flex max-w-md flex-col items-center text-center">
        <BudAILogo size="xl" animated />
        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.22em] text-white/35">Error 404</p>
        <h1 className="mt-3 text-[26px] font-semibold tracking-tight text-white sm:text-[32px]">
          This page doesn&apos;t exist.
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-white/50">
          The Playground does, though — it&apos;s where BudAI actually lives.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="about-link">
            Open the Playground
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link href="/waitlist" className="about-link about-link--muted">
            Join the waitlist
          </Link>
        </div>
      </div>
    </main>
  );
}
