"use client";

import { useEffect, useState } from "react";
import { cameramenAPI } from "@/lib/api";
import Toast from "@/components/ui/toast";
import Loading from "@/components/ui/loading";
import { useToast } from "@/lib/hooks";
import { CameramanBooking, SERVICE_STATUS_INFO } from "@/lib/types";

const STATUS_LIGHT: Record<string, string> = {
  advancePending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  confirmed: "bg-green-50 text-green-700 border-green-200",
  completed: "bg-purple-50 text-purple-700 border-purple-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export default function AdminCameramanBookingsPage() {
  const [bookings, setBookings] = useState<CameramanBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ status: "", finalAmount: "", advanceAmount: "", adminNote: "" });
  const { toast, showToast } = useToast();

  const load = () => {
    setLoading(true);
    cameramenAPI.getAllBookings(filter ? { status: filter } : undefined)
      .then(r => setBookings(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const startEdit = (b: CameramanBooking) => {
    setEditing(b.id);
    setForm({
      status: b.status,
      finalAmount: b.finalAmount ? String(b.finalAmount) : String(b.quotedRate),
      advanceAmount: b.advanceAmount ? String(b.advanceAmount) : "",
      adminNote: b.adminNote || "",
    });
  };

  const save = async (id: string) => {
    try {
      await cameramenAPI.updateBooking(id, {
        status: form.status,
        finalAmount: form.finalAmount ? Number(form.finalAmount) : undefined,
        advanceAmount: form.advanceAmount ? Number(form.advanceAmount) : undefined,
        adminNote: form.adminNote,
      });
      showToast("Booking updated");
      setEditing(null); load();
    } catch (err: any) { showToast(err.response?.data?.message || "Failed", "error"); }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto mb-5 pb-1">
        <button onClick={() => setFilter("")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${filter === "" ? "bg-green-600 text-white" : "bg-white text-slate-600"}`}>
          All ({bookings.length})
        </button>
        {Object.entries(SERVICE_STATUS_INFO).map(([k, i]) => (
          <button key={k} onClick={() => setFilter(k)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${filter === k ? "bg-green-600 text-white" : "bg-white text-slate-600"}`}>
            {i.icon} {i.label}
          </button>
        ))}
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-16 text-center">
          <p className="text-4xl mb-3">📷</p>
          <p className="text-slate-400">No cameraman bookings.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map(b => {
            const info = SERVICE_STATUS_INFO[b.status];
            const isEditing = editing === b.id;
            return (
              <div key={b.id} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex justify-between items-start gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {b.cameraman?.photo ? (
                      <img src={b.cameraman.photo} className="w-14 h-14 rounded-xl object-cover shrink-0" alt="" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-purple-50 flex items-center justify-center text-xl shrink-0">📷</div>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold truncate">{b.cameraman?.user?.name}</p>
                      <p className="text-xs text-slate-500">Booked by {b.customer?.name}</p>
                      <p className="text-xs text-slate-400">{b.customer?.phone || b.customer?.email}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border shrink-0 ${STATUS_LIGHT[b.status]}`}>
                    {info?.icon} {info?.label}
                  </span>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 mb-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div><p className="text-slate-400">Date</p><p className="font-semibold text-green-700">{b.matchDate}</p></div>
                  <div><p className="text-slate-400">Tournament</p><p className="font-semibold truncate">{b.tournament || "—"}</p></div>
                  <div><p className="text-slate-400">Location</p><p className="font-semibold truncate">{b.district}</p></div>
                  <div><p className="text-slate-400">Duration</p><p className="font-semibold">{b.durationHours}h</p></div>
                </div>

                {b.venue && <p className="text-xs text-slate-500 mb-1">📍 {b.venue}</p>}
                {b.startTime && <p className="text-xs text-slate-500 mb-1">🕐 {b.startTime}</p>}
                {b.message && <p className="text-xs text-slate-500 mb-3">💬 {b.message}</p>}

                {isEditing ? (
                  <div className="border-t pt-3 space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                        className="px-2 py-2 border rounded-lg text-sm">
                        {Object.entries(SERVICE_STATUS_INFO).map(([k, i]) => (
                          <option key={k} value={k}>{i.label}</option>
                        ))}
                      </select>
                      <input type="number" value={form.finalAmount} onChange={e => setForm({ ...form, finalAmount: e.target.value })}
                        placeholder="Final ৳" className="px-2 py-2 border rounded-lg text-sm" />
                      <input type="number" value={form.advanceAmount} onChange={e => setForm({ ...form, advanceAmount: e.target.value })}
                        placeholder="Advance ৳" className="px-2 py-2 border rounded-lg text-sm" />
                    </div>
                    <textarea value={form.adminNote} onChange={e => setForm({ ...form, adminNote: e.target.value })}
                      rows={2} placeholder="Notes..." className="w-full px-3 py-2 border rounded-lg text-sm" />
                    <div className="flex gap-2">
                      <button onClick={() => save(b.id)} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Save</button>
                      <button onClick={() => setEditing(null)} className="text-slate-500 px-4 py-2 text-sm">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                    <div className="text-xs text-slate-400">
                      Quoted: <strong className="text-slate-700">৳{b.quotedRate.toLocaleString()}</strong>
                      {b.finalAmount && <span className="ml-3">Final: <strong className="text-slate-700">৳{b.finalAmount.toLocaleString()}</strong></span>}
                      {b.advanceAmount && <span className="ml-3">Advance: <strong className="text-green-600">৳{b.advanceAmount.toLocaleString()}</strong></span>}
                    </div>
                    <div className="flex gap-2">
                      {b.customer?.phone && (
                        <a href={`tel:${b.customer.phone}`} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold">📞 Customer</a>
                      )}
                      {b.cameraman?.user?.phone && (
                        <a href={`tel:${b.cameraman.user.phone}`} className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg text-xs font-bold">📞 Cameraman</a>
                      )}
                      <button onClick={() => startEdit(b)} className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold">Update</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}