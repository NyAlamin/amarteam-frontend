"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { vehiclesAPI } from "@/lib/api";
import ConfirmModal from "@/components/ui/confirm-modal";
import Toast from "@/components/ui/toast";
import Loading from "@/components/ui/loading";
import { useToast } from "@/lib/hooks";
import { Vehicle, VEHICLE_TYPES } from "@/lib/types";

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [confirm, setConfirm] = useState<{ id: string; name: string } | null>(null);
  const { toast, showToast } = useToast();

  const load = () => {
    setLoading(true);
    const p: Record<string, string> = {};
    if (typeFilter) p.vehicleType = typeFilter;
    vehiclesAPI.getAllAdmin(p).then(r => setVehicles(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [typeFilter]);

  const toggle = async (id: string) => {
    await vehiclesAPI.toggleAvailability(id);
    showToast("Availability updated");
    load();
  };

  const del = async () => {
    if (!confirm) return;
    try {
      await vehiclesAPI.delete(confirm.id);
      showToast("Vehicle deleted", "error");
      setConfirm(null);
      load();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed", "error");
    }
  };

  const counts: Record<string, number> = { all: vehicles.length };
  vehicles.forEach(v => { counts[v.vehicleType] = (counts[v.vehicleType] || 0) + 1; });

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
        <h2 className="text-lg font-bold text-slate-800">🚗 Vehicles ({vehicles.length})</h2>
        <Link href="/admin/vehicles/new"
          className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm text-center hover:bg-green-700 transition">
          ➕ Add Vehicle
        </Link>
      </div>

      {/* Type filter */}
      <div className="flex gap-2 overflow-x-auto mb-5 pb-1">
        <button onClick={() => setTypeFilter("")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition ${
            typeFilter === "" ? "bg-green-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
          }`}>
          All ({counts.all || 0})
        </button>
        {VEHICLE_TYPES.map(t => (
          <button key={t.value} onClick={() => setTypeFilter(t.value)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition ${
              typeFilter === t.value ? "bg-green-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
            }`}>
            {t.icon} {t.label} ({counts[t.value] || 0})
          </button>
        ))}
      </div>

      {loading ? <Loading /> : vehicles.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-16 text-center">
          <p className="text-4xl mb-3">🚗</p>
          <p className="text-slate-400">No vehicles yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {vehicles.map(v => {
            const type = VEHICLE_TYPES.find(t => t.value === v.vehicleType);
            return (
              <div key={v.id} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-start gap-3 mb-3">
                  {v.photos?.[0] ? (
                    <img src={v.photos[0].url} className="w-20 h-16 rounded-xl object-cover shrink-0" alt="" />
                  ) : (
                    <div className="w-20 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-2xl shrink-0">
                      {type?.icon}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-bold truncate">{v.model}</p>
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-semibold">
                        {type?.icon} {type?.label}
                      </span>
                      {v.hasAc && <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-semibold">AC</span>}
                    </div>
                    <p className="text-xs text-slate-500">
                      {v.seats} seats • ৳{v.basePerDay.toLocaleString()}/day • Min {v.minDays} day(s)
                    </p>
                    <p className="text-xs text-slate-400">
                      {v.baseDistrict || "Dhaka"} • {v.districtCharges?.length || 0} district charge(s)
                      {v.registrationNo && ` • ${v.registrationNo}`}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                  <button onClick={() => toggle(v.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                      v.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"
                    }`}>
                    {v.isAvailable ? "Available" : "Unavailable"}
                  </button>

                  <div className="flex items-center gap-3">
                    {v.unavailableDates?.length > 0 && (
                      <span className="text-[11px] text-slate-400">
                        {v.unavailableDates.length} date(s) blocked
                      </span>
                    )}
                    <Link href={`/admin/vehicles/${v.id}/edit`}
                      className="text-green-600 text-sm font-semibold hover:underline">Edit</Link>
                    <button onClick={() => setConfirm({ id: v.id, name: v.model })}
                      className="text-red-500 text-sm font-semibold hover:underline">Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {confirm && <ConfirmModal message={`Delete "${confirm.name}"? All its bookings will be removed too.`} onConfirm={del} onCancel={() => setConfirm(null)} />}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}