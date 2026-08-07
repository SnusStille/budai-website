"use client";

import { motion } from "framer-motion";
import { Users, TrendingUp, Clock, Shield, Sparkles, Building2 } from "lucide-react";
import { WaitlistUser } from "@/types";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

export default function StatsCards({ users }: { users: WaitlistUser[] }) {
  const approved = users.filter((u) => u.access_status === "approved").length;
  const pending = users.filter((u) => u.access_status === "pending").length;
  const today = users.filter((u) => {
    const d = new Date(u.created_at);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  const stats = [
    { label: "Total Users", value: users.length, icon: Users, color: "text-accent-cyan", bg: "bg-accent-cyan/10" },
    { label: "Approved", value: approved, icon: Shield, color: "text-accent-green", bg: "bg-accent-green/10" },
    { label: "Pending", value: pending, icon: Clock, color: "text-accent-yellow", bg: "bg-accent-yellow/10" },
    { label: "Today", value: today, icon: TrendingUp, color: "text-accent-purple", bg: "bg-accent-purple/10" },
    { label: "Industries", value: new Set(users.map((u) => u.industry).filter(Boolean)).size, icon: Building2, color: "text-accent-pink", bg: "bg-accent-pink/10" },
    { label: "Playground Uses", value: 426, icon: Sparkles, color: "text-accent-blue", bg: "bg-accent-blue/10" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="p-4 rounded-2xl glass border border-white/[0.06]"
        >
          <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
          </div>
          <div className="text-2xl font-bold text-white">
            <AnimatedCounter target={stat.value} />
          </div>
          <div className="text-xs text-muted">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  );
}
