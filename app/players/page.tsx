"use client";

import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import BottomNav from "@/components/layout/bottom-nav";
import PlayerCard from "@/components/ui/player-card";
import Loading from "@/components/ui/loading";
import { playersAPI } from "@/lib/api";
import { useLang } from "@/lib/language-context";
import { Player } from "@/lib/types";

function useDebounce(value: string, ms = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

function PlayersContent() {
  const searchParams = useSearchParams();
  const { t } = useLang();

  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [tier, setTier] = useState("");
  const [position, setPosition] = useState("");
  const [sort, setSort] = useState("rating");
  const [playerType, setPlayerType] = useState(searchParams.get("playerType") || "");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const debouncedSearch = useDebounce(search);

  const load = useCallback(() => {
    setLoading(true);
    const p: Record<string, string> = { isForeign: "false" };
    if (debouncedSearch) p.search = debouncedSearch;
    if (tier) p.tier = tier;
    if (position) p.position = position;
    if (sort) p.sort = sort;
    if (playerType) p.playerType = playerType;
    playersAPI.getAll(p)
      .then(r => setPlayers(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [debouncedSearch, tier, position, sort, playerType]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPlayerType(searchParams.get("playerType") || ""); }, [searchParams]);

  const title = playerType === "coach"
    ? t("nav.coaches")
    : playerType === "referee"
      ? t("nav.referees")
      : playerType === "player"
        ? t("nav.players")
        : t("common.all");

  const activeFilterCount = [tier, position, playerType].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-dark text-white pb-[70px] lg:pb-0">
      <Navbar />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-[72px] sm:pt-24 pb-8 sm:pb-16">

        {/* ─── HEADER + SEARCH ─── */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-3xl font-bold gradient-text mb-3 sm:mb-4">{title}</h1>

          {/* Search bar — always visible */}
          <div className="relative">
            <svg viewBox="0 0 24 24" fill="none"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, district, position…"
              className="w-full bg-dark-card border border-dark-border rounded-xl pl-9 pr-4 py-2.5 sm:py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-primary-500/50 transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* ─── FILTER BAR ─── */}
        {/* Mobile: toggle button + collapsible */}
        <div className="mb-4 sm:mb-6">

          {/* Mobile filter toggle */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="sm:hidden flex items-center gap-2 px-3.5 py-2 rounded-xl bg-dark-card border border-dark-border text-sm text-white/60 active:bg-white/[0.06] transition w-full justify-between"
          >
            <span className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                <path d="M3 6h18M7 12h10M10 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-primary-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </span>
            <svg viewBox="0 0 24 24" fill="none" className={`w-4 h-4 transition-transform ${filtersOpen ? "rotate-180" : ""}`}>
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Filter controls — always visible on desktop, collapsible on mobile */}
          <div className={`${filtersOpen ? "mt-3 flex" : "hidden"} sm:flex flex-wrap gap-2 sm:gap-2.5 items-center`}>

            {/* Type chips */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { value: "", label: "All" },
                { value: "player", label: "Players" },
                { value: "coach", label: "Coaches" },
                { value: "referee", label: "Referees" },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setPlayerType(opt.value)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    playerType === opt.value
                      ? "bg-primary-500 text-white"
                      : "bg-dark-card border border-dark-border text-white/50 hover:text-white/80"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="w-px h-5 bg-white/10 hidden sm:block" />

            {/* Tier select */}
            <select
              value={tier}
              onChange={e => setTier(e.target.value)}
              className="px-3 py-1.5 rounded-full bg-dark-card border border-dark-border text-xs font-medium text-white/60 outline-none focus:border-primary-500/50 transition appearance-none cursor-pointer"
              style={{ backgroundImage: "none" }}
            >
              <option value="">All Tiers</option>
              <option value="A">Tier A</option>
              <option value="B">Tier B</option>
              <option value="C">Tier C</option>
            </select>

            {/* Position select — hidden for referees */}
            {playerType !== "referee" && (
              <select
                value={position}
                onChange={e => setPosition(e.target.value)}
                className="px-3 py-1.5 rounded-full bg-dark-card border border-dark-border text-xs font-medium text-white/60 outline-none focus:border-primary-500/50 transition appearance-none cursor-pointer"
                style={{ backgroundImage: "none" }}
              >
                <option value="">All Positions</option>
                <option>Striker</option>
                <option>Midfielder</option>
                <option>Defender</option>
                <option>Goalkeeper</option>
                <option>Winger</option>
              </select>
            )}

            {/* Sort */}
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="px-3 py-1.5 rounded-full bg-dark-card border border-dark-border text-xs font-medium text-white/60 outline-none focus:border-primary-500/50 transition appearance-none cursor-pointer"
              style={{ backgroundImage: "none" }}
            >
              <option value="rating">Top Rated</option>
              <option value="experience">Experience</option>
            </select>

            {/* Clear all — only if filters active */}
            {activeFilterCount > 0 && (
              <button
                onClick={() => { setTier(""); setPosition(""); setPlayerType(""); }}
                className="text-primary-400 text-xs font-semibold hover:text-primary-300 transition whitespace-nowrap"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* ─── RESULTS ─── */}
        <p className="text-xs sm:text-sm text-white/35 mb-3 sm:mb-4">
          {loading ? "Searching…" : `${players.length} found`}
        </p>

        {loading ? (
          <Loading />
        ) : players.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <p className="text-4xl sm:text-5xl mb-3 sm:mb-4">🔍</p>
            <p className="text-white/40 text-sm">No results found.</p>
            {(search || activeFilterCount > 0) && (
              <button
                onClick={() => { setSearch(""); setTier(""); setPosition(""); setPlayerType(""); }}
                className="mt-3 text-primary-400 text-sm font-semibold hover:text-primary-300 transition"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6 stagger">
            {players.map(p => <PlayerCard key={p.id} player={p} />)}
          </div>
        )}
      </div>

      <Footer />
      <BottomNav />
    </div>
  );
}

export default function PlayersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-dark" />}>
      <PlayersContent />
    </Suspense>
  );
}