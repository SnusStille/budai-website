"use client";

import NeuralNetwork from "@/components/effects/NeuralNetwork";
import ParticleField from "@/components/effects/ParticleField";
import CursorGlow from "@/components/effects/CursorGlow";
import ScrollProgress from "@/components/ui/ScrollProgress";
import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
import BuddyCard from "@/components/sections/BuddyCard";
import Capabilities from "@/components/sections/Capabilities";
import AIPlayground from "@/components/sections/AIPlayground";
import ProductFeatures from "@/components/sections/ProductFeatures";
import Waitlist from "@/components/sections/Waitlist";
import Vision from "@/components/sections/Vision";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <main className="page-transition relative min-h-screen text-white overflow-x-hidden transition-colors duration-700 bg-background">
      <ScrollProgress />
      <NeuralNetwork />
      <ParticleField />
      <CursorGlow />
      <div className="fixed inset-0 z-[2] pointer-events-none grid-bg opacity-25" />

      <div className="relative z-10">
        <div className="fixed bottom-4 right-4 z-[30] hidden md:block">
          <BuddyCard />
        </div>
        <Navbar />
        <Hero />
        <ProductFeatures />
        <Capabilities />
        <AIPlayground />
        <Waitlist />
        <Vision />
        <Footer />
      </div>
    </main>
  );
}
