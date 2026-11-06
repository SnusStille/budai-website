import SiteShell from "@/components/site/SiteShell";
import Hero from "@/components/sections/Hero";
import ProductShowcase from "@/components/site/ProductShowcase";
import Capabilities from "@/components/sections/Capabilities";
import About from "@/components/sections/About";
import Journey from "@/components/sections/Journey";
import AIPlayground from "@/components/sections/AIPlayground";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import ScrollProgress from "@/components/ui/ScrollProgress";
import Shortcuts from "@/components/ui/Shortcuts";
import FocusMode from "@/components/ui/FocusMode";
import LazyEgg from "@/components/effects/LazyEgg";

export default function Home() {
  return (
    <SiteShell>
      <main id="main" tabIndex={-1} className="v2-main">
        <ScrollProgress />
        <Shortcuts />
        <FocusMode />
        <LazyEgg />
        <Hero />
        <ProductShowcase />
        <ErrorBoundary><AIPlayground /></ErrorBoundary>
        <Capabilities />
        <About />
        <Journey />
      </main>
    </SiteShell>
  );
}
