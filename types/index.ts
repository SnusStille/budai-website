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
