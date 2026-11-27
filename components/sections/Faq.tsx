"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";
import { LIMITS } from "@/lib/limits";

export default function Faq() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const items = sv ? [
    { question: "Är BudAI gratis?", answer: `Basic är gratis under förhandsvisningen: ${LIMITS.guest.messagesPerDay} meddelanden per dag som gäst och ${LIMITS.member.messagesPerDay} med konto. Fler nivåer är under utveckling och priser är inte satta.`, href: "#capabilities", link: "Se vad som ingår" },
    { question: "Behöver jag skapa ett konto?", answer: `Nej. Du kan prova direkt som gäst med ${LIMITS.guest.messagesPerDay} meddelanden per dag. Ett kostnadsfritt konto ger historik, minne du kan styra och bildanalys.`, href: "#playground", link: "Öppna Playground" },
    { question: "Fungerar BudAI på svenska och engelska?", answer: "Ja. Du kan skriva på svenska eller engelska och byta svarsspråk i Playground.", href: "#playground", link: "Prova Playground" },
    { question: "Hur fungerar minnet?", answer: "Med konto kan BudAI spara minnen för att anpassa framtida svar. Du kan granska, redigera, stänga av eller radera dem i minnespanelen.", href: "/legal/privacy", link: "Läs om integritet" },
    { question: "Är BudAI färdig?", answer: "BudAI är en utvecklarförhandsvisning. Funktioner och gränser kan ändras medan arbetsytan förbättras; inga lanseringsdatum eller priser utlovas.", href: "/changelog", link: "Se vad som är nytt" },
  ] : [
    { question: "Is BudAI free to use?", answer: `Basic is free during the preview: ${LIMITS.guest.messagesPerDay} messages a day as a guest and ${LIMITS.member.messagesPerDay} with an account. More tiers are in development and prices are not set.`, href: "#capabilities", link: "See what is included" },
    { question: "Do I need an account?", answer: `No. You can try BudAI as a guest with ${LIMITS.guest.messagesPerDay} messages a day. A free account adds history, memory you control, and image analysis.`, href: "#playground", link: "Open the Playground" },
    { question: "Does BudAI work in Swedish and English?", answer: "Yes. Write in Swedish or English, and switch the response language in the Playground.", href: "#playground", link: "Try the Playground" },
    { question: "How does memory work?", answer: "With an account, BudAI can save memories to tailor future replies. You can review, edit, switch off, or delete them in the memory panel.", href: "/legal/privacy", link: "Read the privacy details" },
    { question: "Is BudAI finished?", answer: "BudAI is a developer preview. Features and limits may change as the workspace improves; no launch date or pricing is promised.", href: "/changelog", link: "See what is new" },
  ];

  return (
    <section id="faq" className="faq-section" aria-labelledby="faq-title">
      <div className="faq-intro">
        <p className="faq-eyebrow">BUDAI / {sv ? "BRA ATT VETA" : "GOOD TO KNOW"}</p>
        <h2 id="faq-title">{sv ? "Frågor, utan krångel." : "A few good questions."}</h2>
        <p>{sv ? "Kort och tydligt om hur du börjar, vad som ingår och hur du styr ditt minne." : "Clear answers about getting started, what is included, and how you control memory."}</p>
        <Link href={sv ? "/sv/contact" : "/contact"}>{sv ? "Har du fler frågor? Kontakta oss" : "Still have a question? Talk to us"}<span aria-hidden="true"> ↗</span></Link>
      </div>
      <div className="faq-list">
        {items.map(({ question, answer, href, link }) => (
          <details className="faq-item" key={question}>
            <summary><span>{question}</span><Plus size={16} aria-hidden="true" /></summary>
            <div className="faq-answer"><p>{answer}</p><Link href={href}>{link}<span aria-hidden="true"> ↗</span></Link></div>
          </details>
        ))}
      </div>
    </section>
  );
}
