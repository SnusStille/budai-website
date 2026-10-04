import type { Metadata } from "next";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import SiteAmbient from "@/components/effects/SiteAmbient";
import Waitlist from "@/components/sections/Waitlist";

export const metadata: Metadata = {
  title: "Waitlist — 10% off at launch",
  description:
    "Join the BudAI waitlist and lock in 10% off at launch (code BUDAI-EARLY-10), plus early access to every new release. No payment, no card.",
};

export default function WaitlistPage() {
  return (
    <main id="main-content" className="site-page relative min-h-screen overflow-x-clip bg-background text-white">
      <SiteAmbient />
      <Navbar />
      <div className="relative z-10 pt-[70px] lg:pt-[76px]">
        <Waitlist headingLevel="h1" />
        <Footer />
      </div>
    </main>
  );
}
