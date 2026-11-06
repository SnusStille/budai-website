import type { ReactNode } from "react";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import CookieConsent from "@/components/ui/CookieConsent";
import WhatsNew from "@/components/ui/WhatsNew";
import BackToTop from "@/components/ui/BackToTop";
import FeedbackButton from "@/components/ui/FeedbackButton";

export default function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="v2-site">
      <Navbar />
      {children}
      <Footer />
      <BackToTop />
      <FeedbackButton />
      <WhatsNew />
      <CookieConsent />
    </div>
  );
}
