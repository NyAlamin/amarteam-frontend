"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import Loading from "@/components/ui/loading";
import { useLang } from "@/lib/language-context";
import { playersAPI } from "@/lib/api";

export default function PlayerPanelLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isPlayer, logout } = useAuth();
  const { lang, setLang } = useLang();
  const router = useRouter();
  const pathname = usePathname();
  const [playerType, setPlayerType] = useState<string>("player");
  const [checking, setChecking] = useState(true);

  useEffect(() => { if (!loading && !isPlayer) router.push("/auth/login"); }, [loading, isPlayer]);

  useEffect(() => {
    if (!isPlayer) return;
    playersAPI.getMyProfile()
      .then(r => setPlayerType(r.data.playerType || "player"))
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [isPlayer]);

  if (loading || checking) return <div className="min-h-screen bg-dark"><Loading /></div>;
  if (!isPlayer) return null;

  const isCameraman = playerType === "cameraman";

  // Build nav based on role
  const nav = isCameraman
    ? [
        { href: "/player-panel", label: "Profile", icon: "👤" },
        { href: "/player-panel/portfolio", label: "Portfolio", icon: "📷" },
        { href: "/player-panel/cameraman-bookings", label: "Bookings", icon: "📋" },
        { href: "/player-panel/availability", label: "Dates", icon: "📅" },
      ]
    : [
        { href: "/player-panel", label: "Profile", icon: "👤" },
        { href: "/player-panel/requests", label: "Requests", icon: "🏆" },
        { href: "/player-panel/videos", label: "Videos", icon: "🎬" },
        { href: "/player-panel/availability", label: "Dates", icon: "📅" },
        { href: "/player-panel/match-history", label: "Matches", icon: "⚽" },
        { href: "/player-panel/bookings", label: "Bookings", icon: "📋" },
      ];

  const roleLabel = isCameraman ? "Cameraman Panel"
    : playerType === "coach" ? "Coach Panel"
    : playerType === "referee" ? "Referee Panel"
    : "Player Panel";

  return (
    <div className="min-h-screen bg-dark text-white pb-20 lg:pb-4">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 glass-dark px-3 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-1.5 min-w-0">
          <span className="text-lg shrink-0">⚽</span>
          <span className="font-bold text-sm truncate">{roleLabel}</span>
        </Link>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => setLang(lang === "en" ? "bn" : "en")}
            className="px-2 py-1 rounded-full text-[10px] font-bold border border-white/20 text-white">
            {lang === "en" ? "বা" : "En"}
          </button>
          <Link href="/" className="text-white/50 text-[11px] hover:text-white">Site ↗</Link>
          <button onClick={logout} className="text-white/40 text-[11px] hover:text-white">Logout</button>
        </div>
      </div>

      {/* Desktop Tabs */}
      <div className="hidden lg:block sticky top-[52px] z-40 bg-dark-card border-b border-dark-border">
        <div className="flex max-w-2xl mx-auto">
          {nav.map(s => (
            <Link key={s.href} href={s.href}
              className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition ${
                pathname === s.href
                  ? "border-primary-500 text-primary-400"
                  : "border-transparent text-white/40 hover:text-white/70"
              }`}>
              <span>{s.icon}</span>{s.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 max-w-2xl mx-auto">{children}</div>

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass-dark border-t border-dark-border">
        <div className="flex">
          {nav.map(s => (
            <Link key={s.href} href={s.href}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 transition ${
                pathname === s.href ? "text-primary-400" : "text-white/40"
              }`}>
              <span className="text-lg mb-0.5">{s.icon}</span>
              <span className="text-[9px] font-semibold">{s.label}</span>
              {pathname === s.href && <div className="w-8 h-0.5 bg-primary-500 rounded-full mt-1" />}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}