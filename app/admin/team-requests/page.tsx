"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { teamRequestsAPI } from "@/lib/api";
import StatusPill from "@/components/ui/status-pill";
import Toast from "@/components/ui/toast";
import Loading from "@/components/ui/loading";
import { useToast } from "@/lib/hooks";
import { TeamRequest, TEAM_STATUS_INFO } from "@/lib/types";

export default function AdminTeamRequestsPage() {
  const [reqs, setReqs] = useState<TeamRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const { toast, showToast } = useToast();

  const load = () => {
    setLoading(true);
    teamRequestsAPI.getAll(filter ? { status: filter } : undefined)
      .then(r => setReqs(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const quickStatus = async (id: string, status: string) => {
    try {
      await teamRequestsAPI.update(id, { status });
      showToast("Status updated");
      load();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed", "error");
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto mb-5 pb-1">
        <button onClick={() => setFilter("")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition ${
            filter === "" ? "bg-green-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}>
          All ({reqs.length})
        </button>
        {Object.entries(TEAM_STATUS_INFO).map(([key, info]) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition ${
              filter === key ? "bg-green-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}>
            {info.icon} {info.label}
          </button>
        ))}
      </div>

      {reqs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-16 text-center">
          <p className="text-4xl mb-3">🏆</p>
          <p className="text-slate-400">No team requests {filter && "with this status"}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reqs.map(r => (
            <div key={r.id} className="bg-white rounded-xl shadow-sm p-4">
              {/* Top row */}
              <div className="flex justify-between items-start gap-3 mb-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-slate-800 truncate">{r.hirer?.name}</p>
                    <span className="text-[10px] text-slate-300 font-mono shrink-0">
                      #{r.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{r.hirer?.phone || r.hirer?.email}</p>
                </div>
                <StatusPill status={r.status} />
              </div>

              {/* Details grid */}
              <div className="bg-slate-50 rounded-lg p-3 mb-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <p className="text-slate-400 mb-0.5">📅 Date</p>
                    <p className="text-green-600 font-semibold">{r.matchDate || "—"}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-0.5">🏆 Tournament</p>
                    <p className="text-slate-700 truncate">{r.tournament || "—"}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-0.5">📍 Location</p>
                    <p className="text-slate-700 truncate">{r.location || "—"}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-0.5">👥 Players</p>
                    <p className="text-slate-700 font-semibold">{r.squad?.length || r.playersNeeded}</p>
                  </div>
                </div>
              </div>

              {/* Squad preview */}
              {r.squad?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {r.squad.slice(0, 6).map((s: any, i: number) => (
                    <span key={i} className="bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded text-[10px] font-semibold">
                      {s.positionKey}: {s.playerName?.split(" ")[0]}
                    </span>
                  ))}
                  {r.squad.length > 6 && (
                    <span className="text-slate-400 text-[10px] px-2 py-0.5">+{r.squad.length - 6} more</span>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                <span className="text-[10px] text-slate-300">
                  {new Date(r.createdAt).toLocaleDateString()}
                </span>

                <div className="flex flex-wrap gap-2">
                  {r.status === "callingSoon" && (
                    <button onClick={() => quickStatus(r.id, "advancePending")}
                      className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-yellow-100">
                      💰 Request Advance
                    </button>
                  )}
                  {r.status === "advancePending" && (
                    <button onClick={() => quickStatus(r.id, "confirmed")}
                      className="bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-100">
                      ✓ Confirm
                    </button>
                  )}
                  {r.status === "confirmed" && (
                    <button onClick={() => quickStatus(r.id, "completed")}
                      className="bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-purple-100">
                      🏁 Complete
                    </button>
                  )}

                  <Link href={`/admin/team-requests/${r.id}`} target="_blank"
                    className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 transition">
                    Open Details ↗
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}