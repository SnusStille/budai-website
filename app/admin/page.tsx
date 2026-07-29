"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AdminLayout from "@/components/admin/AdminLayout";
import StatsCards from "@/components/admin/StatsCards";
import UserTable from "@/components/admin/UserTable";
import ActivityChart from "@/components/admin/ActivityChart";
import SystemTerminal from "@/components/admin/SystemTerminal";
import { getWaitlistUsers } from "@/lib/data";
import { WaitlistUser } from "@/types";

export default function AdminPage() {
  const [users, setUsers] = useState<WaitlistUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWaitlistUsers().then((data) => {
      setUsers(data);
      setLoading(false);
    });
  }, []);

  const refresh = () => {
    setLoading(true);
    getWaitlistUsers().then((data) => {
      setUsers(data);
      setLoading(false);
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold text-white mb-2">BudAI Control Center</h1>
          <p className="text-muted">Manage waitlist, monitor system health, and control early access.</p>
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
