import type { Metadata } from "next";
import LogoLab from "@/components/logo/LogoLab";

export const metadata: Metadata = {
  title: "Logo Lab · BudAI",
  description:
    "Every BudAI logo candidate in one place, tested side by side against the shipped B-mark. Download SVG or PNG, vote, and try one live in the navigation.",
  robots: { index: false, follow: false },
};

export default function LogoPage() {
  return <LogoLab />;
}
