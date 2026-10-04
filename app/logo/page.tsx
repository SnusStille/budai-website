import type { Metadata } from "next";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import SiteAmbient from "@/components/effects/SiteAmbient";
import LogoLab from "@/components/logo/LogoLab";

export const metadata: Metadata = {
  title: "Logo Lab · BudAI",
  description:
    "The BudAI mark in one place: every size, every state, on dark and light — so it can be judged honestly before it ships everywhere.",
  robots: { index: false, follow: false },
};

export default function LogoPage() {
  return (
    <main id="main-content" className="site-page relative min-h-screen overflow-x-clip bg-background text-white">
      <SiteAmbient />
      <Navbar />
      <div className="relative z-10 pt-[70px] lg:pt-[76px]">
        <LogoLab />
        <Footer />
      </div>
    </main>
  );
}
