/**
 * Transactional email via Resend (optional). No dependency, no-op when unconfigured.
 * Set RESEND_API_KEY + EMAIL_FROM (verified sender on a domain you control) to
 * enable delivery. New leads always target the canonical Stilledev inbox. Never
 * logs addresses or message bodies; the CRM database is the durable fallback.
 */
export async function sendEmail(to: string, subject: string, text: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY, from = process.env.EMAIL_FROM;
  if (!key || !from || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return false;
  try {
    const r = await fetch("https://api.resend.com/emails", { method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(8_000),
      body: JSON.stringify({ from, to: [to], subject: subject.replace(/[\r\n]+/g, " ").slice(0, 160), text: text.slice(0, 4000) }) });
    return r.ok;
  } catch { return false; }
}
export const emailConfigured = () => !!(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
