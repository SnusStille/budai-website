import { ArrowUpRight, Plus } from "lucide-react";

export default function LabsLegal() {
  return <details className="lab-legal" id="legal">
    <summary><span><small>INFORMATION / 05</small><strong>Legal &amp; Transparency</strong><em>Business, privacy &amp; your rights</em></span><Plus size={20} aria-hidden="true" /></summary>
    <div className="lab-legal-content" lang="en">
      <p className="lab-legal-lead">This is a transparency overview, not a complete privacy notice. Details marked “to be confirmed” must be completed before relying on this information.</p>
      <div className="lab-legal-grid">
        <div><h3>Business identity</h3><p>Stilledev is described as a Swedish sole proprietorship (enskild firma). The proprietor and business are not separate legal persons; the proprietor is personally responsible for the business’s obligations.</p><p><b>To be confirmed:</b> registered legal business name and registration details, F-tax approval, VAT registration and number, business address and phone. An Allabolag listing link is also to be confirmed.</p></div>
        <div><h3>Personal data &amp; contacts</h3><p>Contact details can potentially come directly from individuals, business relationships, public directories or other providers. Being publicly available does not automatically permit processing or marketing use.</p><p><b>To be confirmed:</b> actual sources, categories of data, purposes, lawful bases, recipients or service providers, international transfers, and retention periods. No particular source or provider is asserted here.</p></div>
        <div><h3>Your rights</h3><p>Depending on the circumstances, you may request access, rectification, erasure, restriction or portability, and object to processing. You may object to direct marketing at any time; personal data must then no longer be processed for that purpose. You can also complain to IMY.</p><p>Privacy contact: <a href="mailto:Stilleinc@hotmail.com">Stilleinc@hotmail.com</a></p></div>
        <div><h3>Rules &amp; marketing</h3><p>Applicable rules may include GDPR (EU 2016/679), the Swedish Data Protection Act (2018:218), Marketing Act (2008:486), and Distance Contracts Act (2005:59). Telephone marketing may require checks against NIX-Telefon and other safeguards; consumer phone sales initiated by a trader generally require written acceptance after the call, subject to applicable exceptions.</p><p>Contracts, invoices, payment and any VAT depend on the circumstances. This overview is general information, not legal or tax advice.</p></div>
      </div>
      <div className="lab-authority-links lab-legal-sources"><span>OFFICIAL SOURCES</span><a href="https://www.imy.se/" target="_blank" rel="noopener noreferrer">IMY <ArrowUpRight size={12} /></a><a href="https://www.konsumentverket.se/" target="_blank" rel="noopener noreferrer">Konsumentverket <ArrowUpRight size={12} /></a><a href="https://bolagsverket.se/" target="_blank" rel="noopener noreferrer">Bolagsverket <ArrowUpRight size={12} /></a><a href="https://www.skatteverket.se/" target="_blank" rel="noopener noreferrer">Skatteverket <ArrowUpRight size={12} /></a><a href="https://eur-lex.europa.eu/eli/reg/2016/679/oj" target="_blank" rel="noopener noreferrer">EUR-Lex / GDPR <ArrowUpRight size={12} /></a></div>
    </div>
  </details>;
}
