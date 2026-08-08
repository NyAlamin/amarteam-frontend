"use client";

import { useEffect, useState, Suspense } from "react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import PlayerCard from "@/components/ui/player-card";
import Loading from "@/components/ui/loading";
import { playersAPI } from "@/lib/api";
import { useLang } from "@/lib/language-context";
import { Player } from "@/lib/types";

const INPUT = "w-full px-3 py-2.5 rounded-xl bg-dark-card border border-dark-border text-white text-sm outline-none focus:border-primary-500 transition";

function ForeignPlayersContent() {
  const { t } = useLang();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [nationality, setNationality] = useState("");
  const [position, setPosition] = useState("");
  const [tier, setTier] = useState("");
  const [sort, setSort] = useState("rating");

  // Every nationality present in the data — built from results, no hardcoded list
  const [countries, setCountries] = useState<string[]>([]);

  const load = () => {
    setLoading(true);
    const p: Record<string, string> = { isForeign: "true" };
    if (search) p.search = search;
    if (nationality) p.nationality = nationality;
    if (position) p.position = position;
    if (tier) p.tier = tier;
    if (sort) p.sort = sort;
    playersAPI.getAll(p)
      .then(r => setPlayers(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [nationality, position, tier, sort]);

  // Populate the country dropdown once, unfiltered
  useEffect(() => {
    playersAPI.getAll({ isForeign: "true" })
      .then(r => {
        const list = (r.data as Player[])
          .map(p => p.nationality)
          .filter((n): n is string => !!n);
        setCountries([...new Set(list)].sort());
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-dark text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl">🌍</span>
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text">
              {t("nav.foreign")}
            </h1>
          </div>
          <p className="text-white/45 text-sm mt-2">
            {t("section.foreignSubtitle")}
          </p>
        </div>

        {/* Filters */}
        <div className="glass rounded-2xl p-4 sm:p-5 mb-8">
          <form onSubmit={e => { e.preventDefault(); load(); }}
            className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 items-end">

            <div className="col-span-2 sm:flex-[2] sm:min-w-[180px]">
              <label className="block text-xs font-semibold text-white/50 mb-1">
                {t("common.search")}
              </label>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Name..." className={INPUT} />
            </div>

            <div className="col-span-1">
              <label className="block text-xs font-semibold text-white/50 mb-1">
                {t("profile.nationality")}
              </label>
              <select value={nationality} onChange={e => setNationality(e.target.value)}
                className={INPUT} style={{ colorScheme: "dark" }}>
                <option value="">{t("common.allCountries")}</option>
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="col-span-1">
              <label className="block text-xs font-semibold text-white/50 mb-1">
                {t("common.allPositions")}
              </label>
              <select value={position} onChange={e => setPosition(e.target.value)}
                className={INPUT} style={{ colorScheme: "dark" }}>
                <option value="">{t("common.all")}</option>
                <optgroup label="Goalkeeper">
                  <option value="GK">GK</option>
                </optgroup>
                <optgroup label="Defense">
                  <option value="LB">LB</option>
                  <option value="CB">CB</option>
                  <option value="RB">RB</option>
                  <option value="LWB">LWB</option>
                  <option value="RWB">RWB</option>
                </optgroup>
                <optgroup label="Midfield">
                  <option value="CDM">CDM</option>
                  <option value="CM">CM</option>
                  <option value="CAM">CAM</option>
                  <option value="LM">LM</option>
                  <option value="RM">RM</option>
                </optgroup>
                <optgroup label="Attack">
                  <option value="LW">LW</option>
                  <option value="RW">RW</option>
                  <option value="LF">LF</option>
                  <option value="CF">CF</option>
                  <option value="RF">RF</option>
                  <option value="ST">ST</option>
                </optgroup>
              </select>
            </div>

            <div className="col-span-1">
              <label className="block text-xs font-semibold text-white/50 mb-1">
                {t("common.allTiers")}
              </label>
              <select value={tier} onChange={e => setTier(e.target.value)}
                className={INPUT} style={{ colorScheme: "dark" }}>
                <option value="">{t("common.all")}</option>
                <option value="A">Tier A</option>
                <option value="B">Tier B</option>
                <option value="C">Tier C</option>
              </select>
            </div>

            <div className="col-span-1">
              <label className="block text-xs font-semibold text-white/50 mb-1">Sort</label>
              <select value={sort} onChange={e => setSort(e.target.value)}
                className={INPUT} style={{ colorScheme: "dark" }}>
                <option value="rating">{t("common.topRated")}</option>
                <option value="experience">{t("profile.experience")}</option>
              </select>
            </div>

            <button type="submit"
              className="btn-primary text-white px-6 py-2.5 rounded-xl font-semibold col-span-2 sm:col-span-1">
              {t("common.search")}
            </button>
          </form>
        </div>

        <p className="text-sm text-white/40 mb-4">
          {players.length} {t("common.found")}
        </p>

        {loading ? <Loading /> : players.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🌍</p>
            <p className="text-white/40 mb-1">No foreign players yet.</p>
            <p className="text-white/25 text-sm">
              International talent will appear here once approved.
            </p>
          </div>
        ) : (
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
        )}
      </div>

      <Footer />
    </div>
  );
}

export default function ForeignPlayersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-dark" />}>
      <ForeignPlayersContent />
    </Suspense>
  );
}