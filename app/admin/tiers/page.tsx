"use client";

import { useEffect, useState } from "react";
import { playersAPI } from "@/lib/api";
import { TierBadge } from "@/components/ui/player-card";
import Toast from "@/components/ui/toast";
import Loading from "@/components/ui/loading";
import { useToast } from "@/lib/hooks";
import { Player, Tier } from "@/lib/types";

const tierBg: Record<string, string> = { A: "bg-yellow-500 text-white", B: "bg-slate-400 text-white", C: "bg-amber-700 text-white" };

export default function AdminTiersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast, showToast } = useToast();

  const fetch = () => { playersAPI.getAll().then(r => setPlayers(r.data)).finally(() => setLoading(false)); };
  useEffect(() => { fetch(); }, []);

  const change = async (id: string, tier: string) => { await playersAPI.changeTier(id, tier); showToast(`Tier → ${tier}`); fetch(); };

  if (loading) return <Loading />;

  return (
    <div className="space-y-3">
      {players.map(p => (
        <div key={p.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {p.photo ? <img src={p.photo} className="w-10 h-10 rounded-full object-cover shrink-0" alt="" /> : <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700 shrink-0">{p.user?.name?.charAt(0)}</div>}
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{p.user?.name}</p>
              <p className="text-xs text-slate-500">{p.position} • {p.experience}yr</p>
            </div>
          </div>
          <div className="flex gap-1.5 shrink-0">
            {(["A","B","C"] as Tier[]).map(t => (
              <button key={t} onClick={() => change(p.id, t)} className={`w-9 h-9 rounded-full font-bold text-sm ${p.tier === t ? tierBg[t] : "bg-white border text-slate-600"}`}>{t}</button>
            ))}
          </div>
        </div>
      ))}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}