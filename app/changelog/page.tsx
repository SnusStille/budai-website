import type { Metadata } from "next";
import ChangelogView from "@/components/ui/ChangelogView";

export const metadata: Metadata = {
  title: "What's new",
  description:
    "An honest changelog for the BudAI developer preview: what has actually shipped, and a snapshot of the current features, in English and Swedish.",
  alternates: { canonical: "/changelog" },
  robots: { index: true, follow: true },
};

export default function ChangelogPage() {
  return <ChangelogView />;
}
