"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    if (!res.ok) {
      const d = await res.json().catch(()=>({}));
      toast.error(d.error || "Failed to register"); setLoading(false); return;
    }
    await signIn("credentials", { redirect: false, email: form.email, password: form.password });
    toast.success("Account created");
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen grid place-items-center px-6">
      <form onSubmit={onSubmit} className="glass w-full max-w-md p-8">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <p className="text-sm text-white/50 mt-1">Join EMS Pro</p>
        <div className="mt-6 space-y-4">
          <div><label className="label">Full name</label>
            <input className="input" required value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/></div>
          <div><label className="label">Email</label>
            <input className="input" type="email" required value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/></div>
          <div><label className="label">Password</label>
            <input className="input" type="password" minLength={8} required value={form.password} onChange={e=>setForm({...form, password:e.target.value})}/></div>
          <button disabled={loading} className="glow-btn w-full">
            {loading ? <Loader2 className="animate-spin" size={16}/> : "Create account"}
          </button>
          <p className="text-sm text-white/50 text-center">
            Have an account? <Link href="/login" className="text-violet-300 hover:underline">Sign in</Link>
          </p>
        </div>
      </form>
    </main>
  );
}
