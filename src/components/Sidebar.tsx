"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Building2, Wallet, CalendarCheck, PlaneTakeoff, Settings, LogOut, Shield } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/employees", label: "Employees", icon: Users },
  { href: "/dashboard/departments", label: "Departments", icon: Building2 },
  { href: "/dashboard/payroll", label: "Payroll", icon: Wallet },
  { href: "/dashboard/attendance", label: "Attendance", icon: CalendarCheck },
  { href: "/dashboard/leaves", label: "Leaves", icon: PlaneTakeoff },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data } = useSession();
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col gap-1 p-4 border-r border-white/5 bg-black/20 backdrop-blur-xl">
      <div className="px-2 py-4 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-glow grid place-items-center">
            <Shield size={18}/>
          </div>
          <div>
            <div className="font-semibold">EMS Pro</div>
            <div className="text-[10px] uppercase tracking-widest text-white/40">Enterprise</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              className={cn("flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition",
                active ? "bg-white/10 text-white shadow-soft" : "text-white/60 hover:bg-white/5 hover:text-white")}>
              <Icon size={16}/> <span>{label}</span>              
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/5 pt-3 mt-2">
        <div className="px-3 py-2 text-xs text-white/50">
          <div className="font-medium text-white/80">{data?.user?.name}</div>
          <div>{data?.user?.email}</div>
          <span className="chip mt-2 inline-block">{data?.user?.role}</span>
        </div>
        <button onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-xl hover:bg-white/5 text-white/70">
          <LogOut size={16}/> Sign out
        </button>
      </div>
    </aside>
  );
}
