"use client";

import { useEffect, useState } from "react";
import { bookingsAPI } from "@/lib/api";
import Loading from "@/components/ui/loading";
import { Booking, BOOKING_STATUS_INFO } from "@/lib/types";

const matchTypeLabel: Record<string, { label: string; icon: string }> = {
  friendly: { label: "Friendly", icon: "🤝" },
  groupRound: { label: "Group Round", icon: "🏅" },
  final: { label: "Final", icon: "🏆" },
};

export default function PlayerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingsAPI.getPlayerBookings()
      .then(r => setBookings(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="space-y-3">
      <div className="glass rounded-2xl p-4">
        <h2 className="font-bold text-white">📋 My Bookings ({bookings.length})</h2>
        <p className="text-xs text-white/40 mt-1">Hire requests from clubs and teams</p>
      </div>

      {bookings.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-white/30 text-sm">No bookings yet.</p>
          <p className="text-white/20 text-xs mt-1">Requests will appear here when hirers book you.</p>
        </div>
      ) : (
        bookings.map(b => {
          const mt = matchTypeLabel[(b as any).matchType] || { label: "Match", icon: "⚽" };
          const info = BOOKING_STATUS_INFO[b.status];
          return (
            <div key={b.id} className="glass rounded-2xl p-4">
              <div className="flex justify-between items-start gap-3 mb-3">
                <div className="min-w-0">
                  <p className="font-bold text-sm text-white truncate">{b.hirer?.name}</p>
                  <p className="text-xs text-white/40">{b.hirer?.phone || b.hirer?.email}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0 ${info?.bg} ${info?.color}`}>
                  {info?.icon} {info?.label}
                </span>
              </div>

              <div className="bg-dark-card rounded-xl p-3 space-y-1.5 border border-dark-border">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-white/30 w-20 shrink-0">Date:</span>
                  <span className="text-primary-400 font-semibold">{b.matchDate}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-white/30 w-20 shrink-0">Tournament:</span>
                  <span className="text-white/70">{b.tournament}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-white/30 w-20 shrink-0">Type:</span>
                  <span className="bg-dark px-2 py-0.5 rounded text-[10px] font-semibold border border-dark-border">
                    {mt.icon} {mt.label}
                  </span>
                </div>
                {b.message && (
                  <div className="flex items-start gap-2 text-xs pt-2 border-t border-dark-border mt-2">
                    <span className="text-white/30 w-20 shrink-0">Note:</span>
                    <span className="text-white/60 whitespace-pre-line">{b.message}</span>
                  </div>
                )}
              </div>

              {/* Fee — only once the hirer's money has landed */}
              {b.paymentStatus && b.paymentStatus !== "unpaid" && (
                <div className="mt-2 bg-primary-900/20 border border-primary-800/40 rounded-xl p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-white/50">Your fee for this match</span>
                    <span className="font-bold text-primary-400 text-sm">
                      ৳{Number((b.finalAmount ?? b.amount ?? 0) - (b.commissionAmount ?? 0)).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[10px] text-white/30 mt-1">
                    Full breakdown in Earnings
                  </p>
                </div>
              )}

              <p className="text-[10px] text-white/20 mt-2">
                Received: {new Date(b.createdAt).toLocaleDateString()}
              </p>
            </div>
          );
        })
      )}
    </div>
  );
}