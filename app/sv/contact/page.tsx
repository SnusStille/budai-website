import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "@/components/sections/ContactForm";
export const metadata: Metadata = {
  title: { absolute: "Kontakt · Stilledev" },
  description: "Kontakta Stilledev (enskild firma, Sverige) om BudAI, AI-utveckling, automation eller samarbeten. Meddelanden sparas i vårt system — inget försvinner tyst.",
  alternates: { canonical: "/sv/contact", languages: { en: "/contact", sv: "/sv/contact" } },
  openGraph: { title: "Kontakt · Stilledev", description: "Prata med Stilledev om BudAI och AI-utveckling i Sverige.", images: ["/og.png"] },
};
export default function ContactPageSv(){
  return (<main id="main" tabIndex={-1} className="min-h-screen bg-background px-4 py-16 text-white sm:px-6">
    <div className="mx-auto max-w-3xl">
      <Link href="/sv" className="text-sm text-accent-cyan hover:underline">← Tillbaka till BudAI</Link>
      <h1 className="mt-6 text-4xl font-bold tracking-tight">Kontakta Stilledev</h1>
      <p className="mt-3 text-muted">Frågor om BudAI, AI-utveckling, automation eller en projektidé? Skicka ett meddelande — det sparas i vårt system och besvaras av en människa. Föredrar du e-post? <a className="text-accent-cyan underline" href="mailto:Stilleinc@hotmail.com">Stilleinc@hotmail.com</a></p>
      <div className="mt-8"><ContactForm /></div>
      <p className="mt-6 text-xs leading-relaxed text-muted">Integritet: namn, e-post och meddelande lagras endast för att besvara din förfrågan (GDPR). Vi säljer aldrig kontaktuppgifter. Se <Link className="underline" href="/legal/privacy">integritetspolicyn</Link> och <Link className="underline" href="/legal/gdpr">GDPR-sidan</Link>. Stilledev är en svensk enskild firma.</p>
    </div>
  </main>);
}
