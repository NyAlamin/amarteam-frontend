"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import Loading from "@/components/ui/loading";

const nav = [
  { href: "/admin", label: "Dashboard", icon: "📊", group: "Main" },
  { href: "/admin/pending", label: "Pending", icon: "⏳", group: "Main" },

  { href: "/admin/players", label: "All Talent", icon: "👤", group: "Talent" },
  { href: "/admin/players/new", label: "Add Talent", icon: "➕", group: "Talent" },
  { href: "/admin/tiers", label: "Tiers", icon: "🏅", group: "Talent" },

  { href: "/admin/bookings", label: "Player Bookings", icon: "📋", group: "Bookings" },
  { href: "/admin/team-requests", label: "Team Requests", icon: "🏆", group: "Bookings" },
  { href: "/admin/cameraman-bookings", label: "Cameraman", icon: "📷", group: "Bookings" },
  { href: "/admin/vehicle-bookings", label: "Vehicle", icon: "🚗", group: "Bookings" },

  { href: "/admin/claims", label: "Payments" },

  { href: "/admin/vehicles", label: "Vehicles", icon: "🚙", group: "Manage" },
  { href: "/admin/shop/products", label: "Products", icon: "🛍️", group: "Manage" },
  { href: "/admin/shop/categories", label: "Categories", icon: "🏷️", group: "Manage" },
  { href: "/admin/shop/orders", label: "Orders", icon: "📦", group: "Manage" },
  { href: "/admin/commissions", label: "Commissions", icon: "💰", group: "Manage" },

  { href: "/admin/hirers", label: "Hirers", icon: "🤝", group: "Other" },
  { href: "/admin/reviews", label: "Reviews", icon: "💬", group: "Other" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️", group: "Other" },
  { href: "/admin/branding", label: "Branding", icon: "🎨", group: "Other" },
    { href: "/admin/popup", label: "Popup", icon: "🎉", group: "Other" },
  
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { if (!loading && !isAdmin) router.push("/auth/login"); }, [loading, isAdmin]);
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  if (loading) return <div className="min-h-screen bg-slate-50"><Loading /></div>;
  if (!isAdmin) return null;

  const current = nav.find(s => s.href === pathname) ||
    nav.filter(s => s.href !== "/admin").reverse().find(s => pathname.startsWith(s.href));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Mobile Top Bar */}
      <div className="lg:hidden sticky top-0 z-50 bg-green-950 px-4 py-3 flex justify-between items-center">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white text-2xl">☰</button>
        <div className="flex items-center gap-2">
          <span className="text-lg">⚽</span>
          <span className="font-bold text-sm text-white">Admin</span>
        </div>
        <Link href="/" className="text-white/50 text-xs">Site ↗</Link>
      </div>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-green-950 animate-[slideRight_0.3s_ease-out] overflow-y-auto">
            <SidebarContent pathname={pathname} onClose={() => setSidebarOpen(false)} user={user} logout={logout} />
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-60 bg-green-950 overflow-y-auto z-40">
        <SidebarContent pathname={pathname} user={user} logout={logout} />
      </aside>

      {/* Main */}
      <main className="lg:ml-60 min-h-screen bg-slate-50">
        <header className="hidden lg:flex sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-4 justify-between items-center">
          <h1 className="text-lg font-bold text-slate-800">
            {current?.icon} {current?.label || "Admin"}
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600 font-medium">{user?.name}</span>
            <button onClick={logout} className="text-slate-400 text-xs hover:text-red-500 transition">Logout</button>
          </div>
        </header>
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}

function SidebarContent({ pathname, onClose, user, logout }: {
  pathname: string; onClose?: () => void; user: any; logout: () => void;
}) {
  const groups = ["Main", "Talent", "Bookings", "Manage", "Other"];

  return (
    <>
      <div className="p-5 border-b border-white/10 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">⚽</span>
          <span className="font-bold text-lg text-white">আমার টিম</span>
        </Link>
        {onClose && <button onClick={onClose} className="text-white/50 text-xl lg:hidden">✕</button>}
      </div>

      <nav className="py-2">
        {groups.map(group => (
          <div key={group}>
            <p className="px-5 pt-3 pb-1 text-white/25 text-[10px] font-bold tracking-widest">
              {group.toUpperCase()}
            </p>
            {nav.filter(s => s.group === group).map(s => {
              const active = pathname === s.href ||
                (s.href !== "/admin" && !["/admin/players", "/admin/shop/products"].includes(s.href) && pathname.startsWith(s.href)) ||
                (s.href === "/admin/players" && pathname === "/admin/players") ||
                (s.href === "/admin/shop/products" && pathname === "/admin/shop/products");
              return (
                <Link key={s.href} href={s.href} onClick={onClose}
                  className={`flex items-center gap-3 px-5 py-2.5 text-sm border-l-[3px] transition ${
                    active
                      ? "bg-white/10 text-white font-semibold border-green-400"
                      : "text-white/50 hover:text-white hover:bg-white/5 border-transparent"
                  }`}>
                  <span>{s.icon}</span>{s.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="px-4 py-4 mt-2 border-t border-white/10">
        <p className="text-xs text-white/70 font-semibold mb-1">{user?.name}</p>
        <p className="text-[10px] text-white/30 mb-3 truncate">{user?.email}</p>
        <Link href="/" className="block text-center text-white/40 text-xs hover:text-white/70 mb-2">← Back to Site</Link>
        <button onClick={logout} className="block w-full text-center text-red-400/60 text-xs hover:text-red-400">Logout</button>
      </div>
    </>
  );
}