import { WaitlistUser, AnalyticsData } from "@/types";

// MOCK DATA — Replace with Supabase client when ready
// import { createClient } from "@supabase/supabase-js";
// const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export const mockUsers: WaitlistUser[] = [
  { id: "1", name: "Anna Lindqvist", email: "anna@techcorp.se", company: "TechCorp AB", industry: "Technology", employees: "50-200", interest: "Automation", created_at: "2026-07-20T10:00:00Z", access_status: "approved" },
  { id: "2", name: "Erik Johansson", email: "erik@nordicretail.se", company: "Nordic Retail", industry: "Retail", employees: "200-1000", interest: "Data Analysis", created_at: "2026-07-21T14:30:00Z", access_status: "pending" },
  { id: "3", name: "Sofia Bergström", email: "sofia@healthplus.se", company: "HealthPlus", industry: "Healthcare", employees: "10-50", interest: "Customer Support", created_at: "2026-07-22T09:15:00Z", access_status: "pending" },
  { id: "4", name: "Marcus Holm", email: "marcus@finova.se", company: "Finova Group", industry: "Finance", employees: "1000+", interest: "Workflow Optimization", created_at: "2026-07-23T16:45:00Z", access_status: "approved" },
  { id: "5", name: "Lisa Andersson", email: "lisa@buildit.se", company: "BuildIt Construction", industry: "Construction", employees: "50-200", interest: "Document Generation", created_at: "2026-07-24T11:20:00Z", access_status: "pending" },
  { id: "6", name: "Johan Eriksson", email: "johan@edusmart.se", company: "EduSmart", industry: "Education", employees: "10-50", interest: "Marketing Content", created_at: "2026-07-25T08:00:00Z", access_status: "rejected" },
  { id: "7", name: "Emma Nilsson", email: "emma@greenenergy.se", company: "Green Energy Nordic", industry: "Energy", employees: "200-1000", interest: "Automation", created_at: "2026-07-26T13:10:00Z", access_status: "pending" },
  { id: "8", name: "David Karlsson", email: "david@logipro.se", company: "LogiPro", industry: "Logistics", employees: "50-200", interest: "Problem Solving", created_at: "2026-07-27T15:30:00Z", access_status: "pending" },
  { id: "9", name: "Maria Svensson", email: "maria@creativestudio.se", company: "Creative Studio", industry: "Media", employees: "10-50", interest: "Marketing Content", created_at: "2026-07-28T10:45:00Z", access_status: "approved" },
  { id: "10", name: "Anders Persson", email: "anders@manufactech.se", company: "Manufactech", industry: "Manufacturing", employees: "1000+", interest: "Workflow Optimization", created_at: "2026-07-29T09:00:00Z", access_status: "pending" },
];

export const mockAnalytics: AnalyticsData[] = [
  { date: "Mon", visits: 120, signups: 8, playground_uses: 45 },
  { date: "Tue", visits: 180, signups: 12, playground_uses: 62 },
  { date: "Wed", visits: 240, signups: 18, playground_uses: 89 },
  { date: "Thu", visits: 210, signups: 15, playground_uses: 74 },
  { date: "Fri", visits: 320, signups: 24, playground_uses: 112 },
  { date: "Sat", visits: 150, signups: 9, playground_uses: 38 },
  { date: "Sun", visits: 190, signups: 14, playground_uses: 56 },
];

// Supabase helper functions (ready to connect)
export async function getWaitlistUsers(): Promise<WaitlistUser[]> {
  // const { data, error } = await supabase.from("waitlist_users").select("*").order("created_at", { ascending: false });
  // if (error) throw error;
  // return data || [];
  return new Promise((resolve) => setTimeout(() => resolve([...mockUsers]), 600));
}

export async function addWaitlistUser(user: Omit<WaitlistUser, "id" | "created_at" | "access_status">): Promise<WaitlistUser> {
  // const { data, error } = await supabase.from("waitlist_users").insert([{ ...user, access_status: "pending" }]).select().single();
  // if (error) throw error;
  // return data;
  const newUser: WaitlistUser = {
    id: String(mockUsers.length + 1),
    ...user,
    created_at: new Date().toISOString(),
    access_status: "pending",
  };
  mockUsers.unshift(newUser);
  return new Promise((resolve) => setTimeout(() => resolve(newUser), 800));
}

export async function updateUserStatus(id: string, status: WaitlistUser["access_status"]): Promise<void> {
  // await supabase.from("waitlist_users").update({ access_status: status }).eq("id", id);
  const user = mockUsers.find((u) => u.id === id);
  if (user) user.access_status = status;
  return new Promise((resolve) => setTimeout(resolve, 400));
}

export async function deleteUser(id: string): Promise<void> {
  // await supabase.from("waitlist_users").delete().eq("id", id);
  const idx = mockUsers.findIndex((u) => u.id === id);
  if (idx > -1) mockUsers.splice(idx, 1);
  return new Promise((resolve) => setTimeout(resolve, 400));
}
