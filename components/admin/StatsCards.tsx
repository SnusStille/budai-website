"use client";

import { motion } from "framer-motion";
import {
  Users,
  TrendingUp,
  Clock,
  Shield,
  Building2,
  Tag,
  User,
} from "lucide-react";
import { WaitlistUser } from "@/types";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { getWaitlistStats } from "@/lib/data";

export default function StatsCards({ users }: { users: WaitlistUser[] }) {
  const statsData = getWaitlistStats(users);
  const today = users.filter((u) => {
    const d = new Date(u.created_at);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  const stats = [
    {
      label: "Total",
      value: statsData.total,
      icon: Users,
      color: "text-accent-cyan",
      bg: "bg-accent-cyan/10",
    },
    {
      label: "Approved",
      value: statsData.approved,
      icon: Shield,
      color: "text-accent-green",
      bg: "bg-accent-green/10",
    },
    {
      label: "Pending",
      value: statsData.pending,
      icon: Clock,
      color: "text-amber-300",
      bg: "bg-amber-400/10",
    },
    {
      label: "Today",
      value: today,
      icon: TrendingUp,
      color: "text-accent-purple",
      bg: "bg-accent-purple/10",
    },
    {
      label: "Companies",
      value: statsData.companies,
      icon: Building2,
      color: "text-accent-blue",
      bg: "bg-accent-blue/10",
    },
    {
      label: "Individuals",
      value: statsData.individuals,
      icon: User,
      color: "text-accent-pink",
      bg: "bg-accent-pink/10",
    },
    {
      label: "10% codes",
      value: statsData.withDiscount,
      icon: Tag,
      color: "text-accent-green",
      bg: "bg-accent-green/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.12] transition-colors"
        >
          <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
          </div>
          <div className="text-2xl font-bold text-white tabular-nums tracking-tight">
            <AnimatedCounter target={stat.value} />
          </div>
          <div className="text-[11px] text-muted mt-0.5 font-medium">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  );
}
