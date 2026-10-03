import type { Metadata } from "next";
import AboutView from "@/components/about/AboutView";

export const metadata: Metadata = {
  title: "About",
  description:
    "BudAI is an AI work assistant for Sweden and the Nordics. Developer preview by Stilledev.",
};

export default function AboutPage() {
  return <AboutView />;
}
