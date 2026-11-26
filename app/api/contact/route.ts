import { NextRequest, NextResponse } from "next/server";
import { serviceClient } from "@/lib/supabase/service";
import { RULES, checkRateLimit, rateLimitKey } from "@/lib/rate-limit";
import { logEvent, newRequestId } from "@/lib/log";
import { sendEmail } from "@/lib/email";
import { CONTACT_EMAIL } from "@/lib/contact";
export async function POST(req: NextRequest) {
  const requestId = newRequestId();
  const limit = checkRateLimit(rateLimitKey(req, RULES.feedback, "contact"), { name:"contact", limit:10, windowMs:3600_000 });
  if (limit.limited) return NextResponse.json({ error:"rate_limited" }, { status:429, headers:{ "Retry-After": String(limit.retryAfterSeconds) } });
  const b = await req.json().catch(()=>({})) as Record<string,unknown>;
  if (String(b.website||"")) return NextResponse.json({ ok:true }); // honeypot: silent success
  const name = String(b.name||"").trim().slice(0,120), email = String(b.email||"").trim().slice(0,254);
  const message = String(b.message||"").trim().slice(0,5000), subject = String(b.subject||"General enquiry").trim().slice(0,160);
  const company = String(b.company||"").trim().slice(0,160) || null;
  if (name.length<1 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length<3 || b.consent!==true)
    return NextResponse.json({ error:"validation" }, { status:400 });
  const sb = serviceClient();
  if (!sb) { if (process.env.NODE_ENV==="development") return NextResponse.json({ ok:true, dev:true, stored:false }); return NextResponse.json({ error:"not_configured" }, { status:503 }); }
  const { error } = await sb.from("contact_submissions").insert({ name, email, company, subject, message, source:"contact_form" });
  if (error) { logEvent("error","contact.insert",{ requestId, message:error.message.slice(0,200) }); return NextResponse.json({ error:"could_not_save" }, { status:500 }); }
  // Persist first: an email-provider outage must never discard a lead. When
  // Resend is configured, the full enquiry goes to the canonical inbox; the
  // admin CRM remains the durable fallback and is available without email keys.
  const [notificationSent] = await Promise.all([
    sendEmail(
      CONTACT_EMAIL,
      `Stilledev enquiry: ${subject}`,
      `New website enquiry\n\nName: ${name}\nReply-to: ${email}\nCompany: ${company || "—"}\nSubject: ${subject}\n\nMessage:\n${message}\n\nReview and manage this lead in /admin → Contact / Leads.`,
    ),
    sendEmail(email, "We received your message — Stilledev", `Hi ${name},\n\nThanks for contacting Stilledev. Your enquiry has been saved and sent to our contact inbox. We will reply to this email address.\n\n— Stilledev (Sweden)`),
  ]);
  if (!notificationSent) logEvent("warn", "contact.email_not_delivered", { requestId });
  return NextResponse.json({ ok:true, emailNotificationSent:notificationSent });
}
