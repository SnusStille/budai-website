/**
 * Pure, dependency-free validation for waitlist signups.
 * Used by /api/waitlist only — never trust values coming from the browser.
 */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const EMPLOYEE_RANGES = ["1-10", "10-50", "50-200", "200-1000", "1000+"];

export type WaitlistRecord = {
  name: string;
  email: string;
  account_type: "individual" | "company";
  company: string | null;
  industry: string | null;
  employees: string | null;
  interest: string;
  discount_code: null;
  notes: string | null;
  source: string;
  priority: number;
  last_contacted_at: null;
  tags: string[];
  access_status: "pending";
};

export type ValidationResult =
  | { ok: true; value: WaitlistRecord }
  | { ok: false; error: "honeypot" | "invalid_email" | "consent_required" };

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export function validateWaitlist(body: unknown): ValidationResult {
  const b = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;

  // Hidden field: real users never fill it. The caller answers 200 without writing.
  if (str(b.website, 200)) return { ok: false, error: "honeypot" };

  const email = str(b.email, 254).toLowerCase();
  if (!EMAIL.test(email)) return { ok: false, error: "invalid_email" };
  if (b.consent !== true) return { ok: false, error: "consent_required" };

  const company = b.account_type === "company";
  const referral = str(b.referral, 64);
  const name = str(b.name, 120) || email.split("@")[0].slice(0, 120);
  const employees = str(b.employees, 20);

  return {
    ok: true,
    value: {
      name,
      email,
      account_type: company ? "company" : "individual",
      company: company ? str(b.company, 120) || null : null,
      industry: null,
      employees: company && EMPLOYEE_RANGES.includes(employees) ? employees : null,
      interest: str(b.interest, 200),
      discount_code: null,
      notes: referral ? `referral:${referral}` : null,
      source: referral ? "referral" : "landing",
      // Priority is decided here, never by the client.
      priority: company ? 60 : 45,
      last_contacted_at: null,
      tags: company ? ["company"] : ["individual"],
      access_status: "pending",
    },
  };
}
