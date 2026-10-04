import type { Metadata } from "next";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import SiteAmbient from "@/components/effects/SiteAmbient";
import AboutBudAI from "@/components/sections/AboutBudAI";

export const metadata: Metadata = {
  title: "About BudAI",
  description:
    "What BudAI is, why it exists and where it is going — a Swedish-first AI work assistant built in Kista by Stilledev, in early preview.",
};

export default function AboutPage() {
  return (
    <main id="main-content" className="site-page relative min-h-screen overflow-x-clip bg-background text-white">
      <SiteAmbient />
      <Navbar />
      <div className="relative z-10">
        <AboutBudAI headingLevel="h1" />
        <Footer />
      </div>
    </main>
  );
}
