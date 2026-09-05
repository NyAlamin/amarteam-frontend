"use client";

import { useEffect, useState } from "react";
import { playerRequestsAPI } from "@/lib/api";
import Toast from "@/components/ui/toast";
import Loading from "@/components/ui/loading";
import { useToast } from "@/lib/hooks";

const STATUSES = [
  { value: "pending", label: "Pending", bg: "bg-yellow-500/10", color: "text-yellow-400", icon: "⏳" },
  { value: "reviewing", label: "Reviewing", bg: "bg-blue-500/10", color: "text-blue-400", icon: "🔍" },
  { value: "found", label: "Found", bg: "bg-green-500/10", color: "text-green-400", icon: "✅" },
  { value: "closed", label: "Closed", bg: "bg-slate-500/10", color: "text-slate-400", icon: "📁" },
  { value: "cancelled", label: "Cancelled", bg: "bg-red-500/10", color: "text-red-400", icon: "❌" },
];

export default function AdminPlayerRequestsPage() {
  const { toast, showToast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [editId, setEditId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState("");

  const load = () => {
    playerRequestsAPI.getAll()
      .then(r => setRequests(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const changeStatus = async (id: string, status: string) => {
    try {
      await playerRequestsAPI.update(id, { status });
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      showToast(`Status changed to ${status}`);
    } catch { showToast("Failed", "error"); }
  };

  const saveNote = async (id: string) => {
    try {
      await playerRequestsAPI.update(id, { adminNote: editNote });
      setRequests(prev => prev.map(r => r.id === id ? { ...r, adminNote: editNote } : r));
      setEditId(null);
      showToast("Note saved");
    } catch { showToast("Failed", "error"); }
  };

  const deleteReq = async (id: string) => {
    if (!confirm("Delete this request?")) return;
    try {
      await playerRequestsAPI.delete(id);
      setRequests(prev => prev.filter(r => r.id !== id));
      showToast("Deleted");
    } catch { showToast("Failed", "error"); }
  };

  const filtered = filter === "all" ? requests : requests.filter(r => r.status === filter);
  const counts = STATUSES.reduce((a, s) => {
    a[s.value] = requests.filter(r => r.status === s.value).length;
    return a;
  }, {} as Record<string, number>);

  if (loading) return <Loading />;

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-start mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-800">🔍 Player Requests</h2>
          <p className="text-sm text-slate-500 mt-1">
            Requests from hirers looking for players not yet on the platform.
          </p>
        </div>
        <span className="bg-slate-100 px-3 py-1.5 rounded-lg text-sm font-bold text-slate-600">
          {requests.length} total
        </span>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto">
        <button onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            filter === "all" ? "bg-green-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}>
          All ({requests.length})
        </button>
        {STATUSES.map(s => (
          <button key={s.value} onClick={() => setFilter(s.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              filter === s.value ? "bg-green-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}>
            {s.icon} {s.label} ({counts[s.value] || 0})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-3xl mb-3">🔍</p>
          <p className="text-slate-400">No requests found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => {
            const info = STATUSES.find(s => s.value === r.status) || STATUSES[0];
            return (
              <div key={r.id} className="bg-white rounded-xl shadow-sm p-5">
                {/* Header */}
                <div className="flex justify-between items-start gap-3 mb-3">
                  <div>
                    <p className="font-bold text-slate-800">
                      Looking for: <span className="text-green-600">{r.playerName}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {r.club && `Club: ${r.club} • `}
                      {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${info.bg} ${info.color}`}>
                    {info.icon} {info.label}
                  </span>
                </div>

                {/* Details */}
                <div className="bg-slate-50 rounded-lg p-3 space-y-1.5 text-sm mb-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Requester</span>
                    <span className="text-slate-700 font-medium">{r.requesterName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phone</span>
                    <a href={`tel:${r.phone}`} className="text-green-600 font-semibold">{r.phone}</a>
                  </div>
                  {r.tournament && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tournament</span>
                      <span className="text-slate-700">{r.tournament}</span>
                    </div>
                  )}
                  {r.location && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Location</span>
                      <span className="text-slate-700">{r.location}</span>
                    </div>
                  )}
                  {r.note && (
                    <div className="pt-1.5 border-t border-slate-200">
                      <span className="text-slate-400 text-xs">Note:</span>
                      <p className="text-slate-600 text-sm mt-0.5">{r.note}</p>
                    </div>
                  )}
                  {r.user && (
                    <div className="flex justify-between pt-1.5 border-t border-slate-200">
                      <span className="text-slate-400">Account</span>
                      <span className="text-slate-500 text-xs">{r.user.email}</span>
                    </div>
                  )}
                </div>

                {/* Admin note */}
                {editId === r.id ? (
                  <div className="mb-3">
                    <textarea value={editNote} onChange={e => setEditNote(e.target.value)} rows={2}
                      placeholder="Admin note..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-green-500" />
                    <div className="flex gap-2 mt-1.5">
                      <button onClick={() => saveNote(r.id)}
                        className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold">Save</button>
                      <button onClick={() => setEditId(null)}
                        className="text-slate-400 text-xs">Cancel</button>
                    </div>
                  </div>
                ) : r.adminNote ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 mb-3 flex justify-between items-start">
                    <div>
                      <p className="text-[10px] text-green-600 font-semibold mb-0.5">ADMIN NOTE</p>
                      <p className="text-sm text-green-800">{r.adminNote}</p>
                    </div>
                    <button onClick={() => { setEditId(r.id); setEditNote(r.adminNote); }}
                      className="text-green-500 text-xs font-semibold shrink-0">Edit</button>
                  </div>
                ) : null}

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Status buttons */}
                  {STATUSES.filter(s => s.value !== r.status).map(s => (
                    <button key={s.value} onClick={() => changeStatus(r.id, s.value)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition ${s.bg} ${s.color} hover:opacity-80`}>
                      {s.icon} {s.label}
                    </button>
                  ))}

                  <div className="flex-1" />

                  {!r.adminNote && !editId && (
                    <button onClick={() => { setEditId(r.id); setEditNote(""); }}
                      className="text-slate-400 text-xs font-semibold hover:text-slate-600">
                      + Note
                    </button>
                  )}

                  <button onClick={() => deleteReq(r.id)}
                    className="text-red-400 text-xs font-semibold hover:text-red-600">
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}