"use client";

import { useEffect, useState } from "react";
import { bookingsAPI } from "@/lib/api";
import StatusPill from "@/components/ui/status-pill";
import Toast from "@/components/ui/toast";
import Loading from "@/components/ui/loading";
import { useToast } from "@/lib/hooks";
import { Booking } from "@/lib/types";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast, showToast } = useToast();

  const fetch = () => { bookingsAPI.getAll().then(r => setBookings(r.data)).finally(() => setLoading(false)); };
  useEffect(() => { fetch(); }, []);

  const action = async (id: string, act: "confirm" | "cancel" | "complete") => {
    try {
      if (act === "confirm") await bookingsAPI.confirm(id);
      else if (act === "cancel") await bookingsAPI.cancel(id);
      else await bookingsAPI.complete(id);
      showToast(`Booking ${act}ed`); fetch();
    } catch (err: any) { showToast(err.response?.data?.message || "Failed", "error"); }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-3">
      {bookings.length === 0 ? <p className="text-center py-16 text-slate-400">No bookings yet.</p> :
        bookings.map(b => (
          <div key={b.id} className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-sm">{b.player?.user?.name}</p>
                <p className="text-xs text-slate-500">{b.hirer?.name} • {b.matchDate}</p>
                <p className="text-xs text-slate-400">{b.tournament}</p>
              </div>
              <StatusPill status={b.status} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">{b.matchType || "Match"}</span>
              <div className="flex gap-2">
                {b.status === "pending" && <>
                  <button onClick={() => action(b.id, "confirm")} className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold">✓ Confirm</button>
                  <button onClick={() => action(b.id, "cancel")} className="bg-red-100 text-red-500 px-3 py-1.5 rounded-lg text-xs font-bold">✕ Cancel</button>
                </>}
                {b.status === "confirmed" && <button onClick={() => action(b.id, "complete")} className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold">Complete</button>}
              </div>
            </div>
          </div>
        ))
      }
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}