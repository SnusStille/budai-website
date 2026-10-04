import type { Metadata } from "next";
import LogoLab from "@/components/logo/LogoLab";

export const metadata: Metadata = {
  title: "Logo Lab · BudAI",
  description:
    "Six animated logo candidates for BudAI, tested side by side against the shipped Prism Core mark. Download SVG, vote, and try one live in the navigation.",
  robots: { index: false, follow: false },
};

export default function LogoPage() {
  return <LogoLab />;
}
