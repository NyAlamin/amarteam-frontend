"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { playersAPI, bookingsAPI, usersAPI, teamRequestsAPI, vehiclesAPI, shopAPI, cameramenAPI } from "@/lib/api";
import Loading from "@/components/ui/loading";

export default function AdminDashboard() {
  const [s, setS] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      playersAPI.getAllAdmin(),
      playersAPI.getPending(),
      bookingsAPI.getAll(),
      usersAPI.getHirers(),
      teamRequestsAPI.getAll(),
      vehiclesAPI.getAllAdmin(),
      vehiclesAPI.getAllBookings(),
      shopAPI.getStats(),
      cameramenAPI.getAllBookings(),
    ]).then(([p, pend, b, h, t, v, vb, shop, cb]) => {
      const talent = p.data;
      setS({
        players: talent.filter((x: any) => x.playerType === "player").length,
        coaches: talent.filter((x: any) => x.playerType === "coach").length,
        referees: talent.filter((x: any) => x.playerType === "referee").length,
        cameramen: talent.filter((x: any) => x.playerType === "cameraman").length,
        pending: pend.data.length,
        hirers: h.data.length,
        playerBookings: b.data.length,
        pendingPlayerBookings: b.data.filter((x: any) => x.status === "pending").length,
        teamRequests: t.data.length,
        pendingTeamRequests: t.data.filter((x: any) => x.status === "callingSoon").length,
        vehicles: v.data.length,
        vehicleBookings: vb.data.length,
        pendingVehicle: vb.data.filter((x: any) => x.status === "advancePending").length,
        cameramanBookings: cb.data.length,
        pendingCameraman: cb.data.filter((x: any) => x.status === "advancePending").length,
        ...shop.data,
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  const sections = [
    {
      title: "🎯 Needs Attention",
      cards: [
        { v: s?.pending, l: "Pending Approvals", link: "/admin/pending", color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: "⏳" },
        { v: s?.pendingTeamRequests, l: "New Team Requests", link: "/admin/team-requests", color: "bg-blue-50 text-blue-700 border-blue-200", icon: "🏆" },
        { v: s?.pendingOrders, l: "New Orders", link: "/admin/shop/orders", color: "bg-purple-50 text-purple-700 border-purple-200", icon: "📦" },
        { v: s?.pendingVehicle, l: "Vehicle Bookings", link: "/admin/vehicle-bookings", color: "bg-orange-50 text-orange-700 border-orange-200", icon: "🚗" },
        { v: s?.pendingCameraman, l: "Cameraman Bookings", link: "/admin/cameraman-bookings", color: "bg-pink-50 text-pink-700 border-pink-200", icon: "📷" },
        { v: s?.lowStock, l: "Low Stock Items", link: "/admin/shop/products", color: "bg-red-50 text-red-700 border-red-200", icon: "⚠️" },
      ],
    },
    {
      title: "👥 Talent",
      cards: [
        { v: s?.players, l: "Players", link: "/admin/players", color: "bg-white text-green-700 border-slate-200", icon: "⚽" },
        { v: s?.coaches, l: "Coaches", link: "/admin/players", color: "bg-white text-blue-700 border-slate-200", icon: "🎓" },
        { v: s?.referees, l: "Referees", link: "/admin/players", color: "bg-white text-purple-700 border-slate-200", icon: "🏁" },
        { v: s?.cameramen, l: "Cameramen", link: "/admin/players", color: "bg-white text-pink-700 border-slate-200", icon: "📷" },
        { v: s?.hirers, l: "Hirers", link: "/admin/hirers", color: "bg-white text-slate-700 border-slate-200", icon: "🤝" },
      ],
    },
    {
      title: "🛍️ Shop & Services",
      cards: [
        { v: s?.products, l: "Products", link: "/admin/shop/products", color: "bg-white text-green-700 border-slate-200", icon: "🛍️" },
        { v: s?.categories, l: "Categories", link: "/admin/shop/categories", color: "bg-white text-slate-700 border-slate-200", icon: "🏷️" },
        { v: s?.vehicles, l: "Vehicles", link: "/admin/vehicles", color: "bg-white text-slate-700 border-slate-200", icon: "🚙" },
        { v: s?.totalOrders, l: "Total Orders", link: "/admin/shop/orders", color: "bg-white text-slate-700 border-slate-200", icon: "📦" },
        { v: s?.delivered, l: "Delivered", link: "/admin/shop/orders", color: "bg-white text-green-700 border-slate-200", icon: "✓" },
        { v: `৳${((s?.revenue || 0) / 1000).toFixed(0)}k`, l: "Shop Revenue", link: "/admin/shop/orders", color: "bg-green-50 text-green-700 border-green-200", icon: "💰" },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      {sections.map((sec, si) => (
        <div key={si}>
          <h3 className="font-bold text-slate-800 mb-3">{sec.title}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {sec.cards.map((c, i) => (
              <Link key={i} href={c.link}>
                <div className={`rounded-xl border p-4 text-center hover:shadow-md transition cursor-pointer ${c.color}`}>
                  <div className="text-xl mb-1">{c.icon}</div>
                  <div className="text-2xl font-bold">{c.v ?? 0}</div>
                  <div className="text-[10px] opacity-70 mt-0.5">{c.l}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}

      {/* Quick actions */}
      <div>
        <h3 className="font-bold text-slate-800 mb-3">⚡ Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { l: "Add Talent", link: "/admin/players/new", icon: "➕" },
            { l: "Add Product", link: "/admin/shop/products/new", icon: "🛍️" },
            { l: "Add Vehicle", link: "/admin/vehicles/new", icon: "🚗" },
            { l: "Add Category", link: "/admin/shop/categories", icon: "🏷️" },
          ].map((a, i) => (
            <Link key={i} href={a.link}>
              <div className="bg-green-600 text-white rounded-xl p-4 text-center hover:bg-green-700 transition">
                <div className="text-xl mb-1">{a.icon}</div>
                <div className="text-xs font-bold">{a.l}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}