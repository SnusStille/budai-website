"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function FAQ() {
  const { lang } = useLang();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = lang === "sv" ? [
    {
      q: "Vad är BudAI?",
      a: "BudAI är en avancerad AI-plattform speciellt utvecklad för svenska företag. Den automatiserar repetitiva uppgifter, analyserar data, skapar innehåll och fungerar som en digital medarbetare som är tillgänglig dygnet runt.",
    },
    {
      q: "Är min data säker med BudAI?",
      a: "Absolut. Vi följer strikta nordiska standarder för dataskydd. All data lagras inom EU, vi använder end-to-end-kryptering, och vi säljer eller delar aldrig din data med tredje part.",
    },
    {
      q: "Hur lång tid tar det att komma igång?",
      a: "De flesta företag är igång inom några timmar. BudAI integreras smidigt med dina befintliga verktyg och kräver ingen teknisk expertis för att komma igång.",
    },
    {
      q: "Kan BudAI hantera svenska språket?",
      a: "Ja, BudAI är tränad på svenska språket och förstår kontext, nyanser och fackterminologi. Den kan kommunicera flytande på både svenska och engelska.",
    },
    {
      q: "Vad kostar BudAI?",
      a: "Vi erbjuder skalbara prisplaner anpassade efter ditt företags storlek och behov. Kontakta oss för en offert, eller gå med i väntelistan för att få exklusiva erbjudanden som grundarföretag.",
    },
    {
      q: "Erbjuder ni support?",
      a: "Ja, alla kunder får tillgång till vår support. Grundarföretag får dessutom livstidsprioriterad support med dedikerad kontaktperson.",
    },
  ] : [
    {
      q: "What is BudAI?",
      a: "BudAI is an advanced AI platform specifically built for Swedish companies. It automates repetitive tasks, analyzes data, creates content, and acts as a digital employee available around the clock.",
    },
    {
      q: "Is my data secure with BudAI?",
      a: "Absolutely. We follow strict Nordic standards for data protection. All data is stored within the EU, we use end-to-end encryption, and we never sell or share your data with third parties.",
    },
    {
      q: "How long does it take to get started?",
      a: "Most companies are up and running within a few hours. BudAI integrates smoothly with your existing tools and requires no technical expertise to get started.",
    },
    {
      q: "Can BudAI handle the Swedish language?",
      a: "Yes, BudAI is trained on the Swedish language and understands context, nuances, and industry terminology. It can communicate fluently in both Swedish and English.",
    },
    {
      q: "How much does BudAI cost?",
      a: "We offer scalable pricing plans tailored to your company's size and needs. Contact us for a quote, or join the waitlist for exclusive offers as a founding company.",
    },
    {
      q: "Do you offer support?",
      a: "Yes, all customers get access to our support. Founding companies also receive lifetime priority support with a dedicated contact person.",
    },
  ];

  return (
    <section id="faq" className="py-32 relative">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <ScrollReveal className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full glass text-sm font-medium text-accent-cyan mb-4">
            {lang === "sv" ? "Vanliga Frågor" : "FAQ"}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            {lang === "sv" ? "Allt du behöver " : "Everything you need to "}
            <span className="text-gradient">{lang === "sv" ? "veta" : "know"}</span>
          </h2>
        </ScrollReveal>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="glass rounded-xl border border-white/[0.06] overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors"
                aria-expanded={openIndex === i}
              >
                <span className="font-medium text-white/90 pr-4">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-muted shrink-0 transition-transform duration-300 ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="px-5 pb-5 text-sm text-muted leading-relaxed">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}