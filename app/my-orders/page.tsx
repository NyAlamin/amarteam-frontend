"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import Loading from "@/components/ui/loading";
import Toast from "@/components/ui/toast";
import { useToast } from "@/lib/hooks";
import {
  shopAPI, vehiclesAPI, cameramenAPI, teamRequestsAPI, bookingsAPI,
  paymentsAPI, settingsAPI,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/language-context";
import {
  Order, VehicleBooking, CameramanBooking, TeamRequest, Booking,
  ORDER_STATUS_INFO, SERVICE_STATUS_INFO, TEAM_STATUS_INFO, BOOKING_STATUS_INFO,
} from "@/lib/types";

const tk = (n?: number | null) => `৳${Number(n || 0).toLocaleString()}`;

/** One payable thing, normalised across all five booking types. */
type Payable = {
  refType: "teamRequest" | "booking" | "cameramanBooking" | "vehicleBooking" | "order";
  refId: string;
  label: string;
  total: number;
  paid: number;
  due: number;
  minDue: number;
  payable: boolean;
};

export default function MyOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const { lang } = useLang();
  const { toast, showToast } = useToast();
  const [tab, setTab] = useState("squads");

  const [squads, setSquads] = useState<TeamRequest[]>([]);
  const [players, setPlayers] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [vBookings, setVBookings] = useState<VehicleBooking[]>([]);
  const [cBookings, setCBookings] = useState<CameramanBooking[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [rates, setRates] = useState<Record<string, number>>({});
  const [bkash, setBkash] = useState("");
  const [nagad, setNagad] = useState("");
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState<Record<string, number>>({});
  const [payOpen, setPayOpen] = useState(false);

  const load = () => {
    Promise.allSettled([
      teamRequestsAPI.getMyRequests(),
      bookingsAPI.getMyBookings(),
      shopAPI.getMyOrders(),
      vehiclesAPI.getMyBookings(),
      cameramenAPI.getMyBookings(),
      paymentsAPI.myClaims(),
      settingsAPI.getAll(),
    ]).then(([s, p, o, v, c, cl, st]) => {
      if (s.status === "fulfilled") setSquads(s.value.data);
      if (p.status === "fulfilled") setPlayers(p.value.data);
      if (o.status === "fulfilled") setOrders(o.value.data);
      if (v.status === "fulfilled") setVBookings(v.value.data);
      if (c.status === "fulfilled") setCBookings(c.value.data);
      if (cl.status === "fulfilled") setClaims(cl.value.data);
      if (st.status === "fulfilled") {
        const g = (k: string) => st.value.data?.[k]?.value ?? "";
        setBkash(g("payment.bkashNumber"));
        setNagad(g("payment.nagadNumber"));
        setRates({
          talent: Number(g("advance.talent")) || 30,
          cameraman: Number(g("advance.cameraman")) || 100,
          vehicle: Number(g("advance.vehicle")) || 30,
          order: Number(g("advance.order")) || 100,
        });
      }
    }).finally(() => setLoading(false));
  };

  useEffect(() => { if (user) load(); }, [user]);

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

  const dueFrom = (total?: number | null, paid?: number | null) =>
    Math.max(0, Number(total || 0) - Number(paid || 0));

  /** Payment only opens once admin has moved it past the calling stage. */
  const isPayable = (status: string) =>
    ["advancePending", "confirmed", "playerOnTheWay"].includes(status);

  const key = (p: { refType: string; refId: string }) => `${p.refType}:${p.refId}`;

  // Build the unified payable list
  const payables: Payable[] = [
    ...squads.filter(s => isPayable(s.status) && s.finalAmount).map(s => {
      const total = s.finalAmount!;
      const paid = s.amountPaid || 0;
      const due = dueFrom(total, paid);
      return {
        refType: "teamRequest" as const, refId: s.id,
        label: `Squad — ${s.tournament || s.matchDate || "match"}`,
        total, paid, due,
        minDue: Math.min(due, Math.max(0, Math.round(total * (rates.talent ?? 30) / 100) - paid)),
        payable: due > 0,
      };
    }),
    ...players.filter(b => isPayable(b.status)).map(b => {
      const total = b.finalAmount ?? b.amount;
      const paid = b.amountPaid || 0;
      const due = dueFrom(total, paid);
      return {
        refType: "booking" as const, refId: b.id,
        label: `${b.player?.user?.name || "Player"} — ${b.matchDate}`,
        total, paid, due,
        minDue: Math.min(due, Math.max(0, Math.round(total * (rates.talent ?? 30) / 100) - paid)),
        payable: due > 0,
      };
    }),
    ...cBookings.filter(b => isPayable(b.status)).map(b => {
      const total = b.finalAmount ?? b.quotedRate;
      const paid = b.amountPaid || 0;
      const due = dueFrom(total, paid);
      return {
        refType: "cameramanBooking" as const, refId: b.id,
        label: `Cameraman — ${b.cameraman?.user?.name || b.matchDate}`,
        total, paid, due,
        minDue: Math.min(due, Math.max(0, Math.round(total * (rates.cameraman ?? 100) / 100) - paid)),
        payable: due > 0,
      };
    }),
    ...vBookings.filter(b => isPayable(b.status)).map(b => {
      const total = b.finalAmount ?? b.estimatedAmount;
      const paid = b.amountPaid || 0;
      const due = dueFrom(total, paid);
      return {
        refType: "vehicleBooking" as const, refId: b.id,
        label: `Vehicle — ${b.vehicle?.model || b.startDate}`,
        total, paid, due,
        minDue: Math.min(due, Math.max(0, Math.round(total * (rates.vehicle ?? 30) / 100) - paid)),
        payable: due > 0,
      };
    }),
    ...orders.filter(o => ["pending", "confirmed", "onTheWay"].includes(o.status)).map(o => {
      const paid = o.amountPaid || 0;
      const due = dueFrom(o.total, paid);
      return {
        refType: "order" as const, refId: o.id,
        label: `Order #${o.orderNo}`,
        total: o.total, paid, due,
        minDue: due,
        payable: due > 0,
      };
    }),
  ].filter(p => p.payable);

  const selectedList = payables.filter(p => selected[key(p)] !== undefined);
  const selectedTotal = selectedList.reduce((s, p) => s + (selected[key(p)] || 0), 0);
  const totalDue = payables.reduce((s, p) => s + p.due, 0);
  const pendingClaims = claims.filter(c => c.status === "pending");

  const toggle = (p: Payable) => {
    setSelected(prev => {
      const k = key(p);
      if (prev[k] !== undefined) {
        const { [k]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [k]: p.minDue || p.due };
    });
  };

  const setAmount = (p: Payable, v: string) =>
    setSelected(prev => ({ ...prev, [key(p)]: Number(v) || 0 }));

  const tabs = [
    { k: "squads", l: `⚽ Squads (${squads.length})` },
    { k: "players", l: `👤 Players (${players.length})` },
    { k: "cameramen", l: `📷 Camera (${cBookings.length})` },
    { k: "vehicles", l: `🚗 Vehicles (${vBookings.length})` },
    { k: "shop", l: `🛍️ Shop (${orders.length})` },
  ];

  return (
    <div className="min-h-screen bg-dark text-white">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 pt-24 pb-32">
        <div className="text-center mb-6">
          <span className="text-4xl block mb-2">📦</span>
          <h1 className="text-3xl font-bold gradient-text">My Bookings & Orders</h1>
        </div>

        {/* Pending claims */}
        {pendingClaims.length > 0 && (
          <div className="bg-blue-900/20 border border-blue-800/50 rounded-2xl p-4 mb-5">
            <p className="text-blue-400 font-semibold text-sm mb-2">
              ⏳ {pendingClaims.length} payment{pendingClaims.length > 1 ? "s" : ""} awaiting verification
            </p>
            {pendingClaims.map(c => (
              <div key={c.id} className="flex justify-between text-xs text-white/50 py-1">
                <span className="font-mono">{c.externalRef}</span>
                <span>{tk(c.totalAmount)}</span>
              </div>
            ))}
            <p className="text-[11px] text-white/30 mt-2">
              We'll confirm within a few hours once verified.
            </p>
          </div>
        )}

        {/* Rejected claims */}
        {claims.filter(c => c.status === "rejected").slice(0, 2).map(c => (
          <div key={c.id} className="bg-red-900/20 border border-red-800/50 rounded-2xl p-4 mb-3">
            <p className="text-red-400 font-semibold text-sm">
              Payment {c.externalRef} could not be verified
            </p>
            <p className="text-[11px] text-white/50 mt-1">{c.adminNote}</p>
          </div>
        ))}

        {/* Payment selector */}
        {payables.length > 0 && (
          <div className="glass rounded-2xl p-5 mb-6">
            <div className="flex justify-between items-start mb-1">
              <h2 className="font-bold text-white">💳 Pay Now</h2>
              <span className="text-yellow-400 font-bold">{tk(totalDue)} due</span>
            </div>
            <p className="text-[11px] text-white/40 mb-4">
              Select what you're paying for. You can pay several together with one transaction.
            </p>

            <div className="space-y-2">
              {payables.map(p => {
                const k = key(p);
                const on = selected[k] !== undefined;
                return (
                  <div key={k}
                    className={`rounded-xl border p-3 transition ${
                      on ? "bg-primary-900/20 border-primary-700" : "bg-dark-card border-dark-border"
                    }`}>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" checked={on} onChange={() => toggle(p)}
                        className="mt-1 rounded accent-green-600" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{p.label}</p>
                        <p className="text-[11px] text-white/40">
                          {tk(p.total)} total
                          {p.paid > 0 && ` • ${tk(p.paid)} paid`}
                          {" • "}<span className="text-yellow-400">{tk(p.due)} due</span>
                        </p>
                      </div>
                    </label>

                    {on && (
                      <div className="mt-3 pl-7 flex items-center gap-2">
                        <span className="text-[11px] text-white/40">Paying ৳</span>
                        <input type="number" value={selected[k]}
                          onChange={e => setAmount(p, e.target.value)}
                          className="w-28 px-2 py-1.5 rounded-lg bg-dark border border-dark-border text-white text-sm outline-none focus:border-primary-500" />
                        <button onClick={() => setAmount(p, String(p.minDue))}
                          className="text-[10px] text-white/40 hover:text-white/70 px-1">
                          min {tk(p.minDue)}
                        </button>
                        <button onClick={() => setAmount(p, String(p.due))}
                          className="text-[10px] text-primary-400 hover:text-primary-300 px-1">
                          full {tk(p.due)}
                        </button>
                      </div>
                    )}

                    {on && selected[k] > p.due && (
                      <p className="text-[10px] text-red-400 mt-1 pl-7">
                        More than the {tk(p.due)} owed
                      </p>
                    )}
                    {on && selected[k] > 0 && selected[k] < p.minDue && (
                      <p className="text-[10px] text-yellow-400 mt-1 pl-7">
                        Below the {tk(p.minDue)} minimum to confirm
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
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
            {tab === "squads" && (
              squads.length === 0 ? <Empty icon="⚽" text="No squad requests yet" link="/cart" linkText="Build a Squad" /> :
              squads.map(s => {
                const info = TEAM_STATUS_INFO[s.status];
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
                    <div className="space-y-1.5 mb-3">
                      {(s.squad || []).map((p, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span className="w-8 h-6 rounded bg-red-600/80 flex items-center justify-center text-[9px] font-bold shrink-0">
                            {p.positionKey}
                          </span>
                          <span className="flex-1 truncate text-white/70">{p.playerName}</span>
                          {p.amount ? <span className="text-white/50 text-xs">{tk(p.amount)}</span>
                            : <span className="text-white/20 text-[10px]">pending</span>}
                        </div>
                      ))}
                    </div>
                    {s.finalAmount ? <Money total={s.finalAmount} paid={s.amountPaid} />
                      : <Pending text="We'll confirm pricing by phone shortly." />}
                  </div>
                );
              })
            )}

            {tab === "players" && (
              players.length === 0 ? <Empty icon="👤" text="No player bookings" link="/players?playerType=player" linkText="Browse Players" /> :
              players.map(b => {
                const info = BOOKING_STATUS_INFO[b.status];
                return (
                  <div key={b.id} className="glass rounded-2xl p-5">
                    <div className="flex justify-between items-start gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {b.player?.photo ? <img src={b.player.photo} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                          : <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center text-2xl shrink-0">⚽</div>}
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
                    <Money total={b.finalAmount ?? b.amount} paid={b.amountPaid} />
                  </div>
                );
              })
            )}

            {tab === "cameramen" && (
              cBookings.length === 0 ? <Empty icon="📷" text="No cameraman bookings" link="/cameramen" linkText="Browse Cameramen" /> :
              cBookings.map(b => {
                const info = SERVICE_STATUS_INFO[b.status];
                return (
                  <div key={b.id} className="glass rounded-2xl p-5">
                    <div className="flex justify-between items-start gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {b.cameraman?.photo ? <img src={b.cameraman.photo} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                          : <div className="w-14 h-14 rounded-xl bg-purple-900 flex items-center justify-center text-2xl shrink-0">📷</div>}
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
                      <Row label="Duration" value={`${b.durationHours} hours`} />
                    </div>
                    <Money total={b.finalAmount ?? b.quotedRate} paid={b.amountPaid} />
                  </div>
                );
              })
            )}

            {tab === "vehicles" && (
              vBookings.length === 0 ? <Empty icon="🚗" text="No vehicle bookings" link="/vehicles" linkText="Browse Vehicles" /> :
              vBookings.map(b => {
                const info = SERVICE_STATUS_INFO[b.status];
                return (
                  <div key={b.id} className="glass rounded-2xl p-5">
                    <div className="flex justify-between items-start gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {b.vehicle?.photos?.[0] ? <img src={b.vehicle.photos[0].url} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                          : <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center text-2xl shrink-0">🚗</div>}
                        <div className="min-w-0">
                          <p className="font-bold truncate">{b.vehicle?.model}</p>
                          <p className="text-white/40 text-xs">{b.days} day{b.days > 1 ? "s" : ""} • {b.startDate}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border shrink-0 ${info?.bg} ${info?.color}`}>
                        {info?.icon} {lang === "bn" ? info?.labelBn : info?.label}
                      </span>
                    </div>
                    <Money total={b.finalAmount ?? b.estimatedAmount} paid={b.amountPaid} />
                  </div>
                );
              })
            )}

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
                    <div className="space-y-2 mb-3">
                      {o.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm">
                          {item.photo ? <img src={item.photo} alt="" className="w-10 h-10 rounded-lg object-cover" />
                            : <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">🛍️</div>}
                          <span className="flex-1 truncate text-white/70">{item.productName}</span>
                          <span className="text-white/40 text-xs">×{item.quantity}</span>
                          <span className="font-semibold text-sm">{tk(item.subtotal)}</span>
                        </div>
                      ))}
                    </div>
                    <Money total={o.total} paid={o.amountPaid} />
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

      {/* Sticky pay bar */}
      {selectedList.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-dark-card/95 backdrop-blur-xl border-t border-dark-border p-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] text-white/40">
                {selectedList.length} item{selectedList.length > 1 ? "s" : ""} selected
              </p>
              <p className="text-xl font-bold text-primary-400">{tk(selectedTotal)}</p>
            </div>
            <button onClick={() => setPayOpen(true)}
              disabled={selectedTotal <= 0 || selectedList.some(p => (selected[key(p)] || 0) > p.due)}
              className="btn-primary text-white px-8 py-3 rounded-xl font-bold disabled:opacity-40">
              Continue to Pay
            </button>
          </div>
        </div>
      )}

      {payOpen && (
        <PayModal
          items={selectedList.map(p => ({ ...p, amount: selected[key(p)] }))}
          total={selectedTotal}
          bkash={bkash}
          nagad={nagad}
          onClose={() => setPayOpen(false)}
          onDone={() => { setPayOpen(false); setSelected({}); load(); showToast("Payment submitted for verification"); }}
          onError={(m: string) => showToast(m, "error")}
        />
      )}

      <Footer />
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

/* ─── Payment modal ─── */

function PayModal({ items, total, bkash, nagad, onClose, onDone, onError }: any) {
  const [method, setMethod] = useState("bkash");
  const [trxId, setTrxId] = useState("");
  const [sender, setSender] = useState("");
  const [busy, setBusy] = useState(false);

  const number = method === "bkash" ? bkash : nagad;

  const submit = async () => {
    if (!trxId.trim()) { onError("Enter the transaction ID"); return; }
    setBusy(true);
    try {
      await paymentsAPI.submitClaim({
        refs: items.map((i: any) => ({
          refType: i.refType, refId: i.refId, amount: i.amount, label: i.label,
        })),
        method,
        externalRef: trxId.trim(),
        senderNumber: sender || undefined,
      });
      onDone();
    } catch (err: any) {
      const m = err.response?.data?.message;
      onError(Array.isArray(m) ? m[0] : (m || "Could not submit payment"));
    } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[9000] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        className="bg-dark-card border border-dark-border rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto">

        <div className="sticky top-0 bg-dark-card border-b border-dark-border px-5 py-4 flex justify-between items-center">
          <h3 className="font-bold text-white">Pay {tk(total)}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl">✕</button>
        </div>

        <div className="p-5 space-y-5">
          {/* What's being paid */}
          <div className="bg-dark rounded-xl p-3 border border-dark-border space-y-1.5">
            {items.map((i: any, n: number) => (
              <div key={n} className="flex justify-between text-xs gap-3">
                <span className="text-white/50 truncate">{i.label}</span>
                <span className="font-semibold shrink-0">{tk(i.amount)}</span>
              </div>
            ))}
            <div className="flex justify-between pt-2 border-t border-dark-border">
              <span className="font-semibold text-sm">Total</span>
              <span className="font-bold text-primary-400">{tk(total)}</span>
            </div>
          </div>

          {/* Method */}
          <div>
            <p className="text-xs font-semibold text-white/60 mb-2">Pay with</p>
            <div className="grid grid-cols-2 gap-2">
              {["bkash", "nagad"].map(m => (
                <button key={m} onClick={() => setMethod(m)}
                  className={`py-3 rounded-xl font-bold text-sm border transition ${
                    method === m
                      ? "bg-primary-900/40 border-primary-600 text-white"
                      : "bg-dark border-dark-border text-white/40"
                  }`}>
                  {m === "bkash" ? "bKash" : "Nagad"}
                </button>
              ))}
            </div>
          </div>

          {/* Instructions */}
          {number ? (
            <div className="bg-primary-900/20 border border-primary-800 rounded-xl p-4">
              <p className="text-xs text-white/50 mb-1">Send Money to</p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xl font-bold text-primary-400 font-mono tracking-wide">{number}</p>
                <button onClick={() => navigator.clipboard?.writeText(number)}
                  className="text-[11px] bg-white/10 px-2.5 py-1 rounded-lg text-white/70">Copy</button>
              </div>
              <ol className="text-[11px] text-white/40 mt-3 space-y-1 list-decimal list-inside">
                <li>Open your {method === "bkash" ? "bKash" : "Nagad"} app</li>
                <li>Send <strong className="text-white/70">{tk(total)}</strong> to the number above</li>
                <li>Copy the transaction ID from the confirmation</li>
                <li>Paste it below and submit</li>
              </ol>
            </div>
          ) : (
            <div className="bg-yellow-900/20 border border-yellow-800 rounded-xl p-4">
              <p className="text-xs text-yellow-400">
                Payment number not configured yet. Please call us to arrange payment.
              </p>
            </div>
          )}

          {/* TrxID */}
          <div>
            <label className="block text-xs font-semibold text-white/60 mb-1">Transaction ID *</label>
            <input value={trxId} onChange={e => setTrxId(e.target.value.toUpperCase())}
              placeholder="e.g. 9K5X2ABCDE"
              className="w-full px-3 py-3 rounded-xl bg-dark border border-dark-border text-white font-mono outline-none focus:border-primary-500" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/60 mb-1">
              Your {method === "bkash" ? "bKash" : "Nagad"} number
            </label>
            <input value={sender} onChange={e => setSender(e.target.value)}
              placeholder="01XXXXXXXXX"
              className="w-full px-3 py-3 rounded-xl bg-dark border border-dark-border text-white outline-none focus:border-primary-500" />
            <p className="text-[10px] text-white/30 mt-1">Helps us find your payment faster.</p>
          </div>

          <button onClick={submit} disabled={busy || !trxId.trim()}
            className="w-full btn-primary text-white py-4 rounded-2xl font-bold disabled:opacity-40">
            {busy ? "Submitting..." : "Submit for Verification"}
          </button>

          <p className="text-[11px] text-white/30 text-center">
            We'll verify your transaction and confirm your booking within a few hours.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Small components ─── */

function Money({ total, paid }: { total?: number | null; paid?: number | null }) {
  const due = Math.max(0, Number(total || 0) - Number(paid || 0));
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

function Pending({ text }: { text: string }) {
  return (
    <p className="text-[11px] text-white/30 bg-dark-card rounded-xl p-3 border border-dark-border">
      {text}
    </p>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-white/30 shrink-0">{label}</span>
      <span className="text-right text-white/70">{value}</span>
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