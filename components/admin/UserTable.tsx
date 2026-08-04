"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Trash2, Search } from "lucide-react";
import { WaitlistUser } from "@/types";
import { updateUserStatus, deleteUser } from "@/lib/data";

export default function UserTable({ users, loading, onUpdate }: { users: WaitlistUser[]; loading: boolean; onUpdate: () => void }) {
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const filtered = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(filter.toLowerCase()) || u.email.toLowerCase().includes(filter.toLowerCase()) || u.company.toLowerCase().includes(filter.toLowerCase());
    const matchesStatus = statusFilter === "all" || u.access_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatus = async (id: string, status: WaitlistUser["access_status"]) => {
    await updateUserStatus(id, status);
    onUpdate();
  };

  const handleDelete = async (id: string) => {
    await deleteUser(id);
    onUpdate();
  };

  const statusColors = {
    approved: "text-accent-green bg-accent-green/10",
    pending: "text-accent-yellow bg-accent-yellow/10",
    rejected: "text-red-400 bg-red-400/10",
  };

  return (
    <div className="rounded-2xl glass-strong border border-white/[0.06] overflow-hidden">
      <div className="p-5 border-b border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h3 className="text-lg font-semibold">Waitlist Users</h3>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search users..."
              className="pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent-cyan/40"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white appearance-none"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-muted text-xs uppercase tracking-wider">
              <th className="text-left px-5 py-3">User</th>
              <th className="text-left px-5 py-3">Company</th>
              <th className="text-left px-5 py-3">Industry</th>
              <th className="text-left px-5 py-3">Status</th>
              <th className="text-left px-5 py-3">Date</th>
              <th className="text-right px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-muted">Loading users...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-muted">No users found.</td></tr>
            ) : (
              filtered.map((user) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="font-medium text-white">{user.name}</div>
                    <div className="text-xs text-muted">{user.email}</div>
                  </td>
                  <td className="px-5 py-4 text-muted">{user.company}</td>
                  <td className="px-5 py-4 text-muted">{user.industry}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusColors[user.access_status]}`}>
                      {user.access_status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-muted text-xs">
                    {new Date(user.created_at).toLocaleDateString("sv-SE")}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {user.access_status !== "approved" && (
                        <button onClick={() => handleStatus(user.id, "approved")} className="p-1.5 rounded-lg hover:bg-accent-green/10 text-muted hover:text-accent-green transition-colors" title="Approve">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {user.access_status !== "rejected" && (
                        <button onClick={() => handleStatus(user.id, "rejected")} className="p-1.5 rounded-lg hover:bg-red-400/10 text-muted hover:text-red-400 transition-colors" title="Reject">
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => handleDelete(user.id)} className="p-1.5 rounded-lg hover:bg-red-400/10 text-muted hover:text-red-400 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
