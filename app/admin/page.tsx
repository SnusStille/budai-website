"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, Shield } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import StatsCards from "@/components/admin/StatsCards";
import UserTable from "@/components/admin/UserTable";
import ActivityChart from "@/components/admin/ActivityChart";
import SystemTerminal from "@/components/admin/SystemTerminal";
import { getWaitlistUsers } from "@/lib/data";
import { WaitlistUser } from "@/types";

const ADMIN_PASSWORD = "Daylightshere76"; // Change this to whatever you want

export default function AdminPage() {
  const [users, setUsers] = useState<WaitlistUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Check if already authenticated
    const saved = localStorage.getItem("budai_admin_auth");
    if (saved === "true") {
      setAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    getWaitlistUsers().then((data) => {
      setUsers(data);
      setLoading(false);
    });
  }, [authenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setError(false);
      localStorage.setItem("budai_admin_auth", "true");
    } else {
      setError(true);
    }
  };

  const refresh = () => {
    setLoading(true);
    getWaitlistUsers().then((data) => {
      setUsers(data);
      setLoading(false);
    });
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">BudAI Control Center</h1>
            <p className="text-muted text-sm">Restricted area. Authorized personnel only.</p>
          </div>

          <form onSubmit={handleLogin} className="glass-strong rounded-2xl p-8 border border-white/[0.06]">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(false);
                    }}
                    placeholder="Enter admin password"
                    className="w-full pl-11 pr-12 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted focus:outline-none focus:border-accent-cyan/40 transition-colors"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400 text-xs mt-2"
                  >
                    Incorrect password. Access denied.
                  </motion.p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-accent-cyan to-accent-purple rounded-xl font-semibold text-white hover:opacity-90 transition-opacity"
              >
                Access Dashboard
              </button>
            </div>
          </form>

          <p className="text-center text-xs text-muted/40 mt-6">
            BudAI by Stilledev · Secure Access
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">BudAI Control Center</h1>
              <p className="text-muted">Manage waitlist, monitor system health, and control early access.</p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem("budai_admin_auth");
                setAuthenticated(false);
                setPassword("");
              }}
              className="px-4 py-2 rounded-lg glass text-sm text-muted hover:text-white hover:bg-white/5 transition-colors"
            >
              Log Out
            </button>
          </div>
        </motion.div>

        <StatsCards users={users} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <UserTable users={users} loading={loading} onUpdate={refresh} />
          </div>
          <div>
            <SystemTerminal />
          </div>
        </div>

        <ActivityChart />
      </div>
    </AdminLayout>
  );
}