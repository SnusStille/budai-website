import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { WaitlistUser, AdminEvent } from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
  if (!isSupabaseReady()) return null;
  if (!_supabase) {
    _supabase = createClient(supabaseUrl, supabaseKey);
  }
  return _supabase;
}

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
    discount_code: "BUDAI-EARLY-10",
    notes: null,
    source: "landing",
    priority: 80,
    last_contacted_at: null,
    tags: ["enterprise"],
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
    discount_code: "BUDAI-EARLY-10",
    notes: null,
    source: "landing",
    priority: 55,
    last_contacted_at: null,
    tags: [],
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
    discount_code: "BUDAI-EARLY-10",
    notes: null,
    source: "landing",
    priority: 40,
    last_contacted_at: null,
    tags: ["creator"],
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
    discount_code: "BUDAI-EARLY-10",
    notes: "Enterprise lead",
    source: "landing",
    priority: 95,
    last_contacted_at: "2026-08-01T10:00:00Z",
    tags: ["enterprise", "priority"],
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
    discount_code: "BUDAI-EARLY-10",
    notes: null,
    source: "landing",
    priority: 35,
    last_contacted_at: null,
    tags: null,
  },
];

const mockEvents: AdminEvent[] = [
  {
    id: "e1",
    kind: "signup",
    message: "New waitlist signup",
    meta: { email: "lisa.andersson@outlook.com" },
    created_at: new Date(Date.now() - 3600_000).toISOString(),
  },
  {
    id: "e2",
    kind: "approve",
    message: "User approved",
    meta: { email: "marcus@finova.se" },
    created_at: new Date(Date.now() - 7200_000).toISOString(),
  },
  {
    id: "e3",
    kind: "system",
    message: "Schema health check OK",
    meta: null,
    created_at: new Date(Date.now() - 10_800_000).toISOString(),
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

const isSupabaseReady = () =>
  Boolean(
    supabaseUrl &&
      supabaseKey &&
      !supabaseUrl.includes("your-project") &&
      supabaseUrl.startsWith("http")
  );

function normalizeUser(row: Record<string, unknown>): WaitlistUser {
  const tagsRaw = row.tags;
  let tags: string[] | null = null;
  if (Array.isArray(tagsRaw)) tags = tagsRaw.map(String);
  else if (typeof tagsRaw === "string" && tagsRaw) {
    try {
      const p = JSON.parse(tagsRaw);
      tags = Array.isArray(p) ? p.map(String) : [tagsRaw];
    } catch {
      tags = tagsRaw.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }

  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    email: String(row.email ?? ""),
    account_type: (row.account_type as WaitlistUser["account_type"]) || "individual",
    company: (row.company as string | null) ?? null,
    industry: (row.industry as string | null) ?? null,
    employees: (row.employees as string | null) ?? null,
    interest: String(row.interest ?? ""),
    created_at: String(row.created_at ?? new Date().toISOString()),
    access_status: (row.access_status as WaitlistUser["access_status"]) || "pending",
    discount_code: (row.discount_code as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    source: (row.source as string | null) ?? null,
    priority: row.priority == null ? null : Number(row.priority),
    last_contacted_at: (row.last_contacted_at as string | null) ?? null,
    tags,
  };
}

async function adminApi(method: string, body?: unknown, query = "") {
  const key = typeof window !== "undefined" ? sessionStorage.getItem("budai_admin_key") || "" : "";
  const res = await fetch(`/api/admin/waitlist${query}`, {
    method,
    headers: { "Content-Type": "application/json", "x-admin-key": key },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Admin request failed");
  return json;
}

async function mutate(id: string, fields: Record<string, unknown>): Promise<void> {
  if (!getSupabase()) {
    const u = mockUsers.find((x) => x.id === id);
    if (u) Object.assign(u, fields);
    return;
  }
  await adminApi("PATCH", { id, fields });
}

export async function getWaitlistUsers(): Promise<WaitlistUser[]> {
  if (!getSupabase()) return new Promise((r) => setTimeout(() => r([...mockUsers]), 400));
  try {
    const { users } = await adminApi("GET");
    return (users as Record<string, unknown>[]).map(normalizeUser);
  } catch (e) {
    console.error("Admin waitlist error:", e);
    return [];
  }
}

export async function addWaitlistUser(
  user: Omit<WaitlistUser, "id" | "created_at" | "access_status">
): Promise<WaitlistUser> {
  const payload = {
    ...user,
    discount_code: user.discount_code || "BUDAI-EARLY-10",
    source: user.source || "landing",
    priority: user.priority ?? 50,
    tags: user.tags ?? [],
  };

  const supabase = getSupabase();
  if (!supabase) {
    const newUser: WaitlistUser = {
      id: String(Date.now()),
      ...payload,
      created_at: new Date().toISOString(),
      access_status: "pending",
      last_contacted_at: null,
    };
    mockUsers.unshift(newUser);
    return new Promise((resolve) => setTimeout(() => resolve(newUser), 500));
  }

  const { error } = await supabase
    .from("waitlist_users")
    .insert([{ ...payload, access_status: "pending" }]);

  if (error) {
    console.error("Supabase error:", error);
    throw error;
  }

  return normalizeUser({
    ...payload,
    id: "",
    created_at: new Date().toISOString(),
    access_status: "pending",
  } as Record<string, unknown>);
}

export async function updateUserStatus(id: string, status: WaitlistUser["access_status"]): Promise<void> {
  return mutate(id, { access_status: status });
}

export async function updateUserNotes(id: string, notes: string): Promise<void> {
  return mutate(id, { notes });
}

export async function updateUserPriority(id: string, priority: number): Promise<void> {
  return mutate(id, { priority });
}

export async function markContacted(id: string): Promise<void> {
  return mutate(id, { last_contacted_at: new Date().toISOString() });
}

export async function deleteUser(id: string): Promise<void> {
  if (!getSupabase()) {
    const idx = mockUsers.findIndex((u) => u.id === id);
    if (idx > -1) mockUsers.splice(idx, 1);
    return;
  }
  await adminApi("DELETE", undefined, `?id=${encodeURIComponent(id)}`);
}

export async function getWaitlistCount(): Promise<number> {
  const supabase = getSupabase();
  if (!supabase) return mockUsers.length;
  const { data, error } = await supabase.rpc("waitlist_count");
  return error || typeof data !== "number" ? 0 : data;
}

export async function getAdminEvents(limit = 30): Promise<AdminEvent[]> {
  const supabase = getSupabase();
  if (!supabase) {
    return [...mockEvents];
  }

  const { data, error } = await supabase
    .from("admin_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    // table may not exist yet
    console.warn("admin_events:", error.message);
    return mockEvents;
  }

  return (data || []).map((r) => ({
    id: String(r.id),
    kind: String(r.kind ?? "system"),
    message: String(r.message ?? ""),
    meta: (r.meta as Record<string, unknown>) ?? null,
    created_at: String(r.created_at ?? new Date().toISOString()),
  }));
}

export async function logAdminEvent(
  kind: string,
  message: string,
  meta?: Record<string, unknown>
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    mockEvents.unshift({
      id: String(Date.now()),
      kind,
      message,
      meta: meta ?? null,
      created_at: new Date().toISOString(),
    });
    return;
  }

  const { error } = await supabase.from("admin_events").insert([{ kind, message, meta: meta ?? null }]);
  if (error) console.warn("logAdminEvent:", error.message);
}

export function getWaitlistStats(users: WaitlistUser[]) {
  const pending = users.filter((u) => u.access_status === "pending").length;
  const approved = users.filter((u) => u.access_status === "approved").length;
  const rejected = users.filter((u) => u.access_status === "rejected").length;
  const companies = users.filter((u) => u.account_type === "company").length;
  const individuals = users.filter((u) => u.account_type === "individual").length;
  const withDiscount = users.filter((u) => !!u.discount_code).length;
  const highPriority = users.filter((u) => (u.priority ?? 0) >= 70).length;
  return {
    total: users.length,
    pending,
    approved,
    rejected,
    companies,
    individuals,
    withDiscount,
    highPriority,
  };
}

export async function getWaitlistStatus(
  email: string
): Promise<{ position: number; total: number; code: string | null; referrals: number } | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("waitlist_status", { p_email: email });
  const row = Array.isArray(data) ? data[0] : data;
  if (error || !row) return null;
  return { position: row.pos as number, total: row.total as number, code: (row.code as string) ?? null, referrals: (row.referrals as number) ?? 0 };
}
