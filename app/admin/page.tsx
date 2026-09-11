"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Lock,
  Eye,
  EyeOff,
  Shield,
  RefreshCw,
  Download,
  Search,
  Filter,
  Mail,
  Users,
  Building2,
  Tag,
  Copy,
  Check,
  LayoutDashboard,
  List,
  Terminal as TerminalIcon,
  BarChart3,
  Cpu,
  Activity,
  Database,
  Globe,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import StatsCards from "@/components/admin/StatsCards";
import UserTable from "@/components/admin/UserTable";
import ActivityChart from "@/components/admin/ActivityChart";
import SystemTerminal from "@/components/admin/SystemTerminal";
import BudAILogo, { StilledevMark } from "@/components/ui/BudAILogo";
import { getWaitlistUsers, getWaitlistStats, updateUserStatus, getAdminEvents, logAdminEvent } from "@/lib/data";
import { WaitlistUser, AdminEvent } from "@/types";
import { createClient, isAuthConfigured } from "@/lib/supabase/client";

/**
 * Admin password: Daylightshere76 (or NEXT_PUBLIC_ADMIN_PASSWORD).
 * NEVER show the password string in the UI.
 */
const ADMIN_PASSWORD =
  process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "Daylightshere76";

type Tab = "overview" | "waitlist" | "platform" | "ops" | "export";

export default function AdminPage() {
  const [users, setUsers] = useState<WaitlistUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [quickFilter, setQuickFilter] = useState("");
  const [copied, setCopied] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [inviteSubject, setInviteSubject] = useState("You're in — BudAI early access");
  const [inviteBody, setInviteBody] = useState(
    ["Hi {name},", "", "Welcome to BudAI early access. Your code: BUDAI-EARLY-10 (10% off at launch).", "", "— Stilledev"].join("\n")
  );
  const [inviteCopied, setInviteCopied] = useState(false);
  const [platform, setPlatform] = useState<{
    profiles: number | null;
    conversations: number | null;
    memories: number | null;
    usageToday: number | null;
    guestsToday: number | null;
    note: string;
  }>({ profiles: null, conversations: null, memories: null, usageToday: null, guestsToday: null, note: "—" });

  useEffect(() => {
    const saved = sessionStorage.getItem("budai_admin_auth");
    if (saved === "true") setAuthenticated(true);
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    Promise.all([getWaitlistUsers(), getAdminEvents(40)]).then(([data, ev]) => {
      setUsers(data);
      setEvents(ev);
      setLoading(false);
    });
    void (async () => {
      if (!isAuthConfigured()) {
        setPlatform((p) => ({ ...p, note: "Supabase not configured" }));
        return;
      }
      const sb = createClient();
      if (!sb) {
        setPlatform((p) => ({ ...p, note: "No client" }));
        return;
      }
      try {
        const day = new Date().toISOString().slice(0, 10);
        const [prof, conv, mem, usage, guest] = await Promise.all([
          sb.from("profiles").select("id", { count: "exact", head: true }),
          sb.from("conversations").select("id", { count: "exact", head: true }),
          sb.from("memories").select("id", { count: "exact", head: true }).eq("active", true),
          sb.from("usage_daily").select("messages").eq("day", day),
          sb.from("usage_guest_daily").select("messages").eq("day", day),
        ]);
        const sum = (rows: { messages?: number }[] | null) =>
          (rows || []).reduce((a, r) => a + (r.messages || 0), 0);
        const err =
          prof.error || conv.error || mem.error || usage.error || guest.error
            ? "Run MIGRATION_v4_product.sql for live counters"
            : "Live counters (RLS may limit anon reads)";
        setPlatform({
          profiles: prof.count ?? null,
          conversations: conv.count ?? null,
          memories: mem.count ?? null,
          usageToday: usage.error ? null : sum(usage.data as { messages?: number }[]),
          guestsToday: guest.error ? null : sum(guest.data as { messages?: number }[]),
          note: err,
        });
      } catch {
        setPlatform((p) => ({ ...p, note: "Could not load platform tables" }));
      }
    })();
  }, [authenticated]);

  const stats = useMemo(() => getWaitlistStats(users), [users]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setError(false);
      sessionStorage.setItem("budai_admin_auth", "true");
    } else {
      setError(true);
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      const [data, ev] = await Promise.all([getWaitlistUsers(), getAdminEvents(40)]);
      setUsers(data);
      setEvents(ev);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const exportCsv = () => {
    const header = [
      "id",
      "name",
      "email",
      "account_type",
      "company",
      "industry",
      "employees",
      "interest",
      "access_status",
      "discount_code",
      "notes",
      "source",
      "created_at",
    ];
    const rows = users.map((u) => {
      const row: Record<string, string | null | undefined> = {
        id: u.id,
        name: u.name,
        email: u.email,
        account_type: u.account_type,
        company: u.company,
        industry: u.industry,
        employees: u.employees,
        interest: u.interest,
        access_status: u.access_status,
        discount_code: u.discount_code,
        notes: u.notes,
        source: u.source,
        created_at: u.created_at,
      };
      return header
        .map((h) => {
          const v = row[h];
          const s = v == null ? "" : String(v);
          return `"${s.replace(/"/g, '""')}"`;
        })
        .join(",");
    });
    const blob = new Blob([[header.join(","), ...rows].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `budai-waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyEmails = async (status?: WaitlistUser["access_status"]) => {
    const list = users
      .filter((u) => (status ? u.access_status === status : true))
      .map((u) => u.email)
      .join("\n");
    try {
      await navigator.clipboard.writeText(list);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const bulkApprovePending = async () => {
    if (!confirm(`Approve all ${stats.pending} pending users?`)) return;
    setBulkBusy(true);
    try {
      const pending = users.filter((u) => u.access_status === "pending");
      for (const u of pending) {
        await updateUserStatus(u.id, "approved");
      }
      await logAdminEvent("bulk_approve", `Approved ${pending.length} pending users`);
      await refresh();
    } finally {
      setBulkBusy(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[480px] h-[480px] bg-accent-cyan/[0.06] rounded-full blur-[120px] pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="text-center mb-8">
            <div className="mx-auto mb-5 flex justify-center">
              <BudAILogo size="lg" animated />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
              BudAI Control Center
            </h1>
            <p className="text-muted text-sm max-w-sm mx-auto leading-relaxed">
              Restricted to <span className="text-accent-cyan font-medium">Stille</span>{" "}
              (Stilledev) only. Access key is never shown here. If you landed by accident — leave.
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="rounded-2xl p-8 border border-white/[0.1] bg-white/[0.03] backdrop-blur-xl shadow-[0_0_60px_rgba(0,229,255,0.06)]"
          >
            <div className="space-y-4">
              <div>
                <label htmlFor="admin-password" className="block text-sm text-muted mb-2">
                  Access key
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(false);
                    }}
                    placeholder="Enter your key"
                    className="w-full pl-11 pr-12 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted focus:outline-none focus:border-accent-cyan/40"
                    autoFocus
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                    aria-label={showPassword ? "Hide" : "Show"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400 text-xs mt-2"
                    role="alert"
                  >
                    Access denied.
                  </motion.p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-purple text-white font-semibold text-sm hover:opacity-95 transition-opacity"
              >
                Enter
              </button>
            </div>
          </form>

          <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-left">
            <div className="flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-accent-cyan shrink-0 mt-0.5" />
              <div className="text-[11px] text-muted leading-relaxed">
                <p className="text-white/80 font-medium mb-1">Owner-only console</p>
                <p>
                  Built for Stilledev operations — waitlist, early-access codes, and system health.
                  Unauthorized access is not permitted.
                </p>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-muted/40 mt-6 inline-flex items-center justify-center gap-1.5 w-full">
            BudAI by <StilledevMark size={14} /> <span className="text-accent-cyan">Stilledev</span>
          </p>
        </motion.div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "waitlist", label: "Waitlist", icon: List },
    { id: "platform", label: "Platform", icon: Cpu },
    { id: "ops", label: "Ops", icon: TerminalIcon },
    { id: "export", label: "Export", icon: Download },
  ];

  const recent = [...users]
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
    .slice(0, 5);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <motion.div
          id="dashboard"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="scroll-mt-24"
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <BudAILogo size="sm" animated={false} />
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Control Center
                </h1>
              </div>
              <p className="text-muted text-sm inline-flex items-center gap-1.5 flex-wrap">
                <StilledevMark size={14} />
                Stilledev ops · waitlist · early access ·{" "}
                <span className="font-mono text-accent-cyan/80">v0.93</span>
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={refresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-white/10 bg-white/[0.03] text-sm text-muted hover:text-white transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <button
                type="button"
                onClick={exportCsv}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-white/10 bg-white/[0.03] text-sm text-muted hover:text-white transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                CSV
              </button>
              <button
                type="button"
                onClick={() => {
                  sessionStorage.removeItem("budai_admin_auth");
                  setAuthenticated(false);
                  setPassword("");
                }}
                className="px-3.5 py-2 rounded-lg border border-white/10 bg-white/[0.03] text-sm text-muted hover:text-white transition-colors"
              >
                Log out
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] w-fit">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.id
                  ? "bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/25"
                  : "text-muted hover:text-white border border-transparent"
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-accent-cyan" />
                <h2 className="text-sm font-semibold text-white">Overview</h2>
              </div>
              <StatsCards users={users} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-white mb-3">Recent signups</h3>
                <div className="space-y-2">
                  {loading && <p className="text-sm text-muted">Loading…</p>}
                  {!loading && recent.length === 0 && (
                    <p className="text-sm text-muted">No signups yet.</p>
                  )}
                  {recent.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border border-white/[0.05] bg-white/[0.02]"
                    >
                      <div className="min-w-0">
                        <div className="text-sm text-white font-medium truncate">{u.name}</div>
                        <div className="text-[11px] text-muted truncate">{u.email}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                            u.access_status === "approved"
                              ? "text-accent-green border-accent-green/25 bg-accent-green/10"
                              : u.access_status === "rejected"
                                ? "text-red-400 border-red-400/25 bg-red-400/10"
                                : "text-amber-300 border-amber-400/25 bg-amber-400/10"
                          }`}
                        >
                          {u.access_status}
                        </div>
                        <div className="text-[10px] text-muted mt-1 font-mono">
                          {new Date(u.created_at).toLocaleDateString("sv-SE")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-5 space-y-3">
                <h3 className="text-sm font-semibold text-white">Quick actions</h3>
                <button
                  type="button"
                  onClick={() => setTab("waitlist")}
                  className="w-full text-left px-3 py-2.5 rounded-xl border border-white/[0.06] hover:border-accent-cyan/30 text-sm text-white/80 hover:bg-white/[0.03] flex items-center gap-2"
                >
                  <Users className="w-4 h-4 text-accent-cyan" /> Manage waitlist
                </button>
                <button
                  type="button"
                  onClick={() => copyEmails("pending")}
                  className="w-full text-left px-3 py-2.5 rounded-xl border border-white/[0.06] hover:border-accent-cyan/30 text-sm text-white/80 hover:bg-white/[0.03] flex items-center gap-2"
                >
                  <Mail className="w-4 h-4 text-accent-purple" />
                  {copied ? "Copied!" : "Copy pending emails"}
                </button>
                <button
                  type="button"
                  disabled={bulkBusy || stats.pending === 0}
                  onClick={() => void bulkApprovePending()}
                  className="w-full text-left px-3 py-2.5 rounded-xl border border-white/[0.06] hover:border-accent-green/30 text-sm text-white/80 hover:bg-white/[0.03] flex items-center gap-2 disabled:opacity-40"
                >
                  <Check className="w-4 h-4 text-accent-green" /> Approve all pending (
                  {stats.pending})
                </button>
                <button
                  type="button"
                  onClick={exportCsv}
                  className="w-full text-left px-3 py-2.5 rounded-xl border border-white/[0.06] hover:border-white/20 text-sm text-white/80 hover:bg-white/[0.03] flex items-center gap-2"
                >
                  <Download className="w-4 h-4 text-muted" /> Export CSV
                </button>
                <div className="pt-2 border-t border-white/[0.06] text-[11px] text-muted space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3 h-3 text-accent-green" /> Codes issued: {stats.withDiscount}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3 h-3 text-accent-cyan" /> Companies: {stats.companies}
                  </div>
                </div>
              </div>
            </div>

            <ActivityChart />
          </div>
        )}

        {tab === "waitlist" && (
          <div id="waitlist" className="scroll-mt-24 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[180px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
                <input
                  value={quickFilter}
                  onChange={(e) => setQuickFilter(e.target.value)}
                  placeholder="Filter table…"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent-cyan/40"
                />
              </div>
              <span className="text-xs text-muted inline-flex items-center gap-1">
                <Filter className="w-3 h-3" /> Use table filters for status / type
              </span>
            </div>
            <UserTable
              users={
                quickFilter
                  ? users.filter((u) => {
                      const q = quickFilter.toLowerCase();
                      return (
                        u.name.toLowerCase().includes(q) ||
                        u.email.toLowerCase().includes(q) ||
                        (u.company || "").toLowerCase().includes(q)
                      );
                    })
                  : users
              }
              loading={loading}
              onUpdate={refresh}
            />
          </div>
        )}


        {tab === "platform" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { icon: Globe, label: "Site", value: "stilledev.se", note: "Public marketing" },
                { icon: MessageSquare, label: "Playground", value: "Product AI", note: "Auth · memory · vision" },
                { icon: Database, label: "Waitlist", value: String(users.length), note: "Signups" },
                { icon: Activity, label: "Preview", value: "v0.93 · 93%", note: "Toward launch" },
                { icon: Users, label: "Profiles", value: platform.profiles == null ? "—" : String(platform.profiles), note: "Auth users" },
                { icon: Cpu, label: "Conversations", value: platform.conversations == null ? "—" : String(platform.conversations), note: "Cloud threads" },
                { icon: Sparkles, label: "Memories", value: platform.memories == null ? "—" : String(platform.memories), note: "Active facts" },
                { icon: BarChart3, label: "Msgs today", value: platform.usageToday == null && platform.guestsToday == null ? "—" : String((platform.usageToday || 0) + (platform.guestsToday || 0)), note: platform.note },
              ].map((c) => (
                <div key={c.label} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-accent-cyan/10 flex items-center justify-center">
                      <c.icon className="w-4 h-4 text-accent-cyan" />
                    </div>
                    <span className="text-[11px] text-muted uppercase tracking-wide">{c.label}</span>
                  </div>
                  <div className="text-lg font-semibold text-white">{c.value}</div>
                  <div className="text-[11px] text-muted mt-1">{c.note}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 space-y-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent-purple" /> Feature surface
                </h3>
                <ul className="text-xs text-muted space-y-2 leading-relaxed">
                  <li className="flex justify-between gap-3 border-b border-white/[0.05] pb-2">
                    <span>Auth (Google + email OTP) + guest</span>
                    <span className="text-accent-green font-mono">on</span>
                  </li>
                  <li className="flex justify-between gap-3 border-b border-white/[0.05] pb-2">
                    <span>Cloud history + auto memory (members)</span>
                    <span className="text-accent-green font-mono">on</span>
                  </li>
                  <li className="flex justify-between gap-3 border-b border-white/[0.05] pb-2">
                    <span>Vision upload + image gen (keyed)</span>
                    <span className="text-accent-green font-mono">on</span>
                  </li>
                  <li className="flex justify-between gap-3 border-b border-white/[0.05] pb-2">
                    <span>Voice input (Web Speech)</span>
                    <span className="text-accent-green font-mono">on</span>
                  </li>
                  <li className="flex justify-between gap-3">
                    <span>Daily limits guest/member</span>
                    <span className="text-accent-green font-mono">on</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 space-y-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-accent-cyan" /> Model & env
                </h3>
                <div className="font-mono text-[11px] text-white/75 space-y-2 rounded-xl bg-black/25 border border-white/[0.05] p-3">
                  <div>ANTHROPIC_API_KEY · {process.env.NEXT_PUBLIC_SITE_URL ? "site url set" : "check env"}</div>
                  <div>Model default · claude-sonnet (server)</div>
                  <div>Admin gate · client password (Stille-only)</div>
                  <div>Waitlist · Supabase anon policies</div>
                </div>
                <p className="text-[11px] text-muted leading-relaxed">
                  Product counters need MIGRATION_v4_product.sql + service role for full admin reads.
                  Waitlist + platform_events remain sources of truth alongside usage_daily.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Launch readiness</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="rounded-xl border border-accent-green/20 bg-accent-green/[0.06] p-3">
                  <div className="text-accent-green text-xs font-mono mb-1">Ready</div>
                  <div className="text-white/90 text-xs leading-relaxed">Landing, waitlist, playground demo, legal, SEO basics</div>
                </div>
                <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-3">
                  <div className="text-amber-300 text-xs font-mono mb-1">Watch</div>
                  <div className="text-white/90 text-xs leading-relaxed">Admin is client-gated — add Vercel protection before scale</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="text-muted text-xs font-mono mb-1">Next</div>
                  <div className="text-white/90 text-xs leading-relaxed">Phone auth (Twilio), storage CDN, deeper admin RLS</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "ops" && (
          <div id="logs" className="scroll-mt-24 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden flex flex-col max-h-[420px]">
              <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Activity feed</h3>
                <span className="text-[10px] font-mono text-muted">{events.length} events</span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {events.length === 0 && (
                  <p className="text-xs text-muted p-2">No events yet — run schema for admin_events.</p>
                )}
                {events.map((ev) => (
                  <div
                    key={ev.id}
                    className="rounded-lg border border-white/[0.05] bg-black/20 px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="text-[10px] font-mono uppercase text-accent-cyan/80">{ev.kind}</span>
                      <span className="text-[10px] text-muted font-mono">
                        {new Date(ev.created_at).toLocaleString("sv-SE")}
                      </span>
                    </div>
                    <p className="text-xs text-white/80">{ev.message}</p>
                  </div>
                ))}
              </div>
            </div>
            <SystemTerminal />
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white">Ops checklist</h3>
              <ul className="text-xs text-muted space-y-2 list-disc pl-4 leading-relaxed">
                <li>Run <code className="font-mono text-white/70">supabase/schema.sql</code> + required <code className="font-mono text-white/70">MIGRATION_v4_product.sql</code></li>
                <li>Discount default: <code className="font-mono text-accent-green/80">BUDAI-EARLY-10</code></li>
                <li>Playground needs <code className="font-mono text-white/70">ANTHROPIC_API_KEY</code></li>
                <li>Tighten RLS before scale — service role for admin mutations</li>
                <li>Optional: Vercel password protect <code className="font-mono">/admin</code></li>
              </ul>
              <div className="pt-3 border-t border-white/[0.06]">
                <p className="text-[11px] text-muted mb-2">Live snapshot</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
                    <div className="text-muted text-[10px] uppercase">Pending</div>
                    <div className="text-xl font-bold text-amber-300">{stats.pending}</div>
                  </div>
                  <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
                    <div className="text-muted text-[10px] uppercase">Approved</div>
                    <div className="text-xl font-bold text-accent-green">{stats.approved}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "export" && (
          <div className="space-y-6 max-w-2xl">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">Export & outreach</h3>
            <p className="text-sm text-muted">
              Download waitlist CSV or copy email lists for campaigns.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={exportCsv}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-purple text-sm font-semibold text-white"
              >
                <Download className="w-4 h-4" /> Download CSV ({users.length})
              </button>
              <button
                type="button"
                onClick={() => copyEmails()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-sm text-white/80 hover:bg-white/5"
              >
                {copied ? <Check className="w-4 h-4 text-accent-green" /> : <Copy className="w-4 h-4" />}
                All emails
              </button>
              <button
                type="button"
                onClick={() => copyEmails("pending")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-sm text-white/80 hover:bg-white/5"
              >
                <Mail className="w-4 h-4" /> Pending only
              </button>
              <button
                type="button"
                onClick={() => copyEmails("approved")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-sm text-white/80 hover:bg-white/5"
              >
                <Mail className="w-4 h-4" /> Approved only
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6 space-y-3">
            <h3 className="text-lg font-semibold text-white">Invite draft</h3>
            <p className="text-xs text-muted">Local template — copy and paste into your mail client. Use {"{name}"} placeholder.</p>
            <input
              value={inviteSubject}
              onChange={(e) => setInviteSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-accent-cyan/40"
              placeholder="Subject"
            />
            <textarea
              value={inviteBody}
              onChange={(e) => setInviteBody(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white font-mono focus:outline-none focus:border-accent-cyan/40 resize-y"
            />
            <button
              type="button"
              onClick={async () => {
                const sample = users.find((u) => u.access_status === "approved") || users[0];
                const text = `Subject: ${inviteSubject}\n\n${inviteBody.replace(/\{name\}/g, sample?.name || "there")}`;
                try {
                  await navigator.clipboard.writeText(text);
                  setInviteCopied(true);
                  setTimeout(() => setInviteCopied(false), 1500);
                } catch { /* ignore */ }
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-purple text-sm font-semibold text-white"
            >
              {inviteCopied ? "Copied!" : "Copy sample invite"}
            </button>
          </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
