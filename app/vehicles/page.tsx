"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import VehicleCard from "@/components/ui/vehicle-card";
import Loading from "@/components/ui/loading";
import { vehiclesAPI } from "@/lib/api";
import { useLang } from "@/lib/language-context";
import { Vehicle, VEHICLE_TYPES } from "@/lib/types";

export default function VehiclesPage() {
  const { lang } = useLang();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [seats, setSeats] = useState("");
  const [sort, setSort] = useState("");

  const load = () => {
    setLoading(true);
    const p: Record<string, string> = {};
    if (search) p.search = search;
    if (vehicleType) p.vehicleType = vehicleType;
    if (seats) p.seats = seats;
    if (sort) p.sort = sort;
    vehiclesAPI.getAll(p).then(r => setVehicles(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [vehicleType, seats, sort]);

  return (
    <div className="min-h-screen bg-dark text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="text-center mb-8 animate-[slideUp_0.6s_ease-out]">
          <span className="text-4xl block mb-2">🚗</span>
          <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">Vehicle Rental</h1>
          <p className="text-white/40 text-sm">Book transport for your team, anywhere in Bangladesh</p>
        </div>

        {/* Type quick filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
          <button onClick={() => setVehicleType("")}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition border ${
              vehicleType === "" ? "bg-primary-600 text-white border-primary-600" : "bg-dark-card text-white/60 border-dark-border hover:text-white"
            }`}>
            All Vehicles
          </button>
          {VEHICLE_TYPES.map(t => (
            <button key={t.value} onClick={() => setVehicleType(t.value)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition border ${
                vehicleType === t.value ? "bg-primary-600 text-white border-primary-600" : "bg-dark-card text-white/60 border-dark-border hover:text-white"
              }`}>
              {t.icon} {lang === "bn" ? t.labelBn : t.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="glass rounded-2xl p-4 mb-8">
          <form onSubmit={e => { e.preventDefault(); load(); }} className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 items-end">
            <div className="col-span-2 sm:flex-[2] sm:min-w-[200px]">
              <label className="block text-xs font-semibold text-white/50 mb-1">Search</label>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Model, description..."
                className="w-full px-3 py-2.5 rounded-xl bg-dark-card border border-dark-border text-white text-sm outline-none focus:border-primary-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-1">Min Seats</label>
              <select value={seats} onChange={e => setSeats(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-dark-card border border-dark-border text-white text-sm">
                <option value="">Any</option>
                <option value="4">4+</option>
                <option value="7">7+</option>
                <option value="12">12+</option>
                <option value="20">20+</option>
                <option value="30">30+</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-1">Sort</label>
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-dark-card border border-dark-border text-white text-sm">
                <option value="">Newest</option>
                <option value="price-low">Price: Low→High</option>
                <option value="price-high">Price: High→Low</option>
                <option value="seats">Most Seats</option>
              </select>
            </div>
            <button type="submit" className="btn-primary text-white px-6 py-2.5 rounded-xl font-semibold col-span-2 sm:col-span-1">
              Search
            </button>
          </form>
        </div>

        <p className="text-sm text-white/40 mb-4">{vehicles.length} vehicle{vehicles.length !== 1 ? "s" : ""} available</p>

        {loading ? <Loading /> : vehicles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🚗</p>
            <p className="text-white/40">No vehicles found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:gap-4 lg:gap-6 stagger">
            {vehicles.map(v => <VehicleCard key={v.id} vehicle={v} />)}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}