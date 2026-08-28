"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { bookingsAPI } from "@/lib/api";
import Toast from "@/components/ui/toast";
import Loading from "@/components/ui/loading";
import { useToast } from "@/lib/hooks";
import { Booking, BOOKING_STATUS_INFO } from "@/lib/types";
import PaymentPanel from "@/components/admin/payment-panel";

const FIELD = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500";
const LABEL = "block text-xs font-semibold text-slate-600 mb-1";

const STATUS_LIGHT: Record<string, string> = {
  callingSoon: "bg-blue-50 text-blue-700 border-blue-200",
  advancePending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  confirmed: "bg-green-50 text-green-700 border-green-200",
  playerOnTheWay: "bg-cyan-50 text-cyan-700 border-cyan-200",
  completed: "bg-purple-50 text-purple-700 border-purple-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export default function AdminBookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast, showToast } = useToast();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ status: "", finalAmount: "", advanceAmount: "", adminNote: "" });

  const load = () => {
    bookingsAPI.getOne(id)
      .then(r => {
        const b = r.data as Booking;
        setBooking(b);
        setForm({
          status: b.status,
          finalAmount: b.finalAmount ? String(b.finalAmount) : String(b.amount || ""),
          advanceAmount: b.advanceAmount ? String(b.advanceAmount) : "",
          adminNote: b.adminNote || "",
        });
      })
      .catch(() => showToast("Could not load booking", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const save = async () => {
    setSaving(true);
    try {
      await bookingsAPI.update(id, {
        status: form.status,
        finalAmount: form.finalAmount ? Number(form.finalAmount) : undefined,
        advanceAmount: form.advanceAmount ? Number(form.advanceAmount) : undefined,
        adminNote: form.adminNote,
      });
      showToast("Booking updated");
      load();
    } catch (err: any) {
      const m = err.response?.data?.message;
      showToast(Array.isArray(m) ? m[0] : (m || "Failed"), "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  if (!booking) return (
    <div className="text-center py-16">
      <p className="text-slate-400 mb-3">Booking not found.</p>
      <Link href="/admin/bookings" className="text-green-700 font-semibold text-sm">
        ← Back to bookings
      </Link>
    </div>
  );

  const info = BOOKING_STATUS_INFO[booking.status];

  const payees = booking.player ? [{
    id: booking.player.id,
    name: booking.player.user?.name || "Player",
  }] : [];

  return (
    <div className="max-w-3xl space-y-4">
      <Link href="/admin/bookings" className="text-slate-500 hover:text-slate-700 text-sm font-medium">
        ← All bookings
      </Link>

      {/* Detail */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex justify-between items-start gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            {booking.player?.photo ? (
              <img src={booking.player.photo} className="w-16 h-16 rounded-xl object-cover shrink-0" alt="" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-green-50 flex items-center justify-center text-2xl shrink-0">⚽</div>
            )}
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-slate-800 truncate">
                {booking.player?.user?.name}
              </h1>
              <p className="text-sm text-slate-500">
                Booked by {booking.hirer?.name}
              </p>
              <p className="text-xs text-slate-400">
                {booking.hirer?.phone || booking.hirer?.email}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border shrink-0 ${STATUS_LIGHT[booking.status]}`}>
            {info?.icon} {info?.label}
          </span>
        </div>

        <div className="bg-slate-50 rounded-lg p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
          <div><p className="text-slate-400">Match date</p><p className="font-semibold text-green-700">{booking.matchDate}</p></div>
          <div><p className="text-slate-400">Tournament</p><p className="font-semibold truncate">{booking.tournament || "—"}</p></div>
          <div><p className="text-slate-400">Position</p><p className="font-semibold">{booking.player?.position || "—"}</p></div>
          <div><p className="text-slate-400">Quoted</p><p className="font-semibold">৳{Number(booking.amount || 0).toLocaleString()}</p></div>
        </div>

        {booking.message && (
          <p className="text-xs text-slate-500 mb-3">💬 {booking.message}</p>
        )}

        {/* Edit */}
        <div className="border-t border-slate-100 pt-4 space-y-3">
          <div>
            <label className={LABEL}>Status</label>
            <select value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })} className={FIELD}>
              {Object.entries(BOOKING_STATUS_INFO).map(([k, i]) => (
                <option key={k} value={k}>{i.icon} {i.label}</option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              {BOOKING_STATUS_INFO[form.status]?.desc}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Final amount (৳)</label>
              <input type="number" value={form.finalAmount}
                onChange={e => setForm({ ...form, finalAmount: e.target.value })} className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Advance agreed (৳)</label>
              <input type="number" value={form.advanceAmount}
                onChange={e => setForm({ ...form, advanceAmount: e.target.value })} className={FIELD} />
            </div>
          </div>

          <div>
            <label className={LABEL}>Internal admin notes</label>
            <textarea value={form.adminNote}
              onChange={e => setForm({ ...form, adminNote: e.target.value })}
              rows={3} placeholder="Call notes, negotiated terms, follow-ups..." className={FIELD} />
          </div>

          <div className="flex gap-2 items-center">
            <button onClick={save} disabled={saving}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white px-5 py-2 rounded-xl text-sm font-bold transition">
              {saving ? "Saving..." : "Save changes"}
            </button>
            {booking.hirer?.phone && (
              <a href={`tel:${booking.hirer.phone}`}
                className="bg-slate-100 text-slate-700 px-3 py-2 rounded-lg text-xs font-bold">📞 Hirer</a>
            )}
            {booking.player?.user?.phone && (
              <a href={`tel:${booking.player.user.phone}`}
                className="bg-green-50 text-green-700 px-3 py-2 rounded-lg text-xs font-bold">📞 Player</a>
            )}
          </div>

          <p className="text-[11px] text-slate-400">
            Changing to Confirmed, On The Way, Completed or Cancelled emails the hirer automatically.
          </p>
        </div>
      </div>

      <PaymentPanel refType="booking" refId={id} payees={payees} />

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}