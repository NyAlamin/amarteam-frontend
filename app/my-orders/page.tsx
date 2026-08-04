"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import Loading from "@/components/ui/loading";
import { shopAPI, vehiclesAPI, cameramenAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/language-context";
import { Order, VehicleBooking, CameramanBooking, ORDER_STATUS_INFO, SERVICE_STATUS_INFO } from "@/lib/types";

export default function MyOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const { lang } = useLang();
  const [tab, setTab] = useState("shop");
  const [orders, setOrders] = useState<Order[]>([]);
  const [vBookings, setVBookings] = useState<VehicleBooking[]>([]);
  const [cBookings, setCBookings] = useState<CameramanBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      shopAPI.getMyOrders(),
      vehiclesAPI.getMyBookings(),
      cameramenAPI.getMyBookings(),
    ]).then(([o, v, c]) => {
      setOrders(o.data); setVBookings(v.data); setCBookings(c.data);
    }).catch(() => {}).finally(() => setLoading(false));
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

  const tabs = [
    { k: "shop", l: `🛍️ Shop (${orders.length})` },
    { k: "vehicles", l: `🚗 Vehicles (${vBookings.length})` },
    { k: "cameramen", l: `📷 Cameramen (${cBookings.length})` },
  ];

  return (
    <div className="min-h-screen bg-dark text-white">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">
        <div className="text-center mb-8">
          <span className="text-4xl block mb-2">📦</span>
          <h1 className="text-3xl font-bold gradient-text">My Orders & Bookings</h1>
        </div>

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
            {/* SHOP ORDERS */}
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
                          <span className="font-semibold text-sm">৳{item.subtotal.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-dark-card rounded-xl p-3 border border-dark-border space-y-1 text-sm">
                      <div className="flex justify-between"><span className="text-white/40">Subtotal</span><span>৳{o.subtotal.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-white/40">Delivery</span><span>৳{o.deliveryCharge}</span></div>
                      <div className="flex justify-between pt-2 border-t border-dark-border">
                        <span className="font-semibold">Total</span>
                        <span className="text-primary-400 font-bold">৳{o.total.toLocaleString()}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-white/30 mt-3">
                      📍 {o.address}, {o.upazila ? `${o.upazila}, ` : ""}{o.district}
                    </p>
                  </div>
                );
              })
            )}

            {/* VEHICLE BOOKINGS */}
            {tab === "vehicles" && (
              vBookings.length === 0 ? <Empty icon="🚗" text="No vehicle bookings" link="/vehicles" linkText="Browse Vehicles" /> :
              vBookings.map(b => {
                const info = SERVICE_STATUS_INFO[b.status];
                return (
                  <div key={b.id} className="glass rounded-2xl p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        {b.vehicle?.photos?.[0] ? (
                          <img src={b.vehicle.photos[0].url} alt="" className="w-14 h-14 rounded-xl object-cover" />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center text-2xl">🚗</div>
                        )}
                        <div>
                          <p className="font-bold">{b.vehicle?.model}</p>
                          <p className="text-white/40 text-xs">{b.vehicle?.seats} seats</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${info?.bg} ${info?.color}`}>
                        {info?.icon} {lang === "bn" ? info?.labelBn : info?.label}
                      </span>
                    </div>

                    <div className={`rounded-xl p-3 border mb-3 ${info?.bg}`}>
                      <p className="text-[11px] text-white/50">{info?.desc}</p>
                    </div>

                    <div className="bg-dark-card rounded-xl p-3 border border-dark-border space-y-1.5 text-xs">
                      <Row label="Start" value={b.startDate} />
                      <Row label="Days" value={`${b.days} day${b.days > 1 ? "s" : ""}`} />
                      <Row label="Destination" value={`${b.upazila ? `${b.upazila}, ` : ""}${b.district}`} />
                      <Row label="Estimated" value={`৳${b.estimatedAmount.toLocaleString()}`} highlight />
                      {b.finalAmount && <Row label="Final" value={`৳${b.finalAmount.toLocaleString()}`} highlight />}
                    </div>
                  </div>
                );
              })
            )}

            {/* CAMERAMAN BOOKINGS */}
            {tab === "cameramen" && (
              cBookings.length === 0 ? <Empty icon="📷" text="No cameraman bookings" link="/cameramen" linkText="Browse Cameramen" /> :
              cBookings.map(b => {
                const info = SERVICE_STATUS_INFO[b.status];
                return (
                  <div key={b.id} className="glass rounded-2xl p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        {b.cameraman?.photo ? (
                          <img src={b.cameraman.photo} alt="" className="w-14 h-14 rounded-xl object-cover" />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-purple-900 flex items-center justify-center text-2xl">📷</div>
                        )}
                        <div>
                          <p className="font-bold">{b.cameraman?.user?.name}</p>
                          <p className="text-white/40 text-xs">{b.tournament || "Match coverage"}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${info?.bg} ${info?.color}`}>
                        {info?.icon} {lang === "bn" ? info?.labelBn : info?.label}
                      </span>
                    </div>

                    <div className={`rounded-xl p-3 border mb-3 ${info?.bg}`}>
                      <p className="text-[11px] text-white/50">{info?.desc}</p>
                    </div>

                    <div className="bg-dark-card rounded-xl p-3 border border-dark-border space-y-1.5 text-xs">
                      <Row label="Date" value={b.matchDate} />
                      <Row label="Location" value={`${b.upazila ? `${b.upazila}, ` : ""}${b.district}`} />
                      {b.venue && <Row label="Venue" value={b.venue} />}
                      <Row label="Duration" value={`${b.durationHours} hours`} />
                      <Row label="Quoted" value={`৳${b.quotedRate.toLocaleString()}`} highlight />
                      {b.finalAmount && <Row label="Final" value={`৳${b.finalAmount.toLocaleString()}`} highlight />}
                    </div>
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