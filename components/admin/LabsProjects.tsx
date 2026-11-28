"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  MessageSquare,
  Trash2,
  User,
  Mail,
  Phone,
  Building2,
  Calendar,
  DollarSign,
  AlertTriangle,
  PencilLine,
  RefreshCw,
  Star,
  Download,
  Clock,
  Zap,
  ChevronRight,
  Tag,
  Sparkles,
} from "lucide-react";

type ProjectStatus =
  | "new_inquiry"
  | "conversation_active"
  | "needs_review"
  | "qualified"
  | "meeting_requested"
  | "quote_sent"
  | "accepted"
  | "declined"
  | "completed";

type ProjectCategory =
  | "website" | "web_application" | "mobile_app" | "ai_service"
  | "automation" | "ecommerce" | "booking_system" | "saas_platform"
  | "game_development" | "roblox" | "fivem"
  | "integration" | "consulting" | "other" | "unknown";

const STATUS_LABELS: Record<ProjectStatus, { label: string; color: string }> = {
  new_inquiry: { label: "Ny förfrågan", color: "border-cyan-400/30 text-cyan-400 bg-cyan-400/5" },
  conversation_active: { label: "Pågående", color: "border-blue-400/30 text-blue-400 bg-blue-400/5" },
  needs_review: { label: "Behöver granskas", color: "border-amber-400/30 text-amber-400 bg-amber-400/5" },
  qualified: { label: "Kvalificerat", color: "border-emerald-400/30 text-emerald-400 bg-emerald-400/5" },
  meeting_requested: { label: "Möte önskas", color: "border-purple-400/30 text-purple-400 bg-purple-400/5" },
  quote_sent: { label: "Offert skickad", color: "border-violet-400/30 text-violet-400 bg-violet-400/5" },
  accepted: { label: "Accepterat", color: "border-green-400/30 text-green-400 bg-green-400/5" },
  declined: { label: "Avböjt", color: "border-red-400/30 text-red-400 bg-red-400/5" },
  completed: { label: "Avslutat", color: "border-white/15 text-muted bg-white/[0.02]" },
};

const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  website: "Webbplats",
  web_application: "Webbapplikation",
  mobile_app: "Mobilapp",
  ai_service: "AI-tjänst",
  automation: "Automation",
  ecommerce: "E-handel",
  booking_system: "Bokningssystem",
  saas_platform: "SaaS-plattform",
  game_development: "Spelutveckling",
  roblox: "Roblox",
  fivem: "FiveM/GTA V",
  integration: "Integration/Skräddarsytt",
  consulting: "Konsultation",
  other: "Övrigt",
  unknown: "Okänd",
};

const COMPLEXITY_LABELS: Record<string, { label: string; color: string }> = {
  low: { label: "Låg", color: "text-emerald-400" },
  medium: { label: "Medel", color: "text-amber-400" },
  high: { label: "Hög", color: "text-orange-400" },
  very_high: { label: "Mycket hög", color: "text-red-400" },
};

const ASSESSMENT_LABELS: Record<string, { label: string; color: string }> = {
  realistic: { label: "Realistisk", color: "text-emerald-400" },
  tight: { label: "Ansträngd", color: "text-amber-400" },
  unrealistic: { label: "Orealistisk", color: "text-red-400" },
  unknown: { label: "Okänd", color: "text-muted" },
};

const card = "rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5";
const input = "w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-muted focus:border-accent-cyan/40 focus:outline-none transition-colors";
const btn = "inline-flex items-center gap-2 rounded-xl border border-white/10 px-3.5 py-2 text-sm text-white/80 transition hover:bg-white/5 disabled:opacity-50";

type Project = {
  id: string;
  status: ProjectStatus;
  starred: boolean;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  company: string | null;
  project_title: string | null;
  project_category: ProjectCategory;
  customer_goal: string | null;
  target_audience: string | null;
  problem: string | null;
  proposed_solution: string | null;
  scope_mvp: string | null;
  key_features: string[];
  technical_requirements: string[];
  technical_complexity: string | null;
  budget: string | null;
  budget_assessment: string | null;
  timeline: string | null;
  timeline_assessment: string | null;
  business_risks: string[];
  technical_risks: string[];
  opportunities: string[];
  competition: string | null;
  recommended_mvp: string | null;
  next_steps: string | null;
  priority_score: number | null;
  priority_strengths: string[];
  priority_concerns: string[];
  priority_recommendation: string | null;
  summary_generated_at: string | null;
  contact_collected_at: string | null;
  last_summary_update_at: string | null;
  is_read: boolean;
  admin_notes_count: number;
  internal_notes: string | null;
  next_recommended_action: string | null;
  message_count?: number;
  created_at: string;
  updated_at: string;
};

type Message = { id: string; role: "user" | "assistant"; content: string; created_at: string };
type Note = { id: string; body: string; created_at: string };
type StatusCount = Record<string, number>;

function scoreColor(score: number | null): string {
  if (score === null) return "text-muted";
  if (score >= 75) return "text-emerald-400";
  if (score >= 50) return "text-amber-400";
  if (score >= 25) return "text-orange-400";
  return "text-red-400";
}

function formatDate(s: string) {
  return new Date(s).toLocaleString("sv-SE", { dateStyle: "short", timeStyle: "short" });
}
function timeAgo(s: string) {
  const diff = Date.now() - new Date(s).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "nu";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function LabsProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"updated" | "priority" | "created">("updated");
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<{ project: Project; messages: Message[]; notes: Note[]; profile?: any } | null>(null);
  const [internalNotes, setInternalNotes] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [statusCounts, setStatusCounts] = useState<StatusCount>({});
  const [unread, setUnread] = useState(0);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      if (q) params.set("q", q);
      params.set("limit", "100");
      const res = await fetch(`/api/admin/labs/projects?${params}`, {
        cache: "no-store", credentials: "same-origin",
      });
      const data = await res.json();
      if (res.ok) {
        let list = data.projects || [];
        if (sortBy === "priority") {
          list = [...list].sort((a: Project, b: Project) => (b.priority_score ?? -1) - (a.priority_score ?? -1));
        } else if (sortBy === "created") {
          list = [...list].sort((a: Project, b: Project) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }
        setProjects(list);
        setStatusCounts(data.statusCounts || {});
        setUnread(data.unreadCount || 0);
        setError("");
      } else {
        setError(data.error || "Failed to load");
      }
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  }, [statusFilter, categoryFilter, q, sortBy]);

  const openProject = useCallback(async (id: string) => {
    setSelected(id);
    try {
      const res = await fetch(`/api/admin/labs/projects?id=${encodeURIComponent(id)}`, {
        cache: "no-store", credentials: "same-origin",
      });
      const data = await res.json();
      if (res.ok) {
        setDetail(data);
        setInternalNotes(data.project?.internal_notes || "");
        setNextAction(data.project?.next_recommended_action || "");
        setAnalysis(null);
        setAnalysisError(null);
        if (data.project?.is_read === false) {
          await fetch(`/api/admin/labs/projects`, {
            method: "PATCH", headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({ id, fields: { is_read: true } }),
          });
          void loadProjects();
        }
      }
    } catch { setError("Failed to load project"); }
  }, [loadProjects]);

  const updateStatus = async (id: string, status: ProjectStatus) => {
    await fetch("/api/admin/labs/projects", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ id, fields: { status } }),
    });
    void loadProjects();
    if (detail?.project.id === id) setDetail({ ...detail, project: { ...detail.project, status } });
  };

  const toggleStar = async (id: string, current: boolean) => {
    await fetch("/api/admin/labs/projects", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ id, fields: { starred: !current } }),
    });
    void loadProjects();
    if (detail?.project.id === id) setDetail({ ...detail, project: { ...detail.project, starred: !current } });
  };

  const exportBriefMarkdown = (d: typeof detail) => {
    if (!d) return;
    const p = d.project;
    const prof = d.profile || {};
    const customer = (prof as any).customer || {};
    const lines: string[] = [
      `# Projektbrief — ${p.project_title || "Utan titel"}`,
      ``,
      `**Skapad:** ${new Date(p.created_at).toLocaleString("sv-SE")}`,
      `**Status:** ${p.status}`,
      `**Prioritet:** ${p.priority_score ?? "-"}/100`,
      ``,
      `## Kund`,
      `- **Namn:** ${p.contact_name || customer.name || "—"}`,
      `- **E-post:** ${p.contact_email || "—"}`,
      `- **Telefon:** ${p.contact_phone || "—"}`,
      `- **Företag:** ${p.company || customer.company_name || "—"}`,
      `- **Typ:** ${customer.type || "okänd"}`,
      `- **Bransch:** ${customer.industry || "—"}`,
      `- **Roll:** ${customer.role || "—"}`,
      `- **Webb:** ${customer.website || "—"}`,
      ``,
      `## Projekt`,
      `- **Kategori:** ${p.project_category || prof.project_category || "okänd"}`,
      `- **Mål:** ${p.customer_goal || prof.customer_goal || "—"}`,
      `- **Problem:** ${p.problem || prof.problem || "—"}`,
      `- **Målgrupp:** ${p.target_audience || prof.target_audience || "—"}`,
      ``,
      `## Funktioner (nödvändiga)`,
      ...((prof as any).key_features?.length ? (prof as any).key_features.map((f: string) => `- [ ] ${f}`) : ["—"]),
      ``,
      ...((prof as any).nice_to_have_features?.length ? [`## Önskade funktioner (kan vänta)`, ...(prof as any).nice_to_have_features.map((f: string) => `- ${f}`), ``] : []),
      `## Budget & Tid`,
      `- **Budget:** ${p.budget || prof.budget || "Ej angiven"}`,
      `- **Tidsplan:** ${p.timeline || prof.timeline || "Ej angiven"}`,
      ``,
      `## Rekommendation`,
      (prof as any).recommended_mvp || p.recommended_mvp || "—",
      ``,
      `## Risker`,
      ...(((prof as any).business_risks || []).concat((prof as any).technical_risks || []).map((r: string) => `- ${r}`) || ["—"]),
      ``,
      ...(p.next_steps ? [`## Nästa steg`, p.next_steps, ``] : []),
      ...(p.internal_notes ? [`## Olivers anteckningar`, p.internal_notes, ``] : []),
      `---`,
      `_Exporterad från Stilledev Labs admin_`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `projektbrief-${(p.project_title || "projekt").toLowerCase().replace(/\s+/g, "-").slice(0, 40)}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const saveAdminFields = async () => {
    if (!detail) return;
    setSavingNotes(true);
    await fetch("/api/admin/labs/projects", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        id: detail.project.id,
        fields: { internal_notes: internalNotes, next_recommended_action: nextAction },
      }),
    });
    setSavingNotes(false);
    setDetail({
      ...detail,
      project: { ...detail.project, internal_notes: internalNotes, next_recommended_action: nextAction },
    });
  };

  // AI project analysis (admin-only)
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const runAnalysis = async () => {
    if (!detail) return;
    setAnalyzing(true);
    setAnalysisError(null);
    setAnalysis(null);
    try {
      const res = await fetch("/api/admin/labs/projects/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ id: detail.project.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Okänt fel");
      setAnalysis(data.analysis || "(Ingen analys returnerades)");
    } catch (e: any) {
      setAnalysisError(e.message || String(e));
    } finally {
      setAnalyzing(false);
    }
  };

  const addNote = async () => {
    if (!selected || !noteText.trim()) return;
    const res = await fetch("/api/admin/labs/notes", {
      method: "POST", headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ projectId: selected, body: noteText }),
    });
    if (res.ok) {
      setNoteText("");
      void openProject(selected);
      void loadProjects();
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!confirm("Ta bort anteckningen?")) return;
    await fetch(`/api/admin/labs/notes?id=${noteId}`, { method: "DELETE", credentials: "same-origin" });
    if (selected) void openProject(selected);
  };

  useEffect(() => { void loadProjects(); }, [loadProjects]);

  const stats = useMemo(() => ({
    total: Object.values(statusCounts).reduce((a: number, b: number) => a + (b as number), 0),
    new: (statusCounts as Record<string, number>).new_inquiry || 0,
    active: (statusCounts as Record<string, number>).conversation_active || 0,
    meeting: (statusCounts as Record<string, number>).meeting_requested || 0,
    qualified: (statusCounts as Record<string, number>).qualified || 0,
  }), [statusCounts]);

  return (
    <div className="space-y-5">
      {/* Stats bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: "Totalt", value: stats.total, dim: true },
          { label: "Nya", value: stats.new },
          { label: "Pågående", value: stats.active },
          { label: "Kvalificerade", value: stats.qualified },
          { label: "Möte", value: stats.meeting },
        ].map((s) => (
          <div key={s.label} className={card} style={{ padding: "14px 16px" }}>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted">{s.label}</p>
            <p className={`mt-1 text-2xl font-bold tabular-nums ${s.dim ? "" : "text-accent-cyan"}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Project list + detail */}
      <div className="grid gap-5 xl:grid-cols-5">
        <div className="space-y-3 xl:col-span-2">
          <div className="flex flex-wrap gap-2">
            <div className="relative min-w-[180px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void loadProjects()}
                placeholder="Sök namn, e-post, projekt..."
                className={`${input} pl-9`}
                aria-label="Sök projekt"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white [&>option]:bg-[#0c0c14]"
            >
              <option value="all">Alla statusar</option>
              {Object.entries(STATUS_LABELS).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label} {(statusCounts as Record<string, number>)[key] ? `(${(statusCounts as Record<string, number>)[key]})` : ""}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "updated" | "priority" | "created")}
              className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white [&>option]:bg-[#0c0c14]"
            >
              <option value="updated">Senast aktiv</option>
              <option value="priority">Prioritet</option>
              <option value="created">Senast skapad</option>
            </select>
            <button type="button" className={btn} onClick={() => void loadProjects()}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Category filter chips */}
          <div className="flex flex-wrap gap-1.5">
            {(["all", "website", "web_application", "mobile_app", "game_development", "fivem", "roblox", "ai_service", "automation", "ecommerce", "booking_system", "saas_platform", "integration", "other"] as const).map((cat) => {
              const isActive = categoryFilter === cat;
              const label = cat === "all" ? "Alla" : CATEGORY_LABELS[cat as ProjectCategory] || cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 text-[10.5px] font-medium rounded-full border transition-all ${
                    isActive
                      ? "border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan"
                      : "border-white/[0.08] bg-white/[0.02] text-muted hover:text-white/80 hover:border-white/15"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {error && (
            <p className="rounded-lg border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-xs text-amber-200">{error}</p>
          )}

          {unread > 0 && (
            <p className="flex items-center gap-1.5 text-xs text-accent-cyan">
              <Zap className="h-3 w-3" /> {unread} olästa projekt
            </p>
          )}

          {loading ? (
            <div className={card}><div className="flex items-center gap-2 text-muted"><RefreshCw className="h-4 w-4 animate-spin" /> Laddar...</div></div>
          ) : projects.length === 0 ? (
            <div className={card}>
              <p className="text-sm text-muted">
                Inga projekt än. När besökare chattar med BudAI och lämnar sina kontaktuppgifter dyker projekten upp här.
              </p>
              <p className="mt-2 text-xs text-muted/70">
                Pågående konversationer utan kontaktuppgifter syns inte i listan förrän BudAI bedömt dem som kvalificerade.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {projects.map((p) => {
                const statusInfo = STATUS_LABELS[p.status];
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => void openProject(p.id)}
                      className={`group relative w-full rounded-xl border p-4 text-left transition ${
                        selected === p.id
                          ? "border-accent-cyan/25 bg-accent-cyan/[0.04]"
                          : "border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.035] hover:border-white/[0.1]"
                      }`}
                    >
                      <span className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                        {p.priority_score !== null && p.priority_score > 0 && (
                          <span className={`font-mono text-[10px] font-bold ${scoreColor(p.priority_score)}`}>
                            {p.priority_score}/100
                          </span>
                        )}
                        {p.starred && <Star className="h-3 w-3 text-amber-400 fill-amber-400" />}
                        {!p.is_read && (
                          <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan" style={{ boxShadow: "0 0 6px rgba(0,229,255,0.6)" }} />
                        )}
                        <span className="ml-auto flex items-center gap-1 text-[11px] text-muted">
                          <Clock className="h-3 w-3" />
                          {timeAgo(p.updated_at)}
                        </span>
                      </span>
                      <span className="mt-2 block font-semibold text-white text-[14px] leading-snug">
                        {p.project_title || p.customer_goal?.slice(0, 80) || "Ej namngivet projekt"}
                      </span>
                      <span className="mt-1 block text-[12px] text-muted truncate">
                        {p.contact_name || "Namnlös"} · {p.contact_email || "Ingen e-post"}
                        {p.company ? ` · ${p.company}` : ""}
                        {p.project_category && p.project_category !== "unknown" && (
                          <> · {CATEGORY_LABELS[p.project_category]}</>
                        )}
                      </span>
                      {(p.message_count ?? 0) > 0 && (
                        <span className="mt-1.5 flex items-center gap-1 text-[11px] text-muted/70">
                          <MessageSquare className="h-3 w-3" /> {p.message_count} meddelanden
                          <ChevronRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Project detail */}
        <div className="xl:col-span-3 space-y-4">
          {detail ? (
            <>
              {/* Header */}
              <div className={card}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <button
                        type="button"
                        onClick={() => void toggleStar(detail.project.id, detail.project.starred)}
                        className="text-muted hover:text-amber-400 transition"
                        aria-label="Stjärnmärk"
                      >
                        <Star className={`h-4 w-4 ${detail.project.starred ? "fill-amber-400 text-amber-400" : ""}`} />
                      </button>
                      <h3 className="text-lg font-semibold text-white truncate">
                        {detail.project.project_title || "Projekt"}
                      </h3>
                    </div>
                    <p className="text-xs text-muted">
                      Skapat {formatDate(detail.project.created_at)} · Senast {formatDate(detail.project.updated_at)}
                      {detail.project.message_count ? ` · ${detail.project.message_count} meddelanden` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {detail.project.priority_score !== null && (
                      <span className={`text-sm font-mono font-bold ${scoreColor(detail.project.priority_score)}`}>
                        {detail.project.priority_score}/100
                      </span>
                    )}
                    <select
                      value={detail.project.status}
                      onChange={(e) => void updateStatus(detail.project.id, e.target.value as ProjectStatus)}
                      className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white [&>option]:bg-[#0c0c14]"
                    >
                      {Object.entries(STATUS_LABELS).map(([key, { label }]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Contact info grid */}
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {detail.project.contact_name && (
                    <div className="flex items-start gap-2.5 text-sm">
                      <User className="mt-0.5 h-4 w-4 text-muted shrink-0" />
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-muted font-mono">Namn</p>
                        <p className="text-white/85">{detail.project.contact_name}</p>
                      </div>
                    </div>
                  )}
                  {detail.project.contact_email && (
                    <div className="flex items-start gap-2.5 text-sm">
                      <Mail className="mt-0.5 h-4 w-4 text-muted shrink-0" />
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-muted font-mono">E-post</p>
                        <a href={`mailto:${detail.project.contact_email}`} className="text-accent-cyan hover:underline break-all">
                          {detail.project.contact_email}
                        </a>
                      </div>
                    </div>
                  )}
                  {detail.project.contact_phone && (
                    <div className="flex items-start gap-2.5 text-sm">
                      <Phone className="mt-0.5 h-4 w-4 text-muted shrink-0" />
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-muted font-mono">Telefon</p>
                        <p className="text-white/85">{detail.project.contact_phone}</p>
                      </div>
                    </div>
                  )}
                  {detail.project.company && (
                    <div className="flex items-start gap-2.5 text-sm">
                      <Building2 className="mt-0.5 h-4 w-4 text-muted shrink-0" />
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-muted font-mono">Företag</p>
                        <p className="text-white/85">{detail.project.company}</p>
                      </div>
                    </div>
                  )}
                </div>

                {detail.project.contact_collected_at && (
                  <p className="mt-3 text-[11px] text-muted">
                    Kontakt mottagen {formatDate(detail.project.contact_collected_at)}
                  </p>
                )}

                {/* v4: Customer context from AI profile */}
                {detail.profile?.customer && (detail.profile.customer.type !== "unknown" || detail.profile.customer.industry || detail.profile.customer.role) && (
                  <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-1.5">
                    {detail.profile.customer.type !== "unknown" && (
                      <p className="text-xs flex gap-2">
                        <span className="text-muted font-mono text-[10px] uppercase tracking-wide w-16 shrink-0">Typ</span>
                        <span className="text-white/80">
                          {{
                            private: "Privatperson",
                            business: "Företag",
                            entrepreneur: "Entreprenör",
                            gamer: "Spelutvecklare/server",
                            existing_client: "Befintlig kund",
                            unknown: "Okänd",
                          }[detail.profile.customer.type as string] || detail.profile.customer.type}
                        </span>
                      </p>
                    )}
                    {detail.profile.customer.industry && (
                      <p className="text-xs flex gap-2">
                        <span className="text-muted font-mono text-[10px] uppercase tracking-wide w-16 shrink-0">Bransch</span>
                        <span className="text-white/80">{detail.profile.customer.industry}</span>
                      </p>
                    )}
                    {detail.profile.customer.niche && (
                      <p className="text-xs flex gap-2">
                        <span className="text-muted font-mono text-[10px] uppercase tracking-wide w-16 shrink-0">Nisch</span>
                        <span className="text-white/80">{detail.profile.customer.niche}</span>
                      </p>
                    )}
                    {detail.profile.customer.role && (
                      <p className="text-xs flex gap-2">
                        <span className="text-muted font-mono text-[10px] uppercase tracking-wide w-16 shrink-0">Roll</span>
                        <span className="text-white/80">{detail.profile.customer.role}</span>
                      </p>
                    )}
                    {detail.profile.customer.website && (
                      <p className="text-xs flex gap-2">
                        <span className="text-muted font-mono text-[10px] uppercase tracking-wide w-16 shrink-0">Webb</span>
                        <a href={detail.profile.customer.website.startsWith("http") ? detail.profile.customer.website : `https://${detail.profile.customer.website}`} target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline break-all">{detail.profile.customer.website}</a>
                      </p>
                    )}
                  </div>
                )}

                {/* v4: Budget & deadline quick view */}
                {detail.profile && (
                  <div className="mt-3 pt-3 border-t border-white/[0.06] grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted font-mono text-[10px] uppercase tracking-wide">Budget</p>
                      <p className="text-white/80">
                        {detail.profile.budget_info?.status === "unknown" || !detail.profile.budget
                          ? (detail.profile.budget || "Ej angiven")
                          : `${detail.profile.budget}${detail.profile.budget_info?.status === "estimate" ? " (uppskatt.)" : ""}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted font-mono text-[10px] uppercase tracking-wide">Tidsplan</p>
                      <p className="text-white/80">{detail.profile.timeline || "Ej angiven"}</p>
                    </div>
                    {detail.profile.client_intent && detail.profile.client_intent !== "unknown" && (
                      <div className="col-span-2">
                        <p className="text-muted font-mono text-[10px] uppercase tracking-wide">Intention</p>
                        <p className="text-white/80">
                          {{
                            new_build: "Nybygge",
                            enhancement: "Vidareutveckling",
                            debug: "Felsökning",
                            quote: "Offertförfrågan",
                            meeting: "Möte",
                            advice: "Rådgivning",
                            collaboration: "Långsiktigt samarbete",
                            unknown: "Oklar",
                          }[detail.profile.client_intent as string] || detail.profile.client_intent}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Priority analysis */}
              {(detail.project.priority_strengths?.length > 0 || detail.project.priority_concerns?.length > 0) && (
                <div className={card}>
                  <h4 className="mb-3 text-sm font-semibold text-white flex items-center gap-2">
                    <Zap className="h-4 w-4 text-accent-cyan" />
                    BudAI:s projektbedömning
                    {detail.project.priority_score !== null && (
                      <span className={`ml-auto font-mono text-sm ${scoreColor(detail.project.priority_score)}`}>
                        {detail.project.priority_score}/100
                      </span>
                    )}
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {detail.project.priority_strengths?.length > 0 && (
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400/80 mb-2">Styrkor</p>
                        <ul className="space-y-1">
                          {detail.project.priority_strengths.map((s, i) => (
                            <li key={i} className="text-sm text-white/75 flex gap-2 leading-relaxed">
                              <span className="text-emerald-400 mt-1">•</span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {detail.project.priority_concerns?.length > 0 && (
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-400/80 mb-2">Risker / att notera</p>
                        <ul className="space-y-1">
                          {detail.project.priority_concerns.map((s, i) => (
                            <li key={i} className="text-sm text-white/75 flex gap-2 leading-relaxed">
                              <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0 mt-1" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  {detail.project.priority_recommendation && (
                    <div className="mt-4 p-3 rounded-xl bg-accent-cyan/[0.05] border border-accent-cyan/20">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-accent-cyan mb-1">Rekommendation</p>
                      <p className="text-sm text-white/85">{detail.project.priority_recommendation}</p>
                    </div>
                  )}
                </div>
              )}

              {/* AI Summary */}
              {(detail.project.customer_goal || detail.project.problem || detail.project.proposed_solution) && (
                <div className={card}>
                  <h4 className="mb-4 text-sm font-semibold text-white flex items-center gap-2">
                    <Tag className="h-4 w-4 text-accent-cyan" />
                    Projektsammanfattning
                    {detail.project.project_category && detail.project.project_category !== "unknown" && (
                      <span className="ml-2 text-[10px] font-mono text-muted rounded border border-white/10 px-2 py-0.5">
                        {CATEGORY_LABELS[detail.project.project_category]}
                      </span>
                    )}
                    {detail.project.technical_complexity && COMPLEXITY_LABELS[detail.project.technical_complexity] && (
                      <span className={`ml-1 text-[10px] font-mono rounded border border-current px-2 py-0.5 ${COMPLEXITY_LABELS[detail.project.technical_complexity].color} opacity-70`}>
                        {COMPLEXITY_LABELS[detail.project.technical_complexity].label} komplexitet
                      </span>
                    )}
                  </h4>
                  <div className="space-y-4">
                    {detail.project.customer_goal && (
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted mb-1">Mål</p>
                        <p className="text-sm text-white/85 whitespace-pre-wrap">{detail.project.customer_goal}</p>
                      </div>
                    )}
                    {detail.project.target_audience && (
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted mb-1">Målgrupp</p>
                        <p className="text-sm text-white/85">{detail.project.target_audience}</p>
                      </div>
                    )}
                    {detail.project.problem && (
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted mb-1">Problem</p>
                        <p className="text-sm text-white/85 whitespace-pre-wrap">{detail.project.problem}</p>
                      </div>
                    )}
                    {detail.project.proposed_solution && (
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted mb-1">Föreslagen lösning</p>
                        <p className="text-sm text-white/85 whitespace-pre-wrap">{detail.project.proposed_solution}</p>
                      </div>
                    )}
                    {detail.project.key_features?.length > 0 && (
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted mb-2">MVP-nyckelfunktioner</p>
                        <ul className="space-y-1">
                          {detail.project.key_features.map((f, i) => (
                            <li key={i} className="text-sm text-white/80 pl-4 relative before:content-[''] before:absolute before:left-0 before:top-[9px] before:w-1 before:h-1 before:rounded-full before:bg-accent-cyan">{f}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {detail.project.recommended_mvp && (
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted mb-1">BudAI:s MVP-förslag</p>
                        <p className="text-sm text-white/85 whitespace-pre-wrap">{detail.project.recommended_mvp}</p>
                      </div>
                    )}
                    <div className="grid gap-4 sm:grid-cols-2 pt-2">
                      {detail.project.budget && (
                        <div className="flex items-start gap-2">
                          <DollarSign className="mt-0.5 h-4 w-4 text-muted shrink-0" />
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Budget</p>
                            <p className="text-sm text-white/85">{detail.project.budget}</p>
                            {detail.project.budget_assessment && ASSESSMENT_LABELS[detail.project.budget_assessment] && (
                              <p className={`text-[11px] ${ASSESSMENT_LABELS[detail.project.budget_assessment].color} mt-0.5`}>
                                {ASSESSMENT_LABELS[detail.project.budget_assessment].label}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      {detail.project.timeline && (
                        <div className="flex items-start gap-2">
                          <Calendar className="mt-0.5 h-4 w-4 text-muted shrink-0" />
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Tidsplan</p>
                            <p className="text-sm text-white/85">{detail.project.timeline}</p>
                            {detail.project.timeline_assessment && ASSESSMENT_LABELS[detail.project.timeline_assessment] && (
                              <p className={`text-[11px] ${ASSESSMENT_LABELS[detail.project.timeline_assessment].color} mt-0.5`}>
                                {ASSESSMENT_LABELS[detail.project.timeline_assessment].label}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    {(detail.project.business_risks?.length > 0 || detail.project.technical_risks?.length > 0) && (
                      <div className="grid gap-3 sm:grid-cols-2 pt-1">
                        {detail.project.business_risks?.length > 0 && (
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-400/80 mb-1.5">Affärsrisker</p>
                            <ul className="space-y-1">
                              {detail.project.business_risks.map((r, i) => (
                                <li key={i} className="text-xs text-white/70 flex gap-1.5"><AlertTriangle className="h-3 w-3 text-amber-400 shrink-0 mt-0.5" />{r}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {detail.project.technical_risks?.length > 0 && (
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-orange-400/80 mb-1.5">Tekniska risker</p>
                            <ul className="space-y-1">
                              {detail.project.technical_risks.map((r, i) => (
                                <li key={i} className="text-xs text-white/70 flex gap-1.5"><AlertTriangle className="h-3 w-3 text-orange-400 shrink-0 mt-0.5" />{r}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                    {detail.project.opportunities?.length > 0 && (
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400/80 mb-1.5">Möjligheter</p>
                        <ul className="space-y-1">
                          {detail.project.opportunities.map((o, i) => (
                            <li key={i} className="text-xs text-white/70 pl-3 relative before:content-['→'] before:absolute before:left-0 before:text-emerald-400">{o}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {detail.project.next_steps && (
                      <div className="flex items-start gap-2 pt-1">
                        <ChevronRight className="mt-0.5 h-4 w-4 text-emerald-400 shrink-0" />
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400/80">Nästa steg</p>
                          <p className="text-sm text-white/85 whitespace-pre-wrap">{detail.project.next_steps}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Confidence / Blueprint (from AI profile) */}
              {detail.profile && detail.profile.confidence && (
                <div className={card}>
                  <h4 className="mb-3 text-sm font-semibold text-white flex items-center gap-2">
                    <Zap className="h-4 w-4 text-accent-cyan" />
                    Projekt Confidence
                    <span className={`ml-auto font-mono text-sm ${
                      (detail.profile.confidence?.overall_score ?? 0) >= 70 ? "text-emerald-400" :
                      (detail.profile.confidence?.overall_score ?? 0) >= 45 ? "text-amber-400" : "text-red-400"
                    }`}>
                      {detail.profile.confidence?.overall_score ?? 0}/100
                    </span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                    {([
                      ["project_description", "Beskrivning"],
                      ["requirements_clarity", "Kravbild"],
                      ["technical_clarity", "Teknik"],
                      ["budget_clarity", "Budget"],
                      ["timeline_clarity", "Tidsplan"],
                      ["target_audience_clarity", "Målgrupp"],
                    ] as const).map(([key, label]) => {
                      const v = detail.profile.confidence?.[key];
                      const color = v === "clear" ? "bg-emerald-400/20 text-emerald-300 border-emerald-400/30"
                        : v === "partial" ? "bg-amber-400/15 text-amber-300 border-amber-400/25"
                        : "bg-red-400/10 text-red-300 border-red-400/20";
                      const dot = v === "clear" ? "●" : v === "partial" ? "◐" : "○";
                      return (
                        <div key={key} className={`text-[11px] px-2 py-1.5 rounded-md border ${color} flex items-center gap-1.5 font-medium`}>
                          <span className="font-mono text-[10px]">{dot}</span>
                          {label}
                        </div>
                      );
                    })}
                  </div>
                  {detail.profile.confidence.missing_critical?.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-amber-400/80 mb-1.5 font-semibold">Saknas för en bra bedömning</p>
                      <ul className="space-y-0.5">
                        {detail.profile.confidence.missing_critical.map((m: string, i: number) => (
                          <li key={i} className="text-xs text-white/70 flex gap-2">
                            <span className="text-amber-400">•</span>{m}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {detail.profile.reality_check?.red_flags?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-[10px] uppercase tracking-wide text-red-400/80 mb-1.5 font-semibold">Röda flaggor</p>
                      <ul className="space-y-0.5">
                        {detail.profile.reality_check.red_flags.map((r: string, i: number) => (
                          <li key={i} className="text-xs text-white/70 flex gap-2">
                            <AlertTriangle className="h-3 w-3 text-red-400 shrink-0 mt-0.5" />{r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {detail.profile.phases?.length > 0 && detail.profile.phases.some((p: any) => p.features?.length > 0 || p.description) && (
                    <div className="mt-3">
                      <p className="text-[10px] uppercase tracking-wide text-accent-cyan/80 mb-2 font-semibold">Fasplan</p>
                      <div className="space-y-1.5">
                        {detail.profile.phases.filter((p: any) => p.features?.length > 0 || p.description).map((p: any, i: number) => (
                          <div key={i} className="text-xs bg-white/[0.02] border border-white/[0.05] rounded-md p-2">
                            <span className="font-semibold text-white/90">{p.name || `Fas ${i+1}`}</span>
                            {p.description && <span className="text-white/60"> — {p.description}</span>}
                            {p.features?.length > 0 && (
                              <ul className="mt-1 text-white/60 pl-3 list-disc">
                                {p.features.slice(0, 4).map((f: string, j: number) => <li key={j}>{f}</li>)}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* AI Analysis */}
              <div className={card}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-accent-cyan" />
                    AI-projektanalys
                  </h4>
                  <button
                    onClick={() => void runAnalysis()}
                    disabled={analyzing}
                    className="text-[11px] px-2.5 py-1 bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30 rounded-md hover:bg-accent-cyan/25 disabled:opacity-50 transition"
                  >
                    {analyzing ? "Analyserar..." : analysis ? "Analysera igen" : "Analysera projekt"}
                  </button>
                </div>
                {analysisError && (
                  <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded p-2 mb-2">{analysisError}</p>
                )}
                {analysis && (
                  <div className="text-xs text-white/80 leading-relaxed whitespace-pre-wrap bg-white/[0.02] border border-white/[0.05] rounded-md p-3 max-h-[400px] overflow-y-auto">
                    {analysis}
                  </div>
                )}
                {!analysis && !analysisError && !analyzing && (
                  <p className="text-xs text-white/50">Klicka på "Analysera projekt" för att få en intern AI-bedömning av konversationen: teknisk analys, saknade uppgifter, rekommenderad första fråga och varningsflaggor. Analysen sparas inte automatiskt.</p>
                )}
              </div>

              {/* Oliver's working notes */}
              <div className={card}>
                <h4 className="mb-3 text-sm font-semibold text-white flex items-center gap-2">
                  <PencilLine className="h-4 w-4 text-accent-cyan" />
                  Olivers arbetsanteckningar
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wide text-muted font-mono block mb-1.5">Interna anteckningar</label>
                    <textarea
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                      rows={3}
                      placeholder="Privata anteckningar om projektet... (syns ej för kund eller AI)"
                      className={input}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wide text-muted font-mono block mb-1.5">Nästa åtgärd</label>
                    <input
                      type="text"
                      value={nextAction}
                      onChange={(e) => setNextAction(e.target.value)}
                      placeholder="T.ex. 'Ring upp på tisdag' eller 'Skapa offert'"
                      className={input}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void saveAdminFields()}
                      disabled={savingNotes}
                      className="inline-flex items-center gap-2 rounded-xl bg-accent-cyan/20 border border-accent-cyan/30 text-accent-cyan px-3.5 py-1.5 text-xs font-semibold transition hover:bg-accent-cyan/30 disabled:opacity-50"
                    >
                      {savingNotes ? "Sparar..." : "Spara anteckningar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => exportBriefMarkdown(detail)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-white/70 px-3 py-1.5 text-xs font-medium transition hover:bg-white/10 hover:text-white"
                      title="Exportera projektbrief som Markdown"
                    >
                      <Download className="h-3 w-3" /> Export MD
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (detail) window.open(`/api/labs/export/${detail.project.id}/brief`, "_blank");
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-white/70 px-3 py-1.5 text-xs font-medium transition hover:bg-white/10 hover:text-white"
                      title="Öppna utskrivbar projektbrief (spara som PDF via webbläsaren)"
                    >
                      <Download className="h-3 w-3" /> PDF
                    </button>
                  </div>
                </div>
              </div>

              {/* Conversation */}
              <div className={card}>
                <h4 className="mb-3 text-sm font-semibold text-white flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-accent-cyan" />
                  Konversation ({detail.messages.length} meddelanden)
                </h4>
                <div className="max-h-[450px] space-y-2.5 overflow-y-auto pr-1">
                  {detail.messages.map((m) => (
                    <div key={m.id} className={`rounded-xl p-3 text-sm ${m.role === "user" ? "bg-white/[0.03]" : "bg-accent-cyan/[0.03]"}`}>
                      <p className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-wide text-muted">
                        <span>{m.role === "user" ? "Kund" : "BudAI"}</span>
                        <span>{formatDate(m.created_at)}</span>
                      </p>
                      <p className="whitespace-pre-wrap text-white/82 leading-relaxed">{m.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className={card}>
                <h4 className="mb-3 text-sm font-semibold text-white flex items-center gap-2">
                  <PencilLine className="h-4 w-4 text-accent-cyan" />
                  Interna anteckningar
                  {(detail.notes?.length ?? 0) > 0 && (
                    <span className="ml-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-muted">{detail.notes.length}</span>
                  )}
                </h4>
                {detail.notes && detail.notes.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {detail.notes.map((n) => (
                      <div key={n.id} className="group flex items-start gap-2 rounded-lg bg-white/[0.025] p-3 border border-white/[0.05]">
                        <p className="flex-1 text-sm text-white/80 whitespace-pre-wrap">{n.body}</p>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-muted">{formatDate(n.created_at)}</span>
                          <button
                            type="button"
                            onClick={() => void deleteNote(n.id)}
                            className="text-muted opacity-0 group-hover:opacity-100 transition hover:text-red-400"
                            aria-label="Ta bort"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={2}
                  maxLength={2000}
                  placeholder="Lägg till en intern anteckning..."
                  className={input}
                />
                <button
                  type="button"
                  className="mt-2 inline-flex items-center gap-2 rounded-xl bg-accent-cyan px-4 py-2 text-sm font-semibold text-black disabled:opacity-50 transition hover:bg-[#33ebff]"
                  disabled={!noteText.trim()}
                  onClick={() => void addNote()}
                >
                  Spara anteckning
                </button>
              </div>
            </>
          ) : (
            <div className={card}>
              <p className="text-sm text-muted leading-relaxed">
                Välj ett projekt i listan för att se alla detaljer: fullständig konversation, AI-sammanfattning, budget, tidsplan, risker, kontaktuppgifter och interna anteckningar.
              </p>
              <p className="mt-3 text-xs text-muted/80 leading-relaxed">
                BudAI analyserar automatiskt varje konversation och uppdaterar projektprofilen allteftersom information samlas in. När tillräckligt med data finns och kunden lämnat kontaktuppgifter skapas ett projekt här med en strukturerad sammanfattning och prioritetspoäng.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
