"use client";

import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Trash2,
  Search,
  Building2,
  User,
  Copy,
  Check,
  Tag,
} from "lucide-react";
import { WaitlistUser } from "@/types";
import { updateUserStatus, deleteUser, updateUserNotes } from "@/lib/data";

export default function UserTable({
  users,
  loading,
  onUpdate,
}: {
  users: WaitlistUser[];
  loading: boolean;
  onUpdate: () => void;
}) {
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">(
    "all"
  );
  const [typeFilter, setTypeFilter] = useState<"all" | "individual" | "company">("all");
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});

  const filtered = users.filter((u) => {
    const q = filter.toLowerCase();
    const matchesSearch =
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.company ?? "").toLowerCase().includes(q) ||
      (u.discount_code ?? "").toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || u.access_status === statusFilter;
    const matchesType = typeFilter === "all" || u.account_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleStatus = async (id: string, status: WaitlistUser["access_status"]) => {
    setBusy(id);
    try {
      await updateUserStatus(id, status);
      onUpdate();
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this waitlist entry?")) return;
    setBusy(id);
    try {
      await deleteUser(id);
      onUpdate();
    } finally {
      setBusy(null);
    }
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* ignore */
    }
  };

  const saveNote = async (id: string) => {
    const notes = noteDraft[id] ?? "";
    setBusy(id);
    try {
      await updateUserNotes(id, notes);
      onUpdate();
    } finally {
      setBusy(null);
    }
  };

  const statusColors = {
    approved: "text-accent-green bg-accent-green/10 border-accent-green/20",
    pending: "text-amber-300 bg-amber-400/10 border-amber-400/20",
    rejected: "text-red-400 bg-red-400/10 border-red-400/20",
  };

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-white/[0.06] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Waitlist</h3>
          <p className="text-xs text-muted mt-0.5">
            {filtered.length} shown · {users.length} total
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[160px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search name, email, company…"
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent-cyan/40"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white"
          >
            <option value="all">All status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white"
          >
            <option value="all">All types</option>
            <option value="individual">Individual</option>
            <option value="company">Company</option>
          </select>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden divide-y divide-white/[0.05]">
        {loading ? (
          <div className="p-8 text-center text-muted text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted text-sm">No users found.</div>
        ) : (
          filtered.map((user) => (
            <div key={user.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-medium text-white">{user.name}</div>
                  <div className="text-xs text-muted break-all">{user.email}</div>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[user.access_status]}`}
                >
                  {user.access_status}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] text-muted">
                <span className="inline-flex items-center gap-1">
                  {user.account_type === "company" ? (
                    <Building2 className="w-3 h-3 text-accent-cyan" />
                  ) : (
                    <User className="w-3 h-3 text-accent-purple" />
                  )}
                  {user.account_type}
                </span>
                {user.company && <span>· {user.company}</span>}
                <span>· {user.interest}</span>
              </div>
              {user.discount_code && (
                <button
                  type="button"
                  onClick={() => copyCode(user.discount_code!)}
                  className="inline-flex items-center gap-1.5 text-[11px] font-mono text-accent-cyan bg-accent-cyan/10 border border-accent-cyan/20 px-2 py-1 rounded-lg"
                >
                  <Tag className="w-3 h-3" />
                  {user.discount_code}
                  {copied === user.discount_code ? (
                    <Check className="w-3 h-3 text-accent-green" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              )}
              <div className="flex flex-wrap gap-2">
                <button
                  disabled={busy === user.id}
                  onClick={() => handleStatus(user.id, "approved")}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-accent-green/10 text-accent-green border border-accent-green/20"
                >
                  Approve
                </button>
                <button
                  disabled={busy === user.id}
                  onClick={() => handleStatus(user.id, "pending")}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-white/5 text-muted border border-white/10"
                >
                  Pending
                </button>
                <button
                  disabled={busy === user.id}
                  onClick={() => handleStatus(user.id, "rejected")}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20"
                >
                  Reject
                </button>
                <button
                  disabled={busy === user.id}
                  onClick={() => handleDelete(user.id)}
                  className="text-xs px-2.5 py-1.5 rounded-lg text-muted hover:text-red-400"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-muted text-[10px] uppercase tracking-wider">
              <th className="text-left px-5 py-3">User</th>
              <th className="text-left px-5 py-3">Type</th>
              <th className="text-left px-5 py-3">Company</th>
              <th className="text-left px-5 py-3">Interest</th>
              <th className="text-left px-5 py-3">Discount</th>
              <th className="text-left px-5 py-3">Status</th>
              <th className="text-left px-5 py-3">Notes</th>
              <th className="text-left px-5 py-3">Date</th>
              <th className="text-right px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="px-5 py-10 text-center text-muted">
                  Loading users…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-10 text-center text-muted">
                  No users found.
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-white">{user.name}</div>
                    <div className="text-xs text-muted">{user.email}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs ${
                        user.account_type === "company" ? "text-accent-cyan" : "text-accent-purple"
                      }`}
                    >
                      {user.account_type === "company" ? (
                        <Building2 className="w-3.5 h-3.5" />
                      ) : (
                        <User className="w-3.5 h-3.5" />
                      )}
                      {user.account_type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-white/80">
                    {user.company || "—"}
                    {user.industry && (
                      <div className="text-[10px] text-muted">{user.industry}</div>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-muted text-xs max-w-[120px] truncate">
                    {user.interest}
                  </td>
                  <td className="px-5 py-3.5">
                    {user.discount_code ? (
                      <button
                        type="button"
                        onClick={() => copyCode(user.discount_code!)}
                        className="inline-flex items-center gap-1 text-[10px] font-mono text-accent-cyan hover:text-white"
                        title="Copy code"
                      >
                        {user.discount_code}
                        {copied === user.discount_code ? (
                          <Check className="w-3 h-3 text-accent-green" />
                        ) : (
                          <Copy className="w-3 h-3 opacity-60" />
                        )}
                      </button>
                    ) : (
                      <span className="text-muted/40">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border capitalize ${statusColors[user.access_status]}`}
                    >
                      {user.access_status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 min-w-[140px]">
                    <div className="flex gap-1">
                      <input
                        defaultValue={user.notes ?? ""}
                        onChange={(e) =>
                          setNoteDraft((d) => ({ ...d, [user.id]: e.target.value }))
                        }
                        placeholder="Note…"
                        className="w-full px-2 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-white placeholder:text-muted/50 focus:outline-none focus:border-accent-cyan/30"
                      />
                      {(noteDraft[user.id] !== undefined &&
                        noteDraft[user.id] !== (user.notes ?? "")) && (
                        <button
                          type="button"
                          onClick={() => saveNote(user.id)}
                          className="text-[10px] text-accent-cyan px-1.5"
                        >
                          Save
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-muted whitespace-nowrap">
                    {new Date(user.created_at).toLocaleDateString("sv-SE")}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        disabled={busy === user.id}
                        onClick={() => handleStatus(user.id, "approved")}
                        className="p-1.5 rounded-lg hover:bg-accent-green/10 text-muted hover:text-accent-green"
                        title="Approve"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        disabled={busy === user.id}
                        onClick={() => handleStatus(user.id, "rejected")}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-400"
                        title="Reject"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                      <button
                        disabled={busy === user.id}
                        onClick={() => handleDelete(user.id)}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-muted hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
