import Link from "next/link";
import { ArrowRight, Sparkles, Shield, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-4xl text-center">
        <span className="chip inline-flex items-center gap-2 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live System · All Systems Operational
        </span>
        <h1 className="text-5xl sm:text-7xl font-semibold bg-gradient-to-r from-white via-violet-200 to-cyan-200 bg-clip-text text-transparent leading-tight">
          Enterprise Employee<br/>Management, Reimagined
        </h1>
        <p className="mt-6 text-white/60 max-w-2xl mx-auto">
          A premium glassmorphism dashboard to manage people, departments, payroll, and analytics —
          built on Next.js 15, MongoDB Atlas, and NextAuth.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link href="/login" className="glow-btn">Sign in <ArrowRight size={16}/></Link>
          <Link href="/signup" className="ghost-btn">Create account</Link>
        </div>
        <div className="mt-16 grid sm:grid-cols-3 gap-4">
          {[
            { i: Sparkles, t: "Premium UI", d: "Dark neon, glass, motion" },
            { i: Shield,   t: "Secure",     d: "JWT + role-based access" },
            { i: BarChart3,t: "Analytics",  d: "Realtime dashboard" },
          ].map(({i: Icon, t, d}) => (
            <div key={t} className="glass p-5 text-left">
              <Icon className="text-violet-300 mb-3" size={20}/>
              <h3 className="font-medium">{t}</h3>
              <p className="text-sm text-white/50">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
