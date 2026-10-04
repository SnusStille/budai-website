import type { Metadata } from "next";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import SiteAmbient from "@/components/effects/SiteAmbient";
import PlaygroundStage from "@/components/sections/PlaygroundStage";

export const metadata: Metadata = {
  title: "Playground",
  description:
    "The BudAI Playground — work in Swedish or English with streaming answers, voice mode, saved notes and shareable chats. No account needed.",
};

export default function PlaygroundPage() {
  return (
    <main id="main-content" className="site-page relative min-h-screen overflow-x-clip bg-background text-white">
      <SiteAmbient />
      <Navbar />
      <div className="relative z-10">
        <PlaygroundStage />
        <Footer />
      </div>
    </main>
  );
}
