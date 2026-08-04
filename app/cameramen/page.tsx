"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import CameramanCard from "@/components/ui/cameraman-card";
import LocationPicker from "@/components/ui/location-picker";
import Loading from "@/components/ui/loading";
import { playersAPI } from "@/lib/api";
import { Player } from "@/lib/types";

export default function CameramenPage() {
  const [cameramen, setCameramen] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("");
  const [upazila, setUpazila] = useState("");
  const [sort, setSort] = useState("rating");

  useEffect(() => {
    setLoading(true);
    const p: Record<string, string> = { playerType: "cameraman", available: "true" };
    if (search) p.search = search;
    if (sort) p.sort = sort;
    playersAPI.getAll(p).then(r => setCameramen(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [sort]);

  const doSearch = () => {
    setLoading(true);
    const p: Record<string, string> = { playerType: "cameraman", available: "true" };
    if (search) p.search = search;
    if (sort) p.sort = sort;
    playersAPI.getAll(p).then(r => setCameramen(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  // Client-side location filter
  const filtered = cameramen.filter(c => {
    if (district && c.district !== district) return false;
    if (upazila && c.upazila !== upazila) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-dark text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        <div className="text-center mb-8 animate-[slideUp_0.6s_ease-out]">
          <span className="text-4xl block mb-2">📷</span>
          <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">Book a Cameraman</h1>
          <p className="text-white/40 text-sm">Professional match coverage anywhere in Bangladesh</p>
        </div>

        {/* Filters */}
        <div className="glass rounded-2xl p-4 sm:p-5 mb-8">
          <div className="space-y-4">
            <LocationPicker
              district={district}
              upazila={upazila}
              onDistrictChange={setDistrict}
              onUpazilaChange={setUpazila}
              labelDistrict="Filter by District"
              labelUpazila="Filter by Upazila"
            />

            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 items-end">
              <div className="col-span-2 sm:flex-1 sm:min-w-[200px]">
                <label className="block text-xs font-semibold text-white/50 mb-1">Search</label>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && doSearch()}
                  placeholder="Name or location..."
                  className="w-full px-3 py-2.5 rounded-xl bg-dark-card border border-dark-border text-white text-sm outline-none focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1">Sort</label>
                <select value={sort} onChange={e => setSort(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-dark-card border border-dark-border text-white text-sm">
                  <option value="rating">Top Rated</option>
                  <option value="experience">Most Experienced</option>
                </select>
              </div>
              <button onClick={doSearch}
                className="btn-primary text-white px-6 py-2.5 rounded-xl font-semibold col-span-2 sm:col-span-1">
                Search
              </button>
              {(district || upazila) && (
                <button onClick={() => { setDistrict(""); setUpazila(""); }}
                  className="btn-outline text-white/70 px-4 py-2.5 rounded-xl font-semibold text-sm col-span-2 sm:col-span-1">
                  Clear location
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="text-sm text-white/40 mb-4">
          {filtered.length} cameraman{filtered.length !== 1 ? "en" : ""} found
          {district && ` in ${upazila ? `${upazila}, ` : ""}${district}`}
        </p>

        {loading ? <Loading /> : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📷</p>
            <p className="text-white/40">No cameramen found{district && " in this area"}.</p>
            {district && (
              <button onClick={() => { setDistrict(""); setUpazila(""); }}
                className="text-primary-400 text-sm mt-3 hover:underline">
                Clear location filter
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:gap-4 lg:gap-6 stagger">
            {filtered.map(c => <CameramanCard key={c.id} cameraman={c} />)}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}