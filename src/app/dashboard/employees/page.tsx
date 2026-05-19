"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Pencil, Trash2, X, Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { formatMoney } from "@/lib/utils";

type Employee = {
  _id: string; employeeId: string; fullName: string; email: string; phone?: string;
  department: string; position: string; salary: number; status: "Active"|"On Leave"|"Inactive";
  joiningDate: string; avatar?: string; cnic?: string; gender?: "Male"|"Female"|"Other";
  address?: string; emergencyContact?: string;
};

const empty = {
  fullName: "", email: "", phone: "", department: "", position: "", salary: 0,
  status: "Active" as "Active" | "On Leave" | "Inactive",
  gender: "Other" as "Male" | "Female" | "Other",
  address: "", emergencyContact: "", cnic: "",
  joiningDate: new Date().toISOString().split("T")[0],
};

function EmployeesContent() {
  const search = useSearchParams();
  const [items, setItems] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [q, setQ] = useState("");
  const [statusF, setStatusF] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const url = new URL("/api/employees", window.location.origin);
    url.searchParams.set("page", String(page));
    url.searchParams.set("limit", String(limit));
    if (q) url.searchParams.set("q", q);
    if (statusF) url.searchParams.set("status", statusF);
    const res = await fetch(url.toString());
    const data = await res.json();
    setItems(data.items || []); setTotal(data.total || 0);
    setLoading(false);
  }, [page, q, statusF]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (search.get("new")) openCreate(); }, [search]);

  function openCreate() { setEditing(null); setForm({ ...empty }); setOpen(true); }
  function openEdit(e: Employee) {
    setEditing(e);
    setForm({
      fullName: e.fullName,
      email: e.email,
      phone: e.phone || "",
      department: e.department,
      position: e.position,
      salary: e.salary,
      status: e.status,
      gender: e.gender || "Other",
      address: e.address || "",
      emergencyContact: e.emergencyContact || "",
      cnic: e.cnic || "",
      joiningDate: e.joiningDate ? new Date(e.joiningDate).toISOString().split("T")[0] : "",
    });
    setOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const url = editing ? `/api/employees/${editing._id}` : "/api/employees";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    if (!res.ok) { const d = await res.json().catch(()=>({})); toast.error(d.error || "Failed"); return; }
    toast.success(editing ? "Updated" : "Created"); setOpen(false); load();
  }

  async function remove(e: Employee) {
    if (!confirm(`Delete ${e.fullName}?`)) return;
    const res = await fetch(`/api/employees/${e._id}`, { method: "DELETE" });
    if (!res.ok) return toast.error("Failed to delete");
    toast.success("Deleted"); load();
  }

  function exportCsv() {
    const headers = ["employeeId","fullName","email","phone","department","position","salary","status","joiningDate"];
    const rows = items.map(e => headers.map(h => JSON.stringify((e as Record<string, unknown>)[h] ?? "")).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "employees.csv"; a.click();
  }

  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Employees</h1>
          <p className="text-sm text-white/50">{total} total · page {page}/{pages}</p>
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <button onClick={exportCsv} className="ghost-btn"><Download size={16}/> Export</button>
          <button onClick={openCreate} className="glow-btn"><Plus size={16}/> Add employee</button>
        </div>
      </div>

      <div className="glass p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"/>
          <input className="input pl-9" placeholder="Search name, email, ID…" value={q} onChange={e=>{setPage(1); setQ(e.target.value);}}/>
        </div>
        <select className="input max-w-[180px]" value={statusF} onChange={e=>{setPage(1); setStatusF(e.target.value);}}>
          <option value="">All statuses</option>
          <option>Active</option><option>On Leave</option><option>Inactive</option>
        </select>
      </div>

      <div className="glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-white/50 border-b border-white/5">
              <tr>
                {["Employee","Department","Position","Salary","Status","Joined",""].map(h => (
                  <th key={h} className="px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-white/5">
                  <td colSpan={7} className="p-3"><div className="skeleton h-10"/></td>
                </tr>
              ))}
              {!loading && items.length === 0 && (
                <tr><td colSpan={7} className="p-10 text-center text-white/50">No employees yet. Add your first one.</td></tr>
              )}
              {!loading && items.map(e => (
                <motion.tr key={e._id} initial={{opacity:0}} animate={{opacity:1}}
                  className="border-b border-white/5 hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 grid place-items-center font-semibold">
                        {e.fullName[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">{e.fullName}</div>
                        <div className="text-xs text-white/40">{e.email} · {e.employeeId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/70">{e.department}</td>
                  <td className="px-4 py-3 text-white/70">{e.position}</td>
                  <td className="px-4 py-3">{formatMoney(e.salary)}</td>
                  <td className="px-4 py-3">
                    <span className={`chip ${e.status==="Active"?"!border-emerald-400/30 !bg-emerald-400/10 text-emerald-300":
                      e.status==="On Leave"?"!border-amber-400/30 !bg-amber-400/10 text-amber-300":
                      "!border-rose-400/30 !bg-rose-400/10 text-rose-300"}`}>{e.status}</span>
                  </td>
                  <td className="px-4 py-3 text-white/60">{new Date(e.joiningDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={()=>openEdit(e)} className="ghost-btn !p-2"><Pencil size={14}/></button>
                      <button onClick={()=>remove(e)} className="ghost-btn !p-2 hover:!bg-rose-500/10 hover:!border-rose-400/30"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-3 border-t border-white/5">
          <button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="ghost-btn disabled:opacity-30">Prev</button>
          <div className="text-xs text-white/50">Page {page} of {pages}</div>
          <button disabled={page>=pages} onClick={()=>setPage(p=>p+1)} className="ghost-btn disabled:opacity-30">Next</button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center p-4">
            <motion.form onSubmit={save} initial={{scale:.95, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:.95, opacity:0}}
              className="glass w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{editing ? "Edit employee" : "Add employee"}</h2>
                <button type="button" onClick={()=>setOpen(false)} className="ghost-btn !p-2"><X size={16}/></button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="label">Full name</label>
                  <input className="input" required value={form.fullName} onChange={e=>setForm({...form, fullName:e.target.value})}/></div>
                <div><label className="label">Email</label>
                  <input className="input" type="email" required value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/></div>
                <div><label className="label">Phone</label>
                  <input className="input" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})}/></div>
                <div><label className="label">CNIC</label>
                  <input className="input" value={form.cnic} onChange={e=>setForm({...form, cnic:e.target.value})}/></div>
                <div><label className="label">Department</label>
                  <input className="input" required value={form.department} onChange={e=>setForm({...form, department:e.target.value})}/></div>
                <div><label className="label">Position</label>
                  <input className="input" required value={form.position} onChange={e=>setForm({...form, position:e.target.value})}/></div>
                <div><label className="label">Salary (USD)</label>
                  <input className="input" type="number" min={0} value={form.salary} onChange={e=>setForm({...form, salary:Number(e.target.value)})}/></div>
                <div><label className="label">Joining Date</label>
                  <input className="input" type="date" value={form.joiningDate} onChange={e=>setForm({...form, joiningDate:e.target.value})}/></div>
                <div><label className="label">Gender</label>
                  <select className="input" value={form.gender} onChange={e=>setForm({...form, gender:e.target.value as any})}>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select></div>
                <div><label className="label">Status</label>
                  <select className="input" value={form.status} onChange={e=>setForm({...form, status:e.target.value as typeof form.status})}>
                    <option>Active</option><option>On Leave</option><option>Inactive</option>
                  </select></div>
                <div className="sm:col-span-2"><label className="label">Address</label>
                  <input className="input" value={form.address} onChange={e=>setForm({...form, address:e.target.value})}/></div>
                <div className="sm:col-span-2"><label className="label">Emergency contact</label>
                  <input className="input" value={form.emergencyContact} onChange={e=>setForm({...form, emergencyContact:e.target.value})}/></div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button type="button" onClick={()=>setOpen(false)} className="ghost-btn">Cancel</button>
                <button disabled={saving} className="glow-btn">
                  {saving ? <Loader2 className="animate-spin" size={16}/> : (editing ? "Save changes" : "Create employee")}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function EmployeesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-white/20" size={32}/></div>}>
      <EmployeesContent />
    </Suspense>
  );
}
