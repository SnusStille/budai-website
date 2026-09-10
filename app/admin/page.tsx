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
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import StatsCards from "@/components/admin/StatsCards";
import UserTable from "@/components/admin/UserTable";
import ActivityChart from "@/components/admin/ActivityChart";
import SystemTerminal from "@/components/admin/SystemTerminal";
import BudAILogo from "@/components/ui/BudAILogo";
import { getWaitlistUsers, getWaitlistStats, updateUserStatus } from "@/lib/data";
import { WaitlistUser } from "@/types";

/**
 * Admin password: Daylightshere76 (or NEXT_PUBLIC_ADMIN_PASSWORD).
 * NEVER show the password string in the UI.
 */
const ADMIN_PASSWORD =
  process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "Daylightshere76";

type Tab = "overview" | "waitlist" | "ops" | "export";

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

  useEffect(() => {
    const saved = sessionStorage.getItem("budai_admin_auth");
    if (saved === "true") setAuthenticated(true);
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    getWaitlistUsers().then((data) => {
      setUsers(data);
      setLoading(false);
    });
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
      const data = await getWaitlistUsers();
      setUsers(data);
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
              Private area for <span className="text-accent-cyan font-medium">Stille</span>{" "}
              (Stilledev) only. If you landed here by accident — this is not a public page.
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

          <p className="text-center text-xs text-muted/40 mt-6">
            BudAI by <span className="text-accent-cyan">Stilledev</span>
          </p>
        </motion.div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "waitlist", label: "Waitlist", icon: List },
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
              <p className="text-muted text-sm">
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

        {tab === "ops" && (
          <div id="logs" className="scroll-mt-24 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SystemTerminal />
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white">Ops checklist</h3>
              <ul className="text-xs text-muted space-y-2 list-disc pl-4 leading-relaxed">
                <li>Run <code className="font-mono text-white/70">supabase/schema.sql</code> if columns missing</li>
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
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6 space-y-4 max-w-xl">
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
        )}
      </div>
    </AdminLayout>
  );
}
