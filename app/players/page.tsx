"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import PlayerCard from "@/components/ui/player-card";
import Loading from "@/components/ui/loading";
import { playersAPI } from "@/lib/api";
import { useLang } from "@/lib/language-context";
import { Player } from "@/lib/types";

function PlayersContent() {
  const searchParams = useSearchParams();
  const { t } = useLang();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState("");
  const [position, setPosition] = useState("");
  const [available, setAvailable] = useState("");
  const [sort, setSort] = useState("rating");
  const [playerType, setPlayerType] = useState(searchParams.get("playerType") || "");

  const load = () => {
    setLoading(true);
    const p: Record<string, string> = {};
    if (search) p.search = search;
    if (tier) p.tier = tier;
    if (position) p.position = position;
    if (available) p.available = available;
    if (sort) p.sort = sort;
    if (playerType) p.playerType = playerType;
    playersAPI.getAll(p).then(r => setPlayers(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [tier, position, available, sort, playerType]);
  useEffect(() => { setPlayerType(searchParams.get("playerType") || ""); }, [searchParams]);

  const title = playerType === "coach" ? t("nav.coaches") : playerType === "referee" ? t("nav.referees") : playerType === "player" ? t("nav.players") : t("common.all");

  return (
    <div className="min-h-screen bg-dark text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        <h1 className="text-3xl font-bold mb-6 gradient-text">{title}</h1>

        {/* Filters */}
        <div className="glass rounded-2xl p-4 sm:p-5 mb-8">
          <form onSubmit={e => { e.preventDefault(); load(); }} className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 items-end">
            <div className="col-span-2 sm:flex-[2] sm:min-w-[200px]">
              <label className="block text-xs font-semibold text-white/50 mb-1">{t("common.search")}</label>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="..."
                className="w-full px-3 py-2.5 rounded-xl bg-dark-card border border-dark-border text-white text-sm" />
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-white/50 mb-1">Type</label>
              <select value={playerType} onChange={e => setPlayerType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-dark-card border border-dark-border text-white text-sm">
                <option value="">{t("common.all")}</option>
                <option value="player">{t("nav.players")}</option>
                <option value="coach">{t("nav.coaches")}</option>
                <option value="referee">{t("nav.referees")}</option>
              </select>
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-white/50 mb-1">{t("common.allTiers")}</label>
              <select value={tier} onChange={e => setTier(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-dark-card border border-dark-border text-white text-sm">
                <option value="">{t("common.all")}</option>
                <option value="A">Tier A</option><option value="B">Tier B</option><option value="C">Tier C</option>
              </select>
            </div>
            {playerType !== "referee" && (
              <div className="col-span-1">
                <label className="block text-xs font-semibold text-white/50 mb-1">{t("common.allPositions")}</label>
                <select value={position} onChange={e => setPosition(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-dark-card border border-dark-border text-white text-sm">
                  <option value="">{t("common.all")}</option>
                  <option>Striker</option><option>Midfielder</option><option>Defender</option><option>Goalkeeper</option><option>Winger</option>
                </select>
              </div>
            )}
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-white/50 mb-1">Sort</label>
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-dark-card border border-dark-border text-white text-sm">
                <option value="rating">{t("common.topRated")}</option>
                <option value="experience">{t("profile.experience")}</option>
              </select>
            </div>
            <button type="submit" className="btn-primary text-white px-6 py-2.5 rounded-xl font-semibold col-span-2 sm:col-span-1">
              {t("common.search")}
            </button>
          </form>
        </div>

        <p className="text-sm text-white/40 mb-4">{players.length} found</p>

        {loading ? <Loading /> : players.length === 0 ? (
          <div className="text-center py-20"><p className="text-5xl mb-4">🔍</p><p className="text-white/40">No results found.</p></div>
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:gap-4 lg:gap-6 stagger">
            {players.map(p => <PlayerCard key={p.id} player={p} />)}
          </div>
        )}
      </div>

      <Footer />
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