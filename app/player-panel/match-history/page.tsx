"use client";

import { useEffect, useState } from "react";
import { playersAPI } from "@/lib/api";
import Toast from "@/components/ui/toast";
import Loading from "@/components/ui/loading";
import { useToast } from "@/lib/hooks";
import { MatchHistoryEntry } from "@/lib/types";

const empty: MatchHistoryEntry = { date: "", tournament: "", opponent: "", result: "", performance: "" };

export default function PlayerMatchHistoryPage() {
  const [matches, setMatches] = useState<MatchHistoryEntry[]>([]);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { toast, showToast } = useToast();

  useEffect(() => {
    playersAPI.getMyProfile().then(r => { setMatches(r.data.matchHistory || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const save = async (data: MatchHistoryEntry[]) => {
    try { await playersAPI.selfUpdate({ matchHistory: data }); showToast("Saved!"); }
    catch { showToast("Failed to save", "error"); }
  };

  const add = () => {
    if (!form.date || !form.opponent || !form.result) {
      showToast("Fill date, opponent & result", "warning"); return;
    }
    const u = [form, ...matches];
    setMatches(u); setForm(empty); setShowForm(false); save(u);
  };

  const remove = (i: number) => {
    const u = matches.filter((_, idx) => idx !== i);
    setMatches(u); save(u);
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-4">
      {/* Add Button / Form */}
      {!showForm ? (
        <button onClick={() => setShowForm(true)}
          className="w-full btn-primary text-white py-3.5 rounded-2xl font-bold">
          ➕ Add Match Result
        </button>
      ) : (
        <div className="glass rounded-2xl p-4 sm:p-6 animate-[slideUp_0.3s_ease-out]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-white">⚽ Add Match</h2>
            <button onClick={() => { setShowForm(false); setForm(empty); }} className="text-white/40 text-xl">✕</button>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1 text-white/70">Date *</label>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg bg-dark-card border border-dark-border text-white text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-white/70">Result *</label>
                <input value={form.result} onChange={e => setForm({ ...form, result: e.target.value })}
                  placeholder="W 3-1"
                  className="w-full px-3 py-2.5 rounded-lg bg-dark-card border border-dark-border text-white text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-white/70">Opponent *</label>
              <input value={form.opponent} onChange={e => setForm({ ...form, opponent: e.target.value })}
                placeholder="e.g. Sheikh Jamal FC"
                className="w-full px-3 py-2.5 rounded-lg bg-dark-card border border-dark-border text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-white/70">Tournament</label>
              <input value={form.tournament} onChange={e => setForm({ ...form, tournament: e.target.value })}
                placeholder="e.g. BPL 2026"
                className="w-full px-3 py-2.5 rounded-lg bg-dark-card border border-dark-border text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-white/70">Your Performance</label>
              <input value={form.performance} onChange={e => setForm({ ...form, performance: e.target.value })}
                placeholder="e.g. 2 goals, 1 assist"
                className="w-full px-3 py-2.5 rounded-lg bg-dark-card border border-dark-border text-white text-sm" />
            </div>

            <button onClick={add} className="w-full btn-primary text-white py-3 rounded-xl font-bold">
              ✓ Save Match
            </button>
          </div>
        </div>
      )}

      {/* Match List */}
      <div className="glass rounded-2xl p-4 sm:p-6">
        <h2 className="font-bold mb-3 text-white">Match History ({matches.length})</h2>

        {matches.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-4xl mb-3">⚽</p>
            <p className="text-white/30 text-sm">No matches recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {matches.map((m, i) => (
              <div key={i} className="bg-dark-card rounded-xl border border-dark-border p-3">
                <div className="flex justify-between items-start gap-2 mb-1">
                  <p className="font-semibold text-sm text-white truncate">{m.opponent}</p>
                  <span className={`px-2.5 py-1 rounded-lg font-bold text-xs shrink-0 ${
                    m.result.startsWith("W") ? "bg-green-900/30 text-green-400 border border-green-800" :
                    m.result.startsWith("D") ? "bg-yellow-900/30 text-yellow-400 border border-yellow-800" :
                    "bg-red-900/30 text-red-400 border border-red-800"
                  }`}>{m.result}</span>
                </div>
                <p className="text-xs text-white/40">{m.tournament || "—"} • {m.date}</p>
                {m.performance && <p className="text-xs text-primary-400 mt-1">{m.performance}</p>}
                <button onClick={() => remove(i)}
                  className="text-red-400 text-[11px] font-semibold mt-2 hover:text-red-300">
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}