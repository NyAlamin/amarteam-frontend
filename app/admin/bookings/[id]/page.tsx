"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { bookingsAPI } from "@/lib/api";
import StatusPill from "@/components/ui/status-pill";
import Toast from "@/components/ui/toast";
import Loading from "@/components/ui/loading";
import { useToast } from "@/lib/hooks";
import { Booking } from "@/lib/types";
import PaymentPanel from "@/components/admin/payment-panel";

export default function AdminBookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast, showToast } = useToast();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  // No single-booking endpoint yet, so pull the list and pick this one.
  const load = () => {
    bookingsAPI.getAll()
      .then(r => setBooking((r.data as Booking[]).find(b => b.id === id) || null))
      .catch(() => showToast("Could not load booking", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const action = async (act: "confirm" | "cancel" | "complete") => {
    try {
      if (act === "confirm") await bookingsAPI.confirm(id);
      else if (act === "cancel") await bookingsAPI.cancel(id);
      else await bookingsAPI.complete(id);
      showToast(`Booking ${act}ed`);
      load();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed", "error");
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

  return (
    <div className="max-w-3xl space-y-4">
      <Link href="/admin/bookings" className="text-slate-500 hover:text-slate-700 text-sm font-medium">
        ← All bookings
      </Link>

      {/* Detail */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              {booking.player?.user?.name}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Booked by {booking.hirer?.name}
            </p>
          </div>
          <StatusPill status={booking.status} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4 border-y border-slate-100">
          <Field label="Match date" value={booking.matchDate} />
          <Field label="Tournament" value={booking.tournament} />
          <Field label="Quoted amount" value={`৳${Number(booking.amount || 0).toLocaleString()}`} />
          <Field label="Hirer phone" value={booking.hirer?.phone} />
          <Field label="Hirer email" value={booking.hirer?.email} />
          <Field label="Position" value={booking.player?.position} />
        </div>

        {booking.message && (
          <div className="pt-4">
            <p className="text-[11px] text-slate-500 mb-1">Message from hirer</p>
            <p className="text-sm text-slate-700">{booking.message}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          {booking.status === "pending" && (
            <>
              <button onClick={() => action("confirm")}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition">
                ✓ Confirm
              </button>
              <button onClick={() => action("cancel")}
                className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-xl text-sm font-bold transition">
                ✕ Cancel
              </button>
            </>
          )}
          {booking.status === "confirmed" && (
            <button onClick={() => action("complete")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition">
              Mark complete
            </button>
          )}
        </div>
      </div>

      <PaymentPanel refType="booking" refId={id} />

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[11px] text-slate-500 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-slate-800">{value || "—"}</p>
    </div>
  );
}