/**
 * Transactional email via Resend (optional). No dependency, no-op when unconfigured.
 * Set RESEND_API_KEY + EMAIL_FROM (verified domain) to enable. ADMIN_NOTIFICATION_EMAIL
 * receives new-lead alerts. Never logs addresses or message bodies.
 */
export async function sendEmail(to: string, subject: string, text: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY, from = process.env.EMAIL_FROM;
  if (!key || !from || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return false;
  try {
    const r = await fetch("https://api.resend.com/emails", { method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject: subject.slice(0, 160), text: text.slice(0, 4000) }) });
    return r.ok;
  } catch { return false; }
}
export const emailConfigured = () => !!(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
