export interface WaitlistUser {
  id: string;
  name: string;
  email: string;
  company: string;
  industry: string;
  employees: string;
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
