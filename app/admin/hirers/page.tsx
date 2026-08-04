"use client";

import { useEffect, useState } from "react";
import { usersAPI } from "@/lib/api";
import ConfirmModal from "@/components/ui/confirm-modal";
import Toast from "@/components/ui/toast";
import Loading from "@/components/ui/loading";
import { useToast } from "@/lib/hooks";
import { User } from "@/lib/types";

export default function AdminHirersPage() {
  const [hirers, setHirers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState<string | null>(null);
  const { toast, showToast } = useToast();

  const fetch = () => { usersAPI.getHirers().then(r => setHirers(r.data)).finally(() => setLoading(false)); };
  useEffect(() => { fetch(); }, []);

  const toggle = async (id: string) => { await usersAPI.toggleActive(id); showToast("Updated"); fetch(); };
  const del = async () => { if (!confirm) return; await usersAPI.delete(confirm); showToast("Deleted", "error"); setConfirm(null); fetch(); };

  if (loading) return <Loading />;

  return (
    <div className="space-y-3">
      {hirers.length === 0 ? <p className="text-center py-16 text-slate-400">No hirers yet.</p> :
        hirers.map(h => (
          <div key={h.id} className="bg-white rounded-xl shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-semibold">{h.name}</p>
              <p className="text-xs text-slate-500">{h.email} • {h.phone}</p>
              <p className="text-xs text-slate-400">{h.location} • Joined: {new Date(h.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => toggle(h.id)} className={`px-3 py-1 rounded-full text-xs font-semibold ${h.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"}`}>{h.isActive ? "Active" : "Inactive"}</button>
              <button onClick={() => setConfirm(h.id)} className="text-red-500 text-sm font-semibold">Delete</button>
            </div>
          </div>
        ))
      }
      {confirm && <ConfirmModal message="Delete this hirer?" onConfirm={del} onCancel={() => setConfirm(null)} />}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}