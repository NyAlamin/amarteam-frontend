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

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-dark border-t border-white/[0.08]"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="grid grid-cols-4 h-[56px]">

          {/* Home */}
          <Link href="/" className={`flex flex-col items-center justify-center gap-[3px] ${
            pathname === "/" ? "text-primary-400" : "text-white/40"
          }`}>
            <svg viewBox="0 0 24 24" fill="none" className="w-[21px] h-[21px]">
              <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1v-9.5z"
                stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M9 21V14h6v7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[10px] font-medium leading-none">Home</span>
          </Link>

          {/* Talent */}
          <Link href="/players?playerType=player" className={`flex flex-col items-center justify-center gap-[3px] ${
            pathname.startsWith("/players") || pathname === "/cameramen" || pathname === "/foreign-players"
              ? "text-primary-400" : "text-white/40"
          }`}>
            <svg viewBox="0 0 24 24" fill="none" className="w-[21px] h-[21px]">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
              <path d="M12 7l3 2.2-1.15 3.5h-3.7L9 9.2 12 7z" fill="currentColor" />
            </svg>
            <span className="text-[10px] font-medium leading-none">Talent</span>
          </Link>

          {/* Cart */}
          <Link href="/checkout" className={`flex flex-col items-center justify-center gap-[3px] ${
            pathname === "/checkout" || pathname === "/cart" ? "text-primary-400" : "text-white/40"
          }`}>
            <div className="relative">
              <svg viewBox="0 0 24 24" fill="none" className="w-[21px] h-[21px]">
                <path d="M4 7h16l-1 12H5L4 7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M9 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              {totalCart > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-primary-500 text-white text-[8px] font-bold min-w-[14px] h-[14px] px-0.5 rounded-full flex items-center justify-center">
                  {totalCart > 9 ? "9+" : totalCart}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium leading-none">Cart</span>
          </Link>

          {/* Account */}
          <Link href={accountHref} className={`flex flex-col items-center justify-center gap-[3px] ${
            pathname === "/my-orders" || pathname === "/player-panel" || pathname === "/settings/security"
              ? "text-primary-400" : "text-white/40"
          }`}>
            <svg viewBox="0 0 24 24" fill="none" className="w-[21px] h-[21px]">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
              <path d="M4 21v-1a6 6 0 0112 0v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span className="text-[10px] font-medium leading-none">Account</span>
          </Link>

        </div>
      </div>
    </div>
  );
}