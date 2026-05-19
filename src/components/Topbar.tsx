"use client";
import { Bell, Search } from "lucide-react";
import { useSession } from "next-auth/react";

export default function Topbar() {
  const { data } = useSession();
  return (
    <header className="sticky top-0 z-10 backdrop-blur-xl bg-bg/60 border-b border-white/5">
      <div className="px-4 sm:px-8 h-16 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"/>
          <input className="input pl-9 py-2" placeholder="Search anything…"/>
        </div>
        <button className="ghost-btn !p-2 relative">
          <Bell size={16}/>
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-pink-400"/>
        </button>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 grid place-items-center text-sm font-semibold">
          {data?.user?.name?.[0]?.toUpperCase() || "U"}
        </div>
      </div>
    </header>
  );
}
