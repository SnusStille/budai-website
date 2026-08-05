import { createClient } from "@supabase/supabase-js";
import { WaitlistUser } from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// Fallback mock data (used if Supabase is not connected)
const mockUsers: WaitlistUser[] = [
  { id: "1", name: "Anna Lindqvist", email: "anna@techcorp.se", company: "TechCorp AB", industry: "Technology", employees: "50-200", interest: "Automation", type: "business", created_at: "2026-07-20T10:00:00Z", access_status: "approved" },
  { id: "2", name: "Erik Johansson", email: "erik@nordicretail.se", company: "Nordic Retail", industry: "Retail", employees: "200-1000", interest: "Data Analysis", type: "business", created_at: "2026-07-21T14:30:00Z", access_status: "pending" },
  { id: "3", name: "Sofia Bergström", email: "sofia@healthplus.se", company: "HealthPlus", industry: "Healthcare", employees: "10-50", interest: "Customer Support", type: "business", created_at: "2026-07-22T09:15:00Z", access_status: "pending" },
  { id: "4", name: "Marcus Holm", email: "marcus@finova.se", company: "Finova Group", industry: "Finance", employees: "1000+", interest: "Workflow Optimization", type: "business", created_at: "2026-07-23T16:45:00Z", access_status: "approved" },
  { id: "5", name: "Lisa Andersson", email: "lisa@buildit.se", company: "BuildIt Construction", industry: "Construction", employees: "50-200", interest: "Document Generation", type: "business", created_at: "2026-07-24T11:20:00Z", access_status: "pending" },
];

export const mockAnalytics = [
  { date: "Mon", visits: 120, signups: 8, playground_uses: 45 },
  { date: "Tue", visits: 180, signups: 12, playground_uses: 62 },
  { date: "Wed", visits: 240, signups: 18, playground_uses: 89 },
  { date: "Thu", visits: 210, signups: 15, playground_uses: 74 },
  { date: "Fri", visits: 320, signups: 24, playground_uses: 112 },
  { date: "Sat", visits: 150, signups: 9, playground_uses: 38 },
  { date: "Sun", visits: 190, signups: 14, playground_uses: 56 },
];

// Check if Supabase is configured
const isSupabaseReady = () => {
  return !!supabase && !!supabaseUrl && !!supabaseKey && !supabaseUrl.includes("your-project");
};

export async function getWaitlistUsers(): Promise<WaitlistUser[]> {
  if (!isSupabaseReady()) {
    return new Promise((resolve) => setTimeout(() => resolve([...mockUsers]), 600));
  }

  const { data, error } = await supabase!
    .from("waitlist_users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase error:", error);
    return mockUsers;
  }

  return data || [];
}

export async function addWaitlistUser(
  user: Omit<WaitlistUser, "id" | "created_at" | "access_status">
): Promise<WaitlistUser> {
  if (!isSupabaseReady()) {
    const newUser: WaitlistUser = {
      id: String(mockUsers.length + 1),
      ...user,
      created_at: new Date().toISOString(),
      access_status: "pending",
    } as WaitlistUser;
    mockUsers.unshift(newUser);
    return new Promise((resolve) => setTimeout(() => resolve(newUser), 800));
  }

  const { data, error } = await supabase!
    .from("waitlist_users")
    .insert([{ ...user, access_status: "pending" }])
    .select()
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw error;
  }

  return data;
}

export async function updateUserStatus(id: string, status: WaitlistUser["access_status"]): Promise<void> {
  if (!isSupabaseReady()) {
    const user = mockUsers.find((u) => u.id === id);
    if (user) user.access_status = status;
    return new Promise((resolve) => setTimeout(resolve, 400));
  }

  const { error } = await supabase!
    .from("waitlist_users")
    .update({ access_status: status })
    .eq("id", id);

  if (error) {
    console.error("Supabase error:", error);
    throw error;
  }
}

export async function deleteUser(id: string): Promise<void> {
  if (!isSupabaseReady()) {
    const idx = mockUsers.findIndex((u) => u.id === id);
    if (idx > -1) mockUsers.splice(idx, 1);
    return new Promise((resolve) => setTimeout(resolve, 400));
  }

  const { error } = await supabase!
    .from("waitlist_users")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Supabase error:", error);
    throw error;
  }
}
