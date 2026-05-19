"use client";
import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, X, Loader2, Building2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type Department = {
  _id: string;
  name: string;
  description?: string;
  head?: string;
};

export default function DepartmentsPage() {
  const [items, setItems] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [form, setForm] = useState({ name: "", description: "", head: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/departments");
      const data = await res.json();
      setItems(data || []);
    } catch (e) {
      toast.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditing(null);
    setForm({ name: "", description: "", head: "" });
    setOpen(true);
  }

  function openEdit(d: Department) {
    setEditing(d);
    setForm({ name: d.name, description: d.description || "", head: d.head || "" });
    setOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const url = editing ? `/api/departments/${editing._id}` : "/api/departments";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setSaving(false);
    if (!res.ok) return toast.error("Failed to save department");
    toast.success(editing ? "Department updated" : "Department created");
    setOpen(false);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Are you sure? This will not delete employees in this department.")) return;
    const res = await fetch(`/api/departments/${id}`, { method: "DELETE" });
    if (!res.ok) return toast.error("Failed to delete");
    toast.success("Deleted");
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Departments</h1>
          <p className="text-sm text-white/50">Manage your organization structure</p>
        </div>
        <button onClick={openCreate} className="glow-btn"><Plus size={16}/> Add Department</button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-32"/>)}
        {!loading && items.map(d => (
          <div key={d._id} className="glass p-5 group relative">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-white/5 grid place-items-center text-cyan-400">
                <Building2 size={20}/>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                <button onClick={() => openEdit(d)} className="ghost-btn !p-1.5"><Pencil size={14}/></button>
                <button onClick={() => remove(d._id)} className="ghost-btn !p-1.5 text-rose-400"><Trash2 size={14}/></button>
              </div>
            </div>
            <h3 className="mt-4 font-semibold text-lg">{d.name}</h3>
            <p className="text-sm text-white/50 line-clamp-2 mt-1">{d.description || "No description provided."}</p>
            <div className="mt-4 pt-4 border-t border-white/5 text-xs text-white/40">
              Head: <span className="text-white/70">{d.head || "Not assigned"}</span>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center p-4">
            <motion.form onSubmit={save} initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">{editing ? "Edit Department" : "New Department"}</h2>
                <button type="button" onClick={() => setOpen(false)} className="ghost-btn !p-2"><X size={16}/></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="label">Department Name</label>
                  <input className="input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Engineering"/>
                </div>
                <div>
                  <label className="label">Department Head</label>
                  <input className="input" value={form.head} onChange={e => setForm({ ...form, head: e.target.value })} placeholder="Name of the manager"/>
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea className="input min-h-[100px] py-2" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}/>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button type="button" onClick={() => setOpen(false)} className="ghost-btn">Cancel</button>
                <button disabled={saving} className="glow-btn">
                  {saving ? <Loader2 className="animate-spin" size={16}/> : "Save Department"}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}