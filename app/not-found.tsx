import Link from "next/link";
import BudAILogo from "@/components/ui/BudAILogo";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center bg-background text-white">
      <BudAILogo size="lg" />
      <p className="font-mono text-sm text-accent-cyan">{"</> 404"}</p>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">This page doesn&apos;t exist</h1>
      <p className="max-w-md text-muted">The link may be old or mistyped. The Playground is one click away.</p>
      <Link href="/#playground" className="rounded-full bg-accent-cyan px-6 py-3 text-sm font-semibold text-[#020205] hover:opacity-90">
        Open the Playground
      </Link>
    </main>
  );
}
