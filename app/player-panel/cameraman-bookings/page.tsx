"use client";

import { useEffect, useState } from "react";
import { cameramenAPI } from "@/lib/api";
import Loading from "@/components/ui/loading";
import { useLang } from "@/lib/language-context";
import { CameramanBooking, SERVICE_STATUS_INFO } from "@/lib/types";

export default function CameramanBookingsPage() {
  const { lang } = useLang();
  const [bookings, setBookings] = useState<CameramanBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cameramenAPI.getReceivedBookings()
      .then(r => setBookings(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  const upcoming = bookings.filter(b => ["advancePending", "confirmed"].includes(b.status));

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-4">
        <h2 className="font-bold text-white">📷 Booking Requests ({bookings.length})</h2>
        <p className="text-xs text-white/40 mt-1">Matches you've been booked for</p>
      </div>

      {upcoming.length > 0 && (
        <div className="bg-primary-900/20 border border-primary-800 rounded-2xl p-4">
          <p className="text-primary-400 font-bold text-sm mb-1">
            ⚡ {upcoming.length} upcoming shoot{upcoming.length > 1 ? "s" : ""}
          </p>
          <p className="text-white/50 text-xs">Keep these dates free and your gear ready.</p>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center">
          <p className="text-4xl mb-3">📷</p>
          <p className="text-white/30 text-sm">No bookings yet.</p>
          <p className="text-white/20 text-xs mt-1">
            Complete your profile and portfolio to get discovered.
          </p>
        </div>
      ) : (
        bookings.map(b => {
          const info = SERVICE_STATUS_INFO[b.status];
          return (
            <div key={b.id} className="glass rounded-2xl p-4">
              <div className="flex justify-between items-start gap-3 mb-3">
                <div className="min-w-0">
                  <p className="font-bold text-white truncate">{b.customer?.name}</p>
                  <p className="text-xs text-white/40">{b.tournament || "Match coverage"}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border shrink-0 ${info?.bg} ${info?.color}`}>
                  {info?.icon} {lang === "bn" ? info?.labelBn : info?.label}
                </span>
              </div>

              <div className={`rounded-xl p-3 border mb-3 ${info?.bg}`}>
                <p className="text-[11px] text-white/50">{info?.desc}</p>
              </div>

              <div className="bg-dark-card rounded-xl p-3 border border-dark-border space-y-1.5 text-xs">
                <Row label="📅 Date" value={b.matchDate} highlight />
                <Row label="📍 Location" value={`${b.upazila ? `${b.upazila}, ` : ""}${b.district}`} />
                {b.venue && <Row label="🏟️ Venue" value={b.venue} />}
                {b.startTime && <Row label="🕐 Start" value={b.startTime} />}
                <Row label="⏱️ Duration" value={`${b.durationHours} hours`} />
                <Row label="💰 Quoted" value={`৳${b.quotedRate.toLocaleString()}`} highlight />
                {b.finalAmount && <Row label="✓ Final" value={`৳${b.finalAmount.toLocaleString()}`} highlight />}
              </div>

              {b.message && (
                <div className="mt-3 p-3 bg-dark-card rounded-xl border border-dark-border">
                  <p className="text-[10px] text-white/30 mb-1">Client note</p>
                  <p className="text-xs text-white/60">{b.message}</p>
                </div>
              )}

              {/* Contact when confirmed */}
              {b.status === "confirmed" && b.customer?.phone && (
                <a href={`tel:${b.customer.phone}`}
                  className="mt-3 block w-full btn-primary text-white text-center py-2.5 rounded-xl font-bold text-sm">
                  📞 Call {b.customer.name}
                </a>
              )}

              <p className="text-[10px] text-white/20 mt-2">
                Requested {new Date(b.createdAt).toLocaleDateString()}
              </p>
            </div>
          );
        })
      )}
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-white/30 shrink-0">{label}</span>
      <span className={`text-right ${highlight ? "text-primary-400 font-bold" : "text-white/70"}`}>{value}</span>
    </div>
  );
}