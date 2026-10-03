import type { Metadata } from "next";
import { Suspense } from "react";
import PlaygroundApp from "@/components/playground/PlaygroundApp";

export const metadata: Metadata = {
  title: "Playground",
  description:
    "Talk to BudAI live. Write, plan, analyze, and think — in Swedish and English. Developer preview.",
};

function PlaygroundFallback() {
  return (
    <div className="h-[100dvh] bg-background flex items-center justify-center text-white/40 text-sm">
      BudAI
    </div>
  );
}

export default function PlaygroundPage() {
  return (
    <Suspense fallback={<PlaygroundFallback />}>
      <PlaygroundApp />
    </Suspense>
  );
}
