"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { bookingsAPI } from "@/lib/api";
import Toast from "@/components/ui/toast";
import Loading from "@/components/ui/loading";
import { useToast } from "@/lib/hooks";
import { Booking, BOOKING_STATUS_INFO } from "@/lib/types";

const STATUS_LIGHT: Record<string, string> = {
  callingSoon: "bg-blue-50 text-blue-700 border-blue-200",
  advancePending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  confirmed: "bg-green-50 text-green-700 border-green-200",
  playerOnTheWay: "bg-cyan-50 text-cyan-700 border-cyan-200",
  completed: "bg-purple-50 text-purple-700 border-purple-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const { toast, showToast } = useToast();

  const load = () => {
    bookingsAPI.getAll()
      .then(r => setBookings(r.data))
      .catch(() => showToast("Could not load bookings", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const shown = filter ? bookings.filter(b => b.status === filter) : bookings;

  if (loading) return <Loading />;

  return (
    <div>
      {/* Status filters */}
      <div className="flex gap-2 overflow-x-auto mb-5 pb-1">
        <button onClick={() => setFilter("")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${filter === "" ? "bg-green-600 text-white" : "bg-white text-slate-600"}`}>
          All ({bookings.length})
        </button>
        {Object.entries(BOOKING_STATUS_INFO).map(([k, i]) => {
          const count = bookings.filter(b => b.status === k).length;
          return (
            <button key={k} onClick={() => setFilter(k)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${filter === k ? "bg-green-600 text-white" : "bg-white text-slate-600"}`}>
              {i.icon} {i.label} {count > 0 && `(${count})`}
            </button>
          );
        })}
      </div>

      {shown.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-16 text-center">
          <p className="text-4xl mb-3">⚽</p>
          <p className="text-slate-400">
            {filter ? "No bookings with this status." : "No bookings yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {shown.map(b => {
            const info = BOOKING_STATUS_INFO[b.status];
            const unpaid = !b.amountPaid || b.amountPaid === 0;
            return (
              <Link key={b.id} href={`/admin/bookings/${b.id}`}
                className="block bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start gap-3 mb-2">
                  <div className="flex items-center gap-3 min-w-0">
                    {b.player?.photo ? (
                      <img src={b.player.photo} className="w-12 h-12 rounded-xl object-cover shrink-0" alt="" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0">⚽</div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate text-slate-800">
                        {b.player?.user?.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {b.hirer?.name} • {b.matchDate}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{b.tournament}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border shrink-0 ${STATUS_LIGHT[b.status]}`}>
                    {info?.icon} {info?.label}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <div className="text-xs text-slate-400">
                    <span>Quoted: <strong className="text-slate-700">৳{Number(b.amount || 0).toLocaleString()}</strong></span>
                    {b.finalAmount ? (
                      <span className="ml-3">Final: <strong className="text-slate-700">৳{b.finalAmount.toLocaleString()}</strong></span>
                    ) : null}
                    {b.amountPaid ? (
                      <span className="ml-3">Paid: <strong className="text-green-600">৳{b.amountPaid.toLocaleString()}</strong></span>
                    ) : null}
                  </div>
                  <span className={`text-xs font-bold shrink-0 ${unpaid ? "text-slate-400" : "text-green-600"}`}>
                    Manage →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}