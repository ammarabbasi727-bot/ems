"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Users, Building2, Wallet, Activity, UserPlus, PlaneTakeoff, TrendingUp, Cpu } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { formatMoney } from "@/lib/utils";

type Stats = {
  totalEmployees: number; activeDepartments: number; monthlyPayroll: number;
  attendanceRate: number; newHires: number; leaveRequests: number;
  months: { month: string; employees: number; revenue: number }[];
  deptBreakdown: { name: string; value: number }[];
};

const COLORS = ["#a78bfa","#22d3ee","#f472b6","#a3e635","#fbbf24","#60a5fa"];

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => { fetch("/api/stats").then(r => r.json()).then(setStats); }, []);

  const role = session?.user?.role || "ADMIN";
  const roleLabel = role === "ADMIN" ? "Administrator" : role === "HR" ? "HR Manager" : "Employee";

  const cards = stats ? [
    { label: "Total Employees", value: stats.totalEmployees, icon: Users,   tint: "from-violet-500/30 to-violet-500/0" },
    { label: "Active Departments", value: stats.activeDepartments, icon: Building2, tint: "from-cyan-500/30 to-cyan-500/0" },
    { label: "Monthly Payroll", value: formatMoney(stats.monthlyPayroll), icon: Wallet, tint: "from-pink-500/30 to-pink-500/0" },
    { label: "Attendance Rate", value: `${stats.attendanceRate}%`, icon: Activity, tint: "from-lime-500/30 to-lime-500/0" },
    { label: "New Hires (30d)", value: stats.newHires, icon: UserPlus, tint: "from-amber-500/30 to-amber-500/0" },
    { label: "Leave Requests", value: stats.leaveRequests, icon: PlaneTakeoff, tint: "from-blue-500/30 to-blue-500/0" },
  ] : [];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="glass p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-fade opacity-60 pointer-events-none"/>
        <div className="relative">
          <span className="chip inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
            Live System · All Systems Operational
          </span>
          <h1 className="mt-3 text-3xl sm:text-4xl font-semibold bg-gradient-to-r from-white via-violet-200 to-cyan-200 bg-clip-text text-transparent">
            {roleLabel}
          </h1>
          <p className="mt-2 text-white/60 max-w-2xl">
            Your employee management system is running smoothly. Here's a real-time overview of your organization.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/dashboard/employees?new=1" className="glow-btn">+ Add Employee</Link>
            <Link href="/dashboard/departments" className="ghost-btn">View Departments</Link>
            <Link href="/dashboard/payroll" className="ghost-btn">Payroll</Link>
          </div>
        </div>
      </section>

      {/* Stat cards */}
      <section className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {!stats && Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-28"/>
        ))}
        {cards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass p-4 relative overflow-hidden">
            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${c.tint} blur-2xl`}/>
            <c.icon className="text-white/70" size={18}/>
            <div className="mt-3 text-2xl font-semibold">{c.value}</div>
            <div className="text-xs text-white/50">{c.label}</div>
          </motion.div>
        ))}
      </section>

      {/* Charts */}
      <section className="grid lg:grid-cols-3 gap-4">
        <div className="glass p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-medium">Employee Growth & Revenue</h3>
              <p className="text-xs text-white/50">Last 6 months</p>
            </div>
            <TrendingUp className="text-emerald-400" size={18}/>
          </div>
          <div className="h-64">
            {stats && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.months}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.6}/>
                      <stop offset="100%" stopColor="#a78bfa" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.5}/>
                      <stop offset="100%" stopColor="#22d3ee" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="rgba(255,255,255,.4)" fontSize={12}/>
                  <YAxis stroke="rgba(255,255,255,.4)" fontSize={12}/>
                  <Tooltip contentStyle={{ background: "#0b0b22", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12 }}/>
                  <Area type="monotone" dataKey="employees" stroke="#a78bfa" fill="url(#g1)" strokeWidth={2}/>
                  <Area type="monotone" dataKey="revenue" stroke="#22d3ee" fill="url(#g2)" strokeWidth={2}/>
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="glass p-5">
          <h3 className="font-medium">Department Breakdown</h3>
          <p className="text-xs text-white/50 mb-2">Headcount by department</p>
          <div className="h-64">
            {stats && stats.deptBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.deptBreakdown} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
                    {stats.deptBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 12, color: "rgba(255,255,255,.6)" }}/>
                  <Tooltip contentStyle={{ background: "#0b0b22", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12 }}/>
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="text-sm text-white/40 grid place-items-center h-full">No data yet</div>}
          </div>
        </div>
      </section>

      {/* System status */}
      <section className="glass p-5 flex flex-wrap gap-4 items-center">
        <Cpu size={18} className="text-cyan-300"/>
        <div className="text-sm">
          <div className="font-medium">System status</div>
          <div className="text-white/50">API · OK · MongoDB · Connected · Auth · JWT</div>
        </div>
        <div className="ml-auto chip">v1.0.0</div>
      </section>
    </div>
  );
}
