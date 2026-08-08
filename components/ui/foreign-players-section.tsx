"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PlayerCard from "@/components/ui/player-card";
import { playersAPI } from "@/lib/api";
import { Player } from "@/lib/types";

export default function ForeignPlayersSection() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    playersAPI
      .getAll({ isForeign: "true", sort: "rating" })
      .then(r => setPlayers(r.data.slice(0, 8)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Render nothing until there's something worth showing
  if (loading || players.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-10 animate-[slideUp_0.5s_ease-out]">
      <div className="flex items-end justify-between mb-6 gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl sm:text-3xl">🌍</span>
            <h2 className="text-xl sm:text-3xl font-bold text-white truncate">
              Foreign Players
            </h2>
          </div>
          <p className="text-white/45 text-xs sm:text-sm mt-1.5">
            International talent available in Bangladesh
          </p>
        </div>

        <Link
          href="/foreign-players"
          className="shrink-0 text-blue-400 hover:text-blue-300 text-xs sm:text-sm font-semibold flex items-center gap-1 transition"
        >
          View all
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
            <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6 stagger">
        {players.map(p => (
          <div key={p.id} className="relative">
            {p.nationality && (
              <span className="absolute top-1.5 left-1/2 -translate-x-1/2 z-10 bg-blue-600/90 backdrop-blur text-white text-[8px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap max-w-[90%] truncate">
                {p.nationality}
              </span>
            )}
            <PlayerCard player={p} />
          </div>
        ))}
      </div>
    </section>
  );
}