"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import Loading from "@/components/ui/loading";
import { shopAPI, vehiclesAPI, cameramenAPI, teamRequestsAPI, bookingsAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/language-context";
import {
  Order, VehicleBooking, CameramanBooking, TeamRequest, Booking,
  ORDER_STATUS_INFO, SERVICE_STATUS_INFO, TEAM_STATUS_INFO, BOOKING_STATUS_INFO,
} from "@/lib/types";

const tk = (n?: number | null) => `৳${Number(n || 0).toLocaleString()}`;

export default function MyOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const { lang } = useLang();
  const [tab, setTab] = useState("squads");

  const [squads, setSquads] = useState<TeamRequest[]>([]);
  const [players, setPlayers] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [vBookings, setVBookings] = useState<VehicleBooking[]>([]);
  const [cBookings, setCBookings] = useState<CameramanBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.allSettled([
      teamRequestsAPI.getMyRequests(),
      bookingsAPI.getMyBookings(),
      shopAPI.getMyOrders(),
      vehiclesAPI.getMyBookings(),
      cameramenAPI.getMyBookings(),
    ]).then(([s, p, o, v, c]) => {
      // Settled individually so one failing endpoint doesn't blank the page.
      if (s.status === "fulfilled") setSquads(s.value.data);
      if (p.status === "fulfilled") setPlayers(p.value.data);
      if (o.status === "fulfilled") setOrders(o.value.data);
      if (v.status === "fulfilled") setVBookings(v.value.data);
      if (c.status === "fulfilled") setCBookings(c.value.data);
    }).finally(() => setLoading(false));
  }, [user]);

  if (authLoading) return <div className="min-h-screen bg-dark"><Navbar /><div className="pt-24"><Loading /></div></div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-dark text-white">
        <Navbar />
        <div className="max-w-md mx-auto px-4 pt-32 text-center">
          <span className="text-5xl block mb-4">🔐</span>
          <h1 className="text-2xl font-bold mb-3">Login Required</h1>
          <Link href="/auth/login" className="btn-primary text-white px-6 py-3 rounded-xl font-bold inline-block">
            Login
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Money still owed across everything, so the hirer sees one number.
  const dueFrom = (total?: number | null, paid?: number | null) =>
    Math.max(0, Number(total || 0) - Number(paid || 0));

  const totalDue =
    squads.reduce((s, x) => s + dueFrom(x.finalAmount, x.amountPaid), 0) +
    players.reduce((s, x) => s + dueFrom(x.finalAmount ?? x.amount, x.amountPaid), 0) +
    vBookings.reduce((s, x) => s + dueFrom(x.finalAmount ?? x.estimatedAmount, x.amountPaid), 0) +
    cBookings.reduce((s, x) => s + dueFrom(x.finalAmount ?? x.quotedRate, x.amountPaid), 0);

  const tabs = [
    { k: "squads", l: `⚽ Squads (${squads.length})` },
    { k: "players", l: `👤 Players (${players.length})` },
    { k: "cameramen", l: `📷 Cameramen (${cBookings.length})` },
    { k: "vehicles", l: `🚗 Vehicles (${vBookings.length})` },
    { k: "shop", l: `🛍️ Shop (${orders.length})` },
  ];

  return (
    <div className="min-h-screen bg-dark text-white">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">
        <div className="text-center mb-6">
          <span className="text-4xl block mb-2">📦</span>
          <h1 className="text-3xl font-bold gradient-text">My Bookings & Orders</h1>
        </div>

        {/* Outstanding balance */}
        {totalDue > 0 && (
          <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-2xl p-4 mb-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-yellow-400 font-semibold text-sm">Total outstanding</p>
              <p className="text-white/40 text-xs mt-0.5">
                Across all confirmed bookings
              </p>
            </div>
            <span className="text-2xl font-bold text-yellow-400">{tk(totalDue)}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 glass rounded-xl p-1 mb-6 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.k} onClick={() => setTab(t.k)}
              className={`flex-1 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition ${
                tab === t.k ? "bg-primary-600 text-white" : "text-white/50 hover:text-white"
              }`}>
              {t.l}
            </button>
          ))}
        </div>

        {loading ? <Loading /> : (
          <div className="space-y-4">

            {/* ─── SQUAD REQUESTS ─── */}
            {tab === "squads" && (
              squads.length === 0 ? <Empty icon="⚽" text="No squad requests yet" link="/cart" linkText="Build a Squad" /> :
              squads.map(s => {
                const info = TEAM_STATUS_INFO[s.status];
                const due = dueFrom(s.finalAmount, s.amountPaid);
                return (
                  <div key={s.id} className="glass rounded-2xl p-5">
                    <div className="flex justify-between items-start gap-3 mb-3">
                      <div className="min-w-0">
                        <p className="font-bold truncate">{s.tournament || "Team Request"}</p>
                        <p className="text-white/40 text-xs mt-0.5">
                          {s.matchDate}{s.location ? ` • ${s.location}` : ""}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border shrink-0 ${info?.bg} ${info?.color}`}>
                        {info?.icon} {lang === "bn" ? info?.labelBn : info?.label}
                      </span>
                    </div>

                    <div className={`rounded-xl p-3 border mb-3 ${info?.bg}`}>
                      <p className="text-[11px] text-white/50">{info?.desc}</p>
                    </div>

                    {/* Squad list */}
                    <div className="space-y-1.5 mb-3">
                      {(s.squad || []).map((p, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span className="w-8 h-6 rounded bg-red-600/80 flex items-center justify-center text-[9px] font-bold shrink-0">
                            {p.positionKey}
                          </span>
                          <span className="flex-1 truncate text-white/70">{p.playerName}</span>
                          {p.amount ? (
                            <span className="text-white/50 text-xs">{tk(p.amount)}</span>
                          ) : (
                            <span className="text-white/20 text-[10px]">price pending</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {s.finalAmount ? (
                      <Money total={s.finalAmount} paid={s.amountPaid} due={due} />
                    ) : (
                      <p className="text-[11px] text-white/30 bg-dark-card rounded-xl p-3 border border-dark-border">
                        We'll confirm pricing by phone shortly.
                      </p>
                    )}
                  </div>
                );
              })
            )}

            {/* ─── PLAYER BOOKINGS ─── */}
            {tab === "players" && (
              players.length === 0 ? <Empty icon="👤" text="No player bookings" link="/players?playerType=player" linkText="Browse Players" /> :
              players.map(b => {
                const info = BOOKING_STATUS_INFO[b.status];
                const total = b.finalAmount ?? b.amount;
                const due = dueFrom(total, b.amountPaid);
                return (
                  <div key={b.id} className="glass rounded-2xl p-5">
                    <div className="flex justify-between items-start gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {b.player?.photo ? (
                          <img src={b.player.photo} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center text-2xl shrink-0">⚽</div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold truncate">{b.player?.user?.name}</p>
                          <p className="text-white/40 text-xs">{b.player?.position} • {b.matchDate}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border shrink-0 ${info?.bg} ${info?.color}`}>
                        {info?.icon} {lang === "bn" ? info?.labelBn : info?.label}
                      </span>
                    </div>

                    <div className={`rounded-xl p-3 border mb-3 ${info?.bg}`}>
                      <p className="text-[11px] text-white/50">{info?.desc}</p>
                    </div>

                    <Money total={total} paid={b.amountPaid} due={due} />
                  </div>
                );
              })
            )}

            {/* ─── CAMERAMAN BOOKINGS ─── */}
            {tab === "cameramen" && (
              cBookings.length === 0 ? <Empty icon="📷" text="No cameraman bookings" link="/cameramen" linkText="Browse Cameramen" /> :
              cBookings.map(b => {
                const info = SERVICE_STATUS_INFO[b.status];
                const total = b.finalAmount ?? b.quotedRate;
                return (
                  <div key={b.id} className="glass rounded-2xl p-5">
                    <div className="flex justify-between items-start gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {b.cameraman?.photo ? (
                          <img src={b.cameraman.photo} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-purple-900 flex items-center justify-center text-2xl shrink-0">📷</div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold truncate">{b.cameraman?.user?.name}</p>
                          <p className="text-white/40 text-xs">{b.tournament || "Match coverage"}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border shrink-0 ${info?.bg} ${info?.color}`}>
                        {info?.icon} {lang === "bn" ? info?.labelBn : info?.label}
                      </span>
                    </div>

                    <div className="bg-dark-card rounded-xl p-3 border border-dark-border space-y-1.5 text-xs mb-3">
                      <Row label="Date" value={b.matchDate} />
                      <Row label="Location" value={`${b.upazila ? `${b.upazila}, ` : ""}${b.district}`} />
                      {b.venue && <Row label="Venue" value={b.venue} />}
                      <Row label="Duration" value={`${b.durationHours} hours`} />
                    </div>

                    <Money total={total} paid={b.amountPaid} due={dueFrom(total, b.amountPaid)} />
                  </div>
                );
              })
            )}

            {/* ─── VEHICLE BOOKINGS ─── */}
            {tab === "vehicles" && (
              vBookings.length === 0 ? <Empty icon="🚗" text="No vehicle bookings" link="/vehicles" linkText="Browse Vehicles" /> :
              vBookings.map(b => {
                const info = SERVICE_STATUS_INFO[b.status];
                const total = b.finalAmount ?? b.estimatedAmount;
                return (
                  <div key={b.id} className="glass rounded-2xl p-5">
                    <div className="flex justify-between items-start gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {b.vehicle?.photos?.[0] ? (
                          <img src={b.vehicle.photos[0].url} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center text-2xl shrink-0">🚗</div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold truncate">{b.vehicle?.model}</p>
                          <p className="text-white/40 text-xs">{b.vehicle?.seats} seats • {b.days} day{b.days > 1 ? "s" : ""}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border shrink-0 ${info?.bg} ${info?.color}`}>
                        {info?.icon} {lang === "bn" ? info?.labelBn : info?.label}
                      </span>
                    </div>

                    <div className="bg-dark-card rounded-xl p-3 border border-dark-border space-y-1.5 text-xs mb-3">
                      <Row label="Start" value={b.startDate} />
                      <Row label="Destination" value={`${b.upazila ? `${b.upazila}, ` : ""}${b.district}`} />
                    </div>

                    <Money total={total} paid={b.amountPaid} due={dueFrom(total, b.amountPaid)} />
                  </div>
                );
              })
            )}

            {/* ─── SHOP ORDERS ─── */}
            {tab === "shop" && (
              orders.length === 0 ? <Empty icon="🛍️" text="No orders yet" link="/shop" linkText="Browse Shop" /> :
              orders.map(o => {
                const info = ORDER_STATUS_INFO[o.status];
                return (
                  <div key={o.id} className="glass rounded-2xl p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-mono text-xs text-white/30">#{o.orderNo}</p>
                        <p className="text-white/40 text-xs">{new Date(o.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${info?.bg} ${info?.color}`}>
                        {info?.icon} {lang === "bn" ? info?.labelBn : info?.label}
                      </span>
                    </div>

                    <div className={`rounded-xl p-3 border mb-3 ${info?.bg}`}>
                      <p className="text-[11px] text-white/50">{info?.desc}</p>
                    </div>

                    <div className="space-y-2 mb-3">
                      {o.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm">
                          {item.photo ? (
                            <img src={item.photo} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">🛍️</div>
                          )}
                          <span className="flex-1 truncate text-white/70">{item.productName}</span>
                          <span className="text-white/40 text-xs">×{item.quantity}</span>
                          <span className="font-semibold text-sm">{tk(item.subtotal)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-dark-card rounded-xl p-3 border border-dark-border space-y-1 text-sm">
                      <div className="flex justify-between"><span className="text-white/40">Subtotal</span><span>{tk(o.subtotal)}</span></div>
                      <div className="flex justify-between"><span className="text-white/40">Delivery</span><span>৳{o.deliveryCharge}</span></div>
                      <div className="flex justify-between pt-2 border-t border-dark-border">
                        <span className="font-semibold">Total</span>
                        <span className="text-primary-400 font-bold">{tk(o.total)}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-white/30 mt-3">
                      📍 {o.address}, {o.upazila ? `${o.upazila}, ` : ""}{o.district}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

/** Agreed price, what's been paid, what's left. */
function Money({ total, paid, due }: { total?: number | null; paid?: number | null; due: number }) {
  return (
    <div className="bg-dark-card rounded-xl p-3 border border-dark-border space-y-1.5 text-sm">
      <div className="flex justify-between">
        <span className="text-white/40">Agreed total</span>
        <span className="font-semibold">{tk(total)}</span>
      </div>
      {Number(paid || 0) > 0 && (
        <div className="flex justify-between">
          <span className="text-white/40">Paid</span>
          <span className="text-primary-400 font-semibold">{tk(paid)}</span>
        </div>
      )}
      <div className="flex justify-between pt-2 border-t border-dark-border">
        <span className="font-semibold">{due > 0 ? "Still due" : "Settled"}</span>
        <span className={`font-bold ${due > 0 ? "text-yellow-400" : "text-primary-400"}`}>
          {due > 0 ? tk(due) : "✓"}
        </span>
      </div>
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

function Empty({ icon, text, link, linkText }: { icon: string; text: string; link: string; linkText: string }) {
  return (
    <div className="glass rounded-2xl p-12 text-center">
      <span className="text-5xl block mb-4">{icon}</span>
      <p className="text-white/40 mb-6">{text}</p>
      <Link href={link} className="btn-primary text-white px-6 py-3 rounded-xl font-bold inline-block">
        {linkText}
      </Link>
    </div>
  );
}