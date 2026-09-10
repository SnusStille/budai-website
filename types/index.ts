export interface WaitlistUser {
  id: string;
  name: string;
  email: string;
  account_type: "individual" | "company";
  company: string | null;
  industry: string | null;
  employees: string | null;
  interest: string;
  created_at: string;
  access_status: "pending" | "approved" | "rejected";
  /** Early-bird 10% founder discount flag */
  discount_code: string | null;
  notes: string | null;
  source: string | null;
  /** Priority score 0–100 for launch invites */
  priority: number | null;
  /** Last contact / outreach timestamp */
  last_contacted_at: string | null;
  /** Soft tags e.g. enterprise, partner */
  tags: string[] | null;
}

export interface AdminEvent {
  id: string;
  kind: string;
  message: string;
  meta: Record<string, unknown> | null;
  created_at: string;
}

export interface AnalyticsData {
  date: string;
  visits: number;
  signups: number;
  playground_uses: number;
}

export interface SystemModule {
  name: string;
  status: "operational" | "building" | "maintenance";
  icon: string;
  latency: string;
}
