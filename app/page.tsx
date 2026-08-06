import dynamic from "next/dynamic";
import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
import Capabilities from "@/components/sections/Capabilities";
import Footer from "@/components/sections/Footer";

// Lazy load heavy sections below the fold
const AIPlayground = dynamic(() => import("@/components/sections/AIPlayground"), {
  loading: () => <div className="h-[600px] animate-pulse bg-surface/50 rounded-3xl max-w-5xl mx-auto my-32" />,
  ssr: false,
});
const Terminal = dynamic(() => import("@/components/sections/Terminal"), {
  loading: () => <div className="h-[400px] animate-pulse bg-surface/50 rounded-3xl max-w-5xl mx-auto my-32" />,
  ssr: false,
});
const Waitlist = dynamic(() => import("@/components/sections/Waitlist"), {
  loading: () => <div className="h-[500px] animate-pulse bg-surface/50 rounded-3xl max-w-5xl mx-auto my-32" />,
});
const Timeline = dynamic(() => import("@/components/sections/Timeline"), {
  loading: () => <div className="h-[300px] animate-pulse bg-surface/50 rounded-3xl max-w-5xl mx-auto my-32" />,
});
const SystemStatus = dynamic(() => import("@/components/sections/SystemStatus"), {
  loading: () => <div className="h-[400px] animate-pulse bg-surface/50 rounded-3xl max-w-5xl mx-auto my-32" />,
  ssr: false,
});
const Vision = dynamic(() => import("@/components/sections/Vision"), {
  loading: () => <div className="h-[300px] animate-pulse bg-surface/50 rounded-3xl max-w-5xl mx-auto my-32" />,
});
const FAQ = dynamic(() => import("@/components/sections/FAQ"), {
  loading: () => <div className="h-[300px] animate-pulse bg-surface/50 rounded-3xl max-w-5xl mx-auto my-32" />,
});
const Testimonials = dynamic(() => import("@/components/sections/Testimonials"), {
  loading: () => <div className="h-[300px] animate-pulse bg-surface/50 rounded-3xl max-w-5xl mx-auto my-32" />,
});
const Pricing = dynamic(() => import("@/components/sections/Pricing"), {
  loading: () => <div className="h-[300px] animate-pulse bg-surface/50 rounded-3xl max-w-5xl mx-auto my-32" />,
});

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Capabilities />
      <AIPlayground />
      <Terminal />
      <Testimonials />
      <Pricing />
      <Waitlist />
      <Timeline />
      <SystemStatus />
      <Vision />
      <FAQ />
      <Footer />
    </>
  );
}