"use client";

import { motion } from "framer-motion";
import { ArrowRight, CircleDot, Compass, Flag, HelpCircle } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";

/** About BudAI — four short answers, nothing more. */
export default function AboutBudAI({ headingLevel = "h2" }: { headingLevel?: "h1" | "h2" } = {}) {
  const Heading = headingLevel;
  const { lang } = useLang();
  const isSv = lang === "sv";

  const blocks = [
    {
      id: "what",
      icon: <HelpCircle className="h-4 w-4" />,
      kicker: isSv ? "Vad är BudAI?" : "What is BudAI?",
      body: isSv
        ? "En AI-assistent för arbetsdagen, byggd för svenska och engelska. Du skriver, pratar eller klistrar in — BudAI hjälper dig att få något färdigt."
        : "An AI assistant for the workday, built for Swedish and English. You type, talk or paste — BudAI helps you get something finished.",
    },
    {
      id: "why",
      icon: <Flag className="h-4 w-4" />,
      body: isSv
        ? "De flesta AI-verktyg känns engelska först och svenska i efterhand. Vi tycker att svenska arbetsdagar förtjänar ett verktyg som förstår dem från början."
        : "Most AI tools feel English first and Swedish as an afterthought. We think Swedish workdays deserve a tool that understands them from the start.",
      kicker: isSv ? "Varför finns den?" : "Why does it exist?",
    },
    {
      id: "vision",
      icon: <Compass className="h-4 w-4" />,
      kicker: isSv ? "Vad är visionen?" : "What is the vision?",
      body: isSv
        ? "Ett verktyg du faktiskt öppnar varje dag: snabbt, tydligt och på ditt språk — utan att kännas som ännu ett system att lära sig."
        : "A tool you actually open every day: fast, clear and in your language — without feeling like yet another system to learn.",
    },
    {
      id: "now",
      icon: <CircleDot className="h-4 w-4" />,
      kicker: isSv ? "Var är vi nu?" : "Where are we now?",
      body: isSv
        ? "I tidig förhandsvisning. Playground är öppen för alla, funktioner läggs till löpande, och de första 10 % får early access och founding-rabatt."
        : "Early preview. The Playground is open to everyone, features land continuously, and the first 10% get early access and a founding discount.",
    },
  ];

  return (
    <section id="about" className="about-section relative scroll-mt-24 overflow-hidden">
      <div className="relative z-10 mx-auto max-w-[76rem] px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
        <div className="about-head">
          <span className="about-kicker">{isSv ? "Om BudAI" : "About BudAI"}</span>
          <Heading className="about-title">
            {isSv ? "Kort sagt." : "In short."}
          </Heading>
        </div>

        <div className="about-grid">
          {blocks.map((block, index) => (
            <motion.article
              key={block.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              className="about-block"
            >
              <span className="about-block-icon">{block.icon}</span>
              <h3>{block.kicker}</h3>
              <p>{block.body}</p>
            </motion.article>
          ))}
        </div>

        <div className="about-foot">
          <p className="about-note">
            {isSv
              ? "BudAI är under utveckling. Vi lovar inget vi inte kan hålla — men du kan testa allt som redan fungerar."
              : "BudAI is in development. We won't promise what we can't hold — but everything that already works is yours to try."}
          </p>
          <a href="#playground" className="about-link">
            {isSv ? "Till Playground" : "Go to the Playground"}
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
