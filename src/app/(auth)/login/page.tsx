"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Shield, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(5, "Password must be at least 5 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email.toLowerCase(),
        password: data.password,
      });

      if (result?.error) {
        toast.error("Invalid credentials. Please try again.");
      } else {
        toast.success("Welcome back!");
        router.replace(callbackUrl);
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md glass p-8 space-y-8">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-glow grid place-items-center mx-auto mb-4">
            <Shield className="text-white" size={24}/>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Sign in to EMS Pro</h1>
          <p className="text-white/50 text-sm mt-2">Enter your credentials to access your dashboard</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-white/70 ml-1">Email Address</label>
            <input {...register("email")} type="email" placeholder="admin@ems.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition" />
            {errors.email && <p className="text-rose-400 text-[10px] ml-1">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-white/70 ml-1">Password</label>
            <input {...register("password")} type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition" />
            {errors.password && <p className="text-rose-400 text-[10px] ml-1">{errors.password.message}</p>}
          </div>
          <button type="submit" disabled={isLoading} className="glow-btn w-full justify-center mt-2 h-11">
            {isLoading ? <Loader2 className="animate-spin" size={18}/> : <>Sign in <ArrowRight size={18}/></>}
          </button>
        </form>

        <p className="text-center text-xs text-white/40">
          Don&apos;t have an account? <Link href="/signup" className="text-violet-400 hover:text-violet-300 transition">Create one</Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-white/20" size={32}/></div>}>
      <LoginForm />
    </Suspense>
  );
}