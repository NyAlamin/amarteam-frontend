"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { Role } from "@/lib/types";

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { shopCount, squadCount } = useCart();
  const totalCart = shopCount + squadCount;

  const isAdmin = pathname.startsWith("/admin");
  if (isAdmin) return null;

  const accountHref = user
    ? user.role === Role.ADMIN
      ? "/admin"
      : user.role === Role.PLAYER
        ? "/player-panel"
        : "/my-orders"
    : "/auth/login";

  const tabs = [
    {
      label: "Home",
      href: "/",
      active: pathname === "/",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-[22px] h-[22px]">
          <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1v-9.5z"
            stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M9 21V14h6v7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label: "Talent",
      href: "/players?playerType=player",
      active: pathname.startsWith("/players") || pathname === "/cameramen" || pathname === "/foreign-players",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-[22px] h-[22px]">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 7l3 2.2-1.15 3.5h-3.7L9 9.2 12 7z" fill="currentColor" />
        </svg>
      ),
    },
    {
      label: "Cart",
      href: "/checkout",
      active: pathname === "/checkout" || pathname === "/cart",
      badge: totalCart,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-[22px] h-[22px]">
          <path d="M4 7h16l-1 12H5L4 7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M9 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      label: "Account",
      href: accountHref,
      active: pathname === "/my-orders" || pathname === "/player-panel" || pathname === "/settings/security",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-[22px] h-[22px]">
          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
          <path d="M4 21v-1a6 6 0 0112 0v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-dark/95 backdrop-blur-xl border-t border-white/[0.07] safe-area-bottom">
      <div className="flex items-center justify-around h-[58px] px-1">
        {tabs.map((tab) => (
          <Link
            key={tab.label}
            href={tab.href}
            className={`flex flex-col items-center justify-center gap-0.5 w-16 py-1.5 rounded-xl transition-colors relative ${
              tab.active
                ? "text-primary-400"
                : "text-white/40 active:text-white/60"
            }`}
          >
            <div className="relative">
              {tab.icon}
              {tab.badge && tab.badge > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-primary-500 text-white text-[9px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center">
                  {tab.badge > 9 ? "9+" : tab.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">{tab.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}