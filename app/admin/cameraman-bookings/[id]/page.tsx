"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { cameramenAPI } from "@/lib/api";
import Toast from "@/components/ui/toast";
import Loading from "@/components/ui/loading";
import { useToast } from "@/lib/hooks";
import { CameramanBooking, SERVICE_STATUS_INFO } from "@/lib/types";
import PaymentPanel from "@/components/admin/payment-panel";

const STATUS_LIGHT: Record<string, string> = {
  advancePending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  confirmed: "bg-green-50 text-green-700 border-green-200",
  completed: "bg-purple-50 text-purple-700 border-purple-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const FIELD = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-green-500";

export default function AdminCameramanBookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast, showToast } = useToast();

  const [b, setB] = useState<CameramanBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ status: "", finalAmount: "", advanceAmount: "", adminNote: "" });

  const load = () => {
    cameramenAPI.getBooking(id)
      .then(r => {
        const data = r.data as CameramanBooking;
        setB(data);
        setForm({
          status: data.status,
          finalAmount: data.finalAmount ? String(data.finalAmount) : String(data.quotedRate),
          advanceAmount: data.advanceAmount ? String(data.advanceAmount) : "",
          adminNote: data.adminNote || "",
        });
      })
      .catch(() => showToast("Could not load booking", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const save = async () => {
    setSaving(true);
    try {
      await cameramenAPI.updateBooking(id, {
        status: form.status,
        finalAmount: form.finalAmount ? Number(form.finalAmount) : undefined,
        advanceAmount: form.advanceAmount ? Number(form.advanceAmount) : undefined,
        adminNote: form.adminNote,
      });
      showToast("Booking updated");
      load();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  if (!b) return (
    <div className="text-center py-16">
      <p className="text-slate-400 mb-3">Booking not found.</p>
      <Link href="/admin/cameraman-bookings" className="text-green-700 font-semibold text-sm">← Back</Link>
    </div>
  );

  const info = SERVICE_STATUS_INFO[b.status];

  return (
    <div className="max-w-3xl space-y-4">
      <Link href="/admin/cameraman-bookings" className="text-slate-500 hover:text-slate-700 text-sm font-medium">
        ← All cameraman bookings
      </Link>

      {/* Detail */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex justify-between items-start gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            {b.cameraman?.photo ? (
              <img src={b.cameraman.photo} className="w-16 h-16 rounded-xl object-cover shrink-0" alt="" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-purple-50 flex items-center justify-center text-2xl shrink-0">📷</div>
            )}
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-slate-800 truncate">{b.cameraman?.user?.name}</h1>
              <p className="text-sm text-slate-500">Booked by {b.customer?.name}</p>
              <p className="text-xs text-slate-400">{b.customer?.phone || b.customer?.email}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border shrink-0 ${STATUS_LIGHT[b.status]}`}>
            {info?.icon} {info?.label}
          </span>
        </div>

        <div className="bg-slate-50 rounded-lg p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
          <div><p className="text-slate-400">Date</p><p className="font-semibold text-green-700">{b.matchDate}</p></div>
          <div><p className="text-slate-400">Tournament</p><p className="font-semibold truncate">{b.tournament || "—"}</p></div>
          <div><p className="text-slate-400">Location</p><p className="font-semibold truncate">{b.district}</p></div>
          <div><p className="text-slate-400">Duration</p><p className="font-semibold">{b.durationHours}h</p></div>
        </div>

        {b.venue && <p className="text-xs text-slate-500 mb-1">📍 {b.venue}</p>}
        {b.startTime && <p className="text-xs text-slate-500 mb-1">🕐 {b.startTime}</p>}
        {b.message && <p className="text-xs text-slate-500 mb-3">💬 {b.message}</p>}

        <p className="text-xs text-slate-400 mb-4">
          Quoted rate: <strong className="text-slate-700">৳{b.quotedRate.toLocaleString()}</strong>
        </p>

        {/* Edit */}
        <div className="border-t border-slate-100 pt-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={FIELD}>
                {Object.entries(SERVICE_STATUS_INFO).map(([k, i]) => (
                  <option key={k} value={k}>{i.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Final amount (৳)</label>
              <input type="number" value={form.finalAmount}
                onChange={e => setForm({ ...form, finalAmount: e.target.value })} className={FIELD} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Advance agreed (৳)</label>
              <input type="number" value={form.advanceAmount}
                onChange={e => setForm({ ...form, advanceAmount: e.target.value })} className={FIELD} />
            </div>
          </div>
          <textarea value={form.adminNote} onChange={e => setForm({ ...form, adminNote: e.target.value })}
            rows={2} placeholder="Admin notes..." className={FIELD} />
          <div className="flex gap-2 items-center">
            <button onClick={save} disabled={saving}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white px-5 py-2 rounded-xl text-sm font-bold transition">
              {saving ? "Saving..." : "Save changes"}
            </button>
            {b.customer?.phone && (
              <a href={`tel:${b.customer.phone}`} className="bg-slate-100 text-slate-700 px-3 py-2 rounded-lg text-xs font-bold">📞 Customer</a>
            )}
            {b.cameraman?.user?.phone && (
              <a href={`tel:${b.cameraman.user.phone}`} className="bg-purple-50 text-purple-700 px-3 py-2 rounded-lg text-xs font-bold">📞 Cameraman</a>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            Set the final amount before recording payments — commission is calculated from it.
          </p>
        </div>
      </div>

      <PaymentPanel refType="cameramanBooking" refId={id} />

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}