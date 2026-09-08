import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { WaitlistUser } from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Lazy client — never throw at module load when env vars are missing
// (required for production builds / prerender without secrets).
let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
  if (!isSupabaseReady()) return null;
  if (!_supabase) {
    _supabase = createClient(supabaseUrl, supabaseKey);
  }
  return _supabase;
}

// Fallback mock data (used if Supabase is not connected)
const mockUsers: WaitlistUser[] = [
  {
    id: "1",
    name: "Anna Lindqvist",
    email: "anna@techcorp.se",
    account_type: "company",
    company: "TechCorp AB",
    industry: "Technology",
    employees: "50-200",
    interest: "Automation",
    created_at: "2026-07-20T10:00:00Z",
    access_status: "approved",
  },
  {
    id: "2",
    name: "Erik Johansson",
    email: "erik@nordicretail.se",
    account_type: "company",
    company: "Nordic Retail",
    industry: "Retail",
    employees: "200-1000",
    interest: "Data Analysis",
    created_at: "2026-07-21T14:30:00Z",
    access_status: "pending",
  },
  {
    id: "3",
    name: "Sofia Bergström",
    email: "sofia.b@gmail.com",
    account_type: "individual",
    company: null,
    industry: null,
    employees: null,
    interest: "Customer Support",
    created_at: "2026-07-22T09:15:00Z",
    access_status: "pending",
  },
  {
    id: "4",
    name: "Marcus Holm",
    email: "marcus@finova.se",
    account_type: "company",
    company: "Finova Group",
    industry: "Finance",
    employees: "1000+",
    interest: "Workflow Optimization",
    created_at: "2026-07-23T16:45:00Z",
    access_status: "approved",
  },
  {
    id: "5",
    name: "Lisa Andersson",
    email: "lisa.andersson@outlook.com",
    account_type: "individual",
    company: null,
    industry: null,
    employees: null,
    interest: "Document Generation",
    created_at: "2026-07-24T11:20:00Z",
    access_status: "pending",
  },
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

const isSupabaseReady = () => {
  return Boolean(
    supabaseUrl &&
      supabaseKey &&
      !supabaseUrl.includes("your-project") &&
      supabaseUrl.startsWith("http")
  );
};

export async function getWaitlistUsers(): Promise<WaitlistUser[]> {
  const supabase = getSupabase();
  if (!supabase) {
    return [...mockUsers];
  }

  const { data, error } = await supabase
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
  const supabase = getSupabase();
  if (!supabase) {
    const newUser: WaitlistUser = {
      id: String(mockUsers.length + 1),
      ...user,
      created_at: new Date().toISOString(),
      access_status: "pending",
    };
    mockUsers.unshift(newUser);
    return newUser;
  }

  const { data, error } = await supabase
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

export async function updateUserStatus(
  id: string,
  status: WaitlistUser["access_status"]
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    const user = mockUsers.find((u) => u.id === id);
    if (user) user.access_status = status;
    return;
  }

  const { error } = await supabase
    .from("waitlist_users")
    .update({ access_status: status })
    .eq("id", id);

  if (error) {
    console.error("Supabase error:", error);
    throw error;
  }
}

export async function deleteUser(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    const idx = mockUsers.findIndex((u) => u.id === id);
    if (idx > -1) mockUsers.splice(idx, 1);
    return;
  }

  const { error } = await supabase.from("waitlist_users").delete().eq("id", id);

  if (error) {
    console.error("Supabase error:", error);
    throw error;
  }
}

export async function getWaitlistCount(): Promise<number> {
  const supabase = getSupabase();
  if (!supabase) return mockUsers.length;

  const { count, error } = await supabase
    .from("waitlist_users")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("Supabase count error:", error);
    return mockUsers.length;
  }

  return count ?? mockUsers.length;
}
