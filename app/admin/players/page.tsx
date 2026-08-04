"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { playersAPI } from "@/lib/api";
import { Player } from "@/lib/types";
import { TierBadge, TypeBadge } from "@/components/ui/player-card";
import PdfDownloadButton from "@/components/ui/pdf-download-button";
import ConfirmModal from "@/components/ui/confirm-modal";
import Toast from "@/components/ui/toast";
import Loading from "@/components/ui/loading";
import { useToast } from "@/lib/hooks";
import { generateBulkPDF } from "@/lib/pdf-generator";

export default function AdminPlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [confirm, setConfirm] = useState<{ id: string; name: string } | null>(null);
  const { toast, showToast } = useToast();

  const fetch = () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (typeFilter) params.playerType = typeFilter;
    playersAPI.getAllAdmin(params)
      .then(r => setPlayers(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [typeFilter]);

  const toggleAvail = async (id: string) => {
    await playersAPI.toggleAvailability(id);
    showToast("Availability updated");
    fetch();
  };

  const deletePlayer = async () => {
    if (!confirm) return;
    await playersAPI.delete(confirm.id);
    showToast("Deleted", "error");
    setConfirm(null);
    fetch();
  };

  const filtered = players.filter(p =>
    !search || p.user?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const exportAll = () => {
    if (filtered.length === 0) { showToast("No records to export", "warning"); return; }
    const title = typeFilter
      ? `${typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}s`
      : "All Profiles";
    generateBulkPDF(filtered, title);
    showToast(`Exported ${filtered.length} records to PDF`);
  };

  const counts = {
    all: players.length,
    player: players.filter(p => p.playerType === "player").length,
    coach: players.filter(p => p.playerType === "coach").length,
    referee: players.filter(p => p.playerType === "referee").length,
  };

  return (
    <div>
      {/* Header actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
        <div className="flex gap-2 flex-1">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name..."
            className="flex-1 px-3 py-2.5 border rounded-lg text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportAll}
            className="bg-slate-800 text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-slate-900 transition whitespace-nowrap"
          >
            📄 Export PDF ({filtered.length})
          </button>
          <Link
            href="/admin/players/new"
            className="bg-green-600 text-white px-4 py-2.5 rounded-lg font-semibold text-sm text-center hover:bg-green-700 whitespace-nowrap"
          >
            ➕ Add
          </Link>
        </div>
      </div>

      {/* Type filter tabs */}
      <div className="flex gap-2 overflow-x-auto mb-4 pb-1">
        {[
          { key: "", label: "All", icon: "👥" },
          { key: "player", label: "Players", icon: "⚽" },
          { key: "coach", label: "Coaches", icon: "🎓" },
          { key: "referee", label: "Referees", icon: "🏁" },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setTypeFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition ${
              typeFilter === f.key ? "bg-green-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {f.icon} {f.label} ({counts[(f.key || "all") as keyof typeof counts]})
          </button>
        ))}
      </div>

      {loading ? <Loading /> : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-16 text-center">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-slate-400">No records found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(p => (
            <div key={p.id} className="bg-white rounded-xl shadow-sm p-4">
              {/* Top row */}
              <div className="flex items-center gap-3 mb-3">
                {p.photo ? (
                  <img src={p.photo} className="w-12 h-12 rounded-xl object-cover" alt="" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center font-bold text-green-700">
                    {p.user?.name?.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold truncate">{p.user?.name}</p>
                    {!p.isApproved && (
                      <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0">
                        PENDING
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {p.position || p.playerType} • {p.clubs?.find(c => c.isCurrent)?.name || "—"}
                  </p>
                  <p className="text-xs text-slate-400">{p.user?.email} • {p.user?.phone || "no phone"}</p>
                </div>
                <div className="flex flex-col gap-1 items-end shrink-0">
                  <TierBadge tier={p.tier} />
                  <TypeBadge playerType={p.playerType} />
                </div>
              </div>

              {/* Actions row */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => toggleAvail(p.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                    p.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"
                  }`}
                >
                  {p.isAvailable ? "Available" : "Unavailable"}
                </button>

                <div className="flex items-center gap-2">
                  <PdfDownloadButton player={p} variant="light" label="PDF" />
                  <Link href={`/admin/players/${p.id}/edit`}
                    className="text-green-600 text-sm font-semibold px-3 py-2 hover:underline">
                    Edit
                  </Link>
                  <button onClick={() => setConfirm({ id: p.id, name: p.user?.name })}
                    className="text-red-500 text-sm font-semibold px-3 py-2 hover:underline">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirm && <ConfirmModal message={`Delete "${confirm.name}"?`} onConfirm={deletePlayer} onCancel={() => setConfirm(null)} />}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}