"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { playersAPI } from "@/lib/api";
import { Player } from "@/lib/types";

function useDebounce(value: string, ms = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

export default function SearchDropdown({ className }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const debounced = useDebounce(query);

  // Fetch on every debounced keystroke
  useEffect(() => {
    if (!debounced.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    playersAPI
      .getAll({ search: debounced.trim(), isForeign: "false" })
      .then((r) => {
        setResults(r.data.slice(0, 8));
        setOpen(true);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [debounced]);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const go = (player: Player) => {
    setQuery("");
    setOpen(false);
    router.push(`/players/${player.id}`);
  };

  const goAll = () => {
    if (!query.trim()) return;
    setOpen(false);
    router.push(`/players?playerType=player&search=${encodeURIComponent(query.trim())}`);
    setQuery("");
  };

  const typeLabel = (t?: string) =>
    t === "coach" ? "Coach" : t === "referee" ? "Referee" : t === "cameraman" ? "Cameraman" : "Player";

  const typeColor = (t?: string) =>
    t === "coach" ? "bg-blue-500" : t === "referee" ? "bg-purple-500" : t === "cameraman" ? "bg-pink-500" : "bg-primary-500";

  return (
    <div ref={wrapperRef} className={`relative ${className || ""}`}>
      {/* Input */}
      <form onSubmit={(e) => { e.preventDefault(); goAll(); }} className="relative flex">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 z-10"
        >
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          placeholder="Search players, coaches, referees…"
          className="flex-1 bg-white/[0.06] border border-white/[0.08] border-r-0 rounded-l-xl pl-9 pr-3 py-2 sm:py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-primary-500/50 transition-all sm:border-r sm:rounded-xl"
        />
        {/* Mobile search button */}
        <button
          type="submit"
          className="sm:hidden px-3.5 bg-primary-500 rounded-r-xl text-white shrink-0 active:bg-primary-400 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2.5" />
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>
      </form>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-dark-card border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-[80] animate-[fadeIn_0.15s_ease-out]">
          {loading ? (
            <div className="px-4 py-6 text-center">
              <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-white/30 text-xs">Searching…</p>
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-white/40 text-sm">No results for "{debounced}"</p>
            </div>
          ) : (
            <>
              <div className="max-h-[320px] overflow-y-auto">
                {results.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => go(player)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.06] transition text-left"
                  >
                    {/* Photo */}
                    {player.photo ? (
                      <img
                        src={player.photo}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/40 text-sm font-bold shrink-0">
                        {player.user?.name?.charAt(0) || "?"}
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {player.user?.name}
                      </p>
                      <p className="text-[11px] text-white/35 truncate">
                        {player.position || typeLabel(player.playerType)}
                        {player.district ? ` • ${player.district}` : ""}
                      </p>
                    </div>

                    {/* Type badge */}
                    <span
                      className={`${typeColor(player.playerType)} text-white text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0`}
                    >
                      {typeLabel(player.playerType)}
                    </span>
                  </button>
                ))}
              </div>

              {/* View all */}
              <button
                onClick={goAll}
                className="w-full px-4 py-3 text-center text-primary-400 text-sm font-semibold hover:bg-white/[0.04] transition border-t border-white/[0.06]"
              >
                View all results for "{debounced}" →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}