import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "@/components/sections/ContactForm";
export const metadata: Metadata = {
  title: { absolute: "Contact · Stilledev" },
  description: "Contact Stilledev (sole proprietorship, Sweden) about BudAI, AI development, automation or partnerships. Messages go directly to our inbox system — no silent loss.",
  alternates: { canonical: "/contact" },
  openGraph: { title: "Contact · Stilledev", description: "Talk to Stilledev about BudAI and AI development in Sweden.", images: ["/og.png"] },
  twitter: { card: "summary_large_image", title: "Contact · Stilledev", description: "Talk to Stilledev about BudAI and AI development in Sweden.", images: ["/og.png"] },
};
export default function ContactPage(){
  return (<main id="main" tabIndex={-1} className="min-h-screen bg-background px-4 py-16 text-white sm:px-6">
    <div className="mx-auto max-w-3xl">
      <Link href="/" className="text-sm text-accent-cyan hover:underline">← Back to BudAI</Link>
      <h1 className="mt-6 text-4xl font-bold tracking-tight">Contact Stilledev</h1>
      <p className="mt-3 text-muted">Questions about BudAI, AI development, automation or a project idea? Send a message — it is stored in our system and answered by a human. Prefer email? <a className="text-accent-cyan underline" href="mailto:Stilleinc@hotmail.com">Stilleinc@hotmail.com</a></p>
      <div className="mt-8"><ContactForm /></div>
      <p className="mt-6 text-xs leading-relaxed text-muted">Privacy: your name, email and message are stored only to answer your enquiry (GDPR legal basis: legitimate interest / pre-contract). We never sell contact data. See our <Link className="underline" href="/legal/privacy">privacy policy</Link> and <Link className="underline" href="/legal/gdpr">GDPR page</Link>. Stilledev is a Swedish sole proprietorship (enskild firma). Registration/VAT numbers are provided on invoices and formal documents — not published here until confirmed for web publication.</p>
    </div>
  </main>);
}
