"use client";

import { useState, useEffect } from "react";
import { Player } from "@/lib/types";
import { Stars } from "@/components/ui/player-card";

interface Props {
  open: boolean;
  onClose: () => void;
  positionKey: string;
  positionLabel: string;
  players: Player[];
  selected: Player[];
  onToggle: (player: Player) => void;
}

export default function PositionPicker({
  open, onClose, positionKey, positionLabel, players, selected, onToggle,
}: Props) {
  const [search, setSearch] = useState("");

  useEffect(() => { if (open) setSearch(""); }, [open]);
  if (!open) return null;

  const selectedIds = selected.map(p => p.id);

  // STRICT filter — only exact position match
  const matching = players
    .filter(p => p.isAvailable && p.playerType === "player")
    .filter(p => p.position === positionKey)
    .filter(p => !search || p.user?.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-[9000]" onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        className="bg-dark-card border border-dark-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[85vh] flex flex-col animate-[slide-in-bottom_0.3s_ease-out]">

        {/* Header */}
        <div className="bg-dark-card border-b border-dark-border p-4 rounded-t-2xl">
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold text-white">
                  {positionKey}
                </span>
                <h3 className="font-bold text-white">{positionLabel}</h3>
              </div>
              <p className="text-xs text-white/40 mt-1">
                {matching.length} available • select as many as you need
              </p>
            </div>
            <button onClick={onClose} className="text-white/40 text-xl hover:text-white">✕</button>
          </div>

          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`Search ${positionKey} players...`}
            className="w-full px-3 py-2.5 rounded-xl bg-dark border border-dark-border text-white text-sm outline-none focus:border-primary-500"
            autoFocus
          />

          {selected.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {selected.map(p => (
                <span key={p.id} className="bg-primary-900/40 text-primary-400 border border-primary-700 px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5">
                  {p.user?.name?.split(" ")[0]}
                  <button onClick={() => onToggle(p)} className="hover:text-white">✕</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 p-2">
          {matching.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-white/30 text-sm">
                No {positionKey} players available{search && " matching your search"}.
              </p>
              <p className="text-white/20 text-xs mt-1">Try another position.</p>
            </div>
          ) : (
            matching.map(p => {
              const isSel = selectedIds.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => onToggle(p)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition text-left mb-1 ${
                    isSel ? "bg-primary-900/30 border border-primary-700" : "hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${
                    isSel ? "bg-primary-600 border-primary-600" : "border-white/20"
                  }`}>
                    {isSel && <span className="text-white text-[11px]">✓</span>}
                  </div>

                  {p.photo ? (
                    <img src={p.photo} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary-800 flex items-center justify-center text-sm font-bold text-white">
                      {p.user?.name?.charAt(0)}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-white truncate">{p.user?.name}</p>
                    <p className="text-[11px] text-white/40">
                      {p.clubs?.find(c => c.isCurrent)?.name || "—"} • {p.location || "BD"} • {p.experience}yr
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      p.tier === "A" ? "bg-yellow-500 text-white" :
                      p.tier === "B" ? "bg-slate-400 text-white" : "bg-amber-700 text-white"
                    }`}>{p.tier}</span>
                    {p.reviews?.length > 0 ? (
                      <div className="mt-1"><Stars rating={p.rating} /></div>
                    ) : (
                      <p className="text-[10px] text-white/25 mt-1">No rating</p>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-dark-border p-3">
          <button onClick={onClose}
            className="w-full btn-primary text-white py-3 rounded-xl font-bold">
            Done {selected.length > 0 && `(${selected.length} selected)`}
          </button>
        </div>
      </div>
    </div>
  );
}