"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/language-context";
import { useCart } from "@/lib/cart-context";
import { useSettings } from "@/lib/settings-context";
import { Role } from "@/lib/types";
import { useState, useEffect } from "react";
import BottomNav from "@/components/layout/bottom-nav";

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const { lang, setLang, t } = useLang();
  const { squadCount, shopCount } = useCart();
  const { get } = useSettings();
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [talentOpen, setTalentOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState("");

  const logo = get("logo");
  const siteName = get("siteName") || "আমার টিম";
  const totalCart = shopCount + squadCount;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); setUserOpen(false); }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    router.push(`/players?playerType=player&search=${encodeURIComponent(search.trim())}`);
    setSearch("");
  };

  const talentActive = ["/players", "/cameramen", "/foreign-players"].includes(pathname);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-dark/90 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/20"
          : "bg-dark/80 backdrop-blur-md border-b border-white/[0.04]"
      }`}>
        <div className="max-w-[1400px] mx-auto px-3 sm:px-4">

          {/* ─── DESKTOP ROW ─── */}
          <div className={`hidden lg:flex items-center gap-4 transition-all duration-300 ${scrolled ? "h-[56px]" : "h-[64px]"}`}>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              {logo ? (
                <img src={logo} alt={siteName}
                  className={`transition-all duration-300 object-contain ${scrolled ? "h-8" : "h-9"}`} />
              ) : (
                <div className={`rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center transition-all duration-300 ${
                  scrolled ? "w-8 h-8" : "w-9 h-9"
                }`}>
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M12 7l3 2.2-1.15 3.5h-3.7L9 9.2 12 7z" fill="currentColor" />
                  </svg>
                </div>
              )}
              <span className={`font-bold text-white whitespace-nowrap transition-all duration-300 ${scrolled ? "text-base" : "text-lg"}`}>
                {siteName}
              </span>
            </Link>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex flex-1 max-w-xl mx-2">
              <div className="relative w-full group">
                <svg viewBox="0 0 24 24" fill="none"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-primary-400 transition-colors">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search players, coaches, referees…"
                  className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-primary-500/50 focus:bg-white/[0.08] focus:ring-1 focus:ring-primary-500/20 transition-all" />
              </div>
            </form>

            {/* Desktop nav links */}
            <div className="flex items-center gap-0.5 shrink-0">
              {/* Talent dropdown */}
              <div className="relative"
                onMouseEnter={() => setTalentOpen(true)}
                onMouseLeave={() => setTalentOpen(false)}>
                <button className={`text-sm font-medium px-3 py-2 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
                  talentOpen || talentActive ? "text-white bg-white/[0.07]" : "text-white/65 hover:text-white hover:bg-white/[0.05]"
                }`}>
                  {t("nav.talent")}
                  <svg viewBox="0 0 24 24" fill="none" className={`w-3.5 h-3.5 transition-transform ${talentOpen ? "rotate-180" : ""}`}>
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {talentOpen && (
                  <div className="absolute top-full left-0 pt-2 animate-[fadeIn_0.15s_ease-out]">
                    <div className="bg-dark-card/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 p-2 min-w-[250px]">
                      <DropItem href="/players?playerType=player" title={t("nav.players")} desc={t("nav.playersDesc")} color="from-primary-500 to-primary-700"
                        icon={<><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" /><path d="M12 7l3 2.2-1.15 3.5h-3.7L9 9.2 12 7z" fill="currentColor" /></>} />
                      <DropItem href="/players?playerType=coach" title={t("nav.coaches")} desc={t("nav.coachesDesc")} color="from-blue-500 to-blue-700"
                        icon={<><path d="M3 8l9-4 9 4-9 4-9-4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M7 10.5V16c0 1.1 2.2 2 5 2s5-.9 5-2v-5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></>} />
                      <DropItem href="/players?playerType=referee" title={t("nav.referees")} desc={t("nav.refereesDesc")} color="from-purple-500 to-purple-700"
                        icon={<><path d="M6 3v18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M6 4h12l-2.5 4L18 12H6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></>} />
                      <DropItem href="/foreign-players" title={t("nav.foreign")} desc={t("nav.foreignDesc")} color="from-cyan-500 to-blue-700"
                        icon={<><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" /><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" stroke="currentColor" strokeWidth="1.5" /></>} />
                      <DropItem href="/cameramen" title={t("nav.cameramen")} desc={t("nav.cameramenDesc")} color="from-pink-500 to-pink-700"
                        icon={<><rect x="2.5" y="7" width="13" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" /><path d="M15.5 11l5-3v8l-5-3v-2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><circle cx="7" cy="12" r="2.2" stroke="currentColor" strokeWidth="1.6" /></>} />
                    </div>
                  </div>
                )}
              </div>

              <NavLink href="/team-builder" active={pathname === "/team-builder"} label={t("nav.buildTeam")} />

              {/* Services dropdown */}
              <div className="relative"
                onMouseEnter={() => setServicesOpen(true)}
                onMouseLeave={() => setServicesOpen(false)}>
                <button className={`text-sm font-medium px-3 py-2 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
                  servicesOpen ? "text-white bg-white/[0.07]" : "text-white/65 hover:text-white hover:bg-white/[0.05]"
                }`}>
                  {t("nav.services")}
                  <svg viewBox="0 0 24 24" fill="none" className={`w-3.5 h-3.5 transition-transform ${servicesOpen ? "rotate-180" : ""}`}>
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {servicesOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 animate-[fadeIn_0.15s_ease-out]">
                    <div className="bg-dark-card/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 p-2 min-w-[240px]">
                      <DropItem href="/vehicles" title={t("nav.vehicles")} desc={t("nav.vehiclesDesc")} color="from-orange-500 to-orange-700"
                        icon={<><path d="M3 12l1.5-5h15L21 12M3 12v5a1 1 0 001 1h1a1 1 0 001-1v-1h12v1a1 1 0 001 1h1a1 1 0 001-1v-5M3 12h18" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><circle cx="7" cy="14.5" r="1.2" fill="currentColor" /><circle cx="17" cy="14.5" r="1.2" fill="currentColor" /></>} />
                      <DropItem href="/shop" title={t("nav.shop")} desc={t("nav.shopDesc")} color="from-emerald-500 to-emerald-700"
                        icon={<><path d="M4 7h16l-1 12H5L4 7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M9 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></>} />
                    </div>
                  </div>
                )}
              </div>

              <div className="w-px h-5 bg-white/10 mx-1" />

              <IconBtn href="/cart" count={squadCount} badgeColor="bg-red-500" label="Squad"
                icon={<><path d="M17 21a1 1 0 100-2 1 1 0 000 2zM9 21a1 1 0 100-2 1 1 0 000 2z" fill="currentColor" /><path d="M2 3h2.5l2.2 11.3a1.5 1.5 0 001.5 1.2h8.8a1.5 1.5 0 001.5-1.2L21 7H5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></>} />

              <IconBtn href="/checkout" count={shopCount} badgeColor="bg-primary-500" label="Cart"
                icon={<><path d="M4 7h16l-1 12H5L4 7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M9 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></>} />

              <button onClick={() => setLang(lang === "en" ? "bn" : "en")}
                className="ml-1 px-2.5 py-1.5 rounded-full text-[11px] font-bold border border-white/15 text-white/80 hover:text-white hover:border-white/30 hover:bg-white/5 transition whitespace-nowrap">
                {lang === "en" ? "বাংলা" : "EN"}
              </button>

              {!loading && (
                user ? (
                  <div className="relative ml-2"
                    onMouseEnter={() => setUserOpen(true)}
                    onMouseLeave={() => setUserOpen(false)}>
                    <button className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full hover:bg-white/[0.07] transition">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-sm ring-2 ring-white/10">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <svg viewBox="0 0 24 24" fill="none" className={`w-3.5 h-3.5 text-white/50 transition-transform ${userOpen ? "rotate-180" : ""}`}>
                        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    {userOpen && (
                      <div className="absolute top-full right-0 pt-2 animate-[fadeIn_0.15s_ease-out]">
                        <div className="bg-dark-card/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 p-2 min-w-[220px]">
                          <div className="px-3 py-2.5 border-b border-white/[0.07] mb-1">
                            <p className="font-semibold text-white text-sm truncate">{user.name}</p>
                            <p className="text-[11px] text-white/40 truncate">{user.email}</p>
                          </div>
                          {user.role === Role.ADMIN && <MenuItem href="/admin" label="Admin Panel" />}
                          {user.role === Role.PLAYER && <MenuItem href="/player-panel" label="My Profile" />}
                          <MenuItem href="/my-orders" label="My Orders" />
                          <MenuItem href="/cart" label="My Squad" />
                          <MenuItem href="/settings/security" label="Security" />
                          <button onClick={logout}
                            className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition mt-1">
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 ml-2">
                    <Link href="/auth/register-player"
                      className="text-primary-400 hover:text-primary-300 text-[13px] font-semibold transition px-2 whitespace-nowrap">
                      {t("nav.joinTalent")}
                    </Link>
                    <Link href="/auth/login"
                      className="text-white/70 hover:text-white text-sm font-medium transition px-2 whitespace-nowrap">
                      {t("nav.login")}
                    </Link>
                    <Link href="/auth/register"
                      className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition shadow-lg shadow-primary-900/40 whitespace-nowrap">
                      {t("nav.hirerRegister")}
                    </Link>
                  </div>
                )
              )}
            </div>
          </div>

          {/* ─── MOBILE ROW ─── */}
          <div className={`flex lg:hidden items-center justify-between relative transition-all duration-300 ${scrolled ? "h-[48px]" : "h-[52px]"}`}>
            {/* Left — hamburger */}
            <button onClick={() => setOpen(!open)} className="p-2 -ml-2 text-white/80 active:text-white">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                {open ? (
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                )}
              </svg>
            </button>

            {/* Center — logo */}
            <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5">
              {logo ? (
                <img src={logo} alt={siteName} className="h-7 object-contain" />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M12 7l3 2.2-1.15 3.5h-3.7L9 9.2 12 7z" fill="currentColor" />
                  </svg>
                </div>
              )}
              <span className="font-bold text-white text-sm">{siteName}</span>
            </Link>

            {/* Right — lang + cart */}
            <div className="flex items-center gap-0.5">
              <button onClick={() => setLang(lang === "en" ? "bn" : "en")}
                className="px-1.5 py-1 rounded-full text-[10px] font-bold border border-white/15 text-white/70">
                {lang === "en" ? "বা" : "EN"}
              </button>
              <Link href="/my-orders" className="relative p-2 text-white/70">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                  <path d="M4 7h16l-1 12H5L4 7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="M9 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                {totalCart > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-primary-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-dark">
                    {totalCart > 9 ? "9+" : totalCart}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* ─── MOBILE SEARCH BAR (always visible) ─── */}
        <div className="lg:hidden px-3 pb-2.5">
          <form onSubmit={handleSearch} className="relative flex">
            <svg viewBox="0 0 24 24" fill="none"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 z-10">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search players, coaches…"
              className="flex-1 bg-white/[0.06] border border-white/[0.08] border-r-0 rounded-l-xl pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-primary-500/50 transition-all"
            />
            <button type="submit"
              className="px-3.5 bg-primary-500 rounded-r-xl text-white shrink-0 active:bg-primary-400 transition-colors">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2.5" />
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </button>
          </form>
        </div>
      </nav>

      {/* ─── MOBILE DRAWER ─── */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-[fadeIn_0.2s]" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[82%] max-w-[320px] bg-dark-card border-r border-white/10 overflow-y-auto animate-[slideRight_0.3s_cubic-bezier(0.16,1,0.3,1)]">

            {/* Header */}
            <div className="sticky top-0 bg-dark-card/95 backdrop-blur-xl border-b border-white/[0.07] p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                {logo ? (
                  <img src={logo} alt="" className="h-7 object-contain" />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700" />
                )}
                <span className="font-bold text-white text-sm">{siteName}</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/50 p-1">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* User card */}
            {user && (
              <div className="m-3 p-3.5 rounded-2xl bg-gradient-to-br from-primary-900/40 to-dark border border-primary-800/40 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-white text-sm truncate">{user.name}</p>
                  <p className="text-[11px] text-white/40 capitalize">{user.role}</p>
                </div>
              </div>
            )}

            <div className="p-3 space-y-4">
              <MobileGroup title={t("nav.talent")}>
                <MobileLink href="/players?playerType=player" label={t("nav.players")} onClick={() => setOpen(false)} />
                <MobileLink href="/players?playerType=coach" label={t("nav.coaches")} onClick={() => setOpen(false)} />
                <MobileLink href="/players?playerType=referee" label={t("nav.referees")} onClick={() => setOpen(false)} />
                <MobileLink href="/foreign-players" label={`🌍 ${t("nav.foreign")}`} onClick={() => setOpen(false)} />
                <MobileLink href="/cameramen" label={t("nav.cameramen")} onClick={() => setOpen(false)} />
                <MobileLink href="/team-builder" label={t("nav.buildTeam")} onClick={() => setOpen(false)} />
              </MobileGroup>

              <MobileGroup title={t("nav.services")}>
                <MobileLink href="/vehicles" label={t("nav.vehicles")} onClick={() => setOpen(false)} />
                <MobileLink href="/shop" label={t("nav.shop")} onClick={() => setOpen(false)} />
                <MobileLink href="/cart" label="My Squad" badge={squadCount} onClick={() => setOpen(false)} />
                <MobileLink href="/checkout" label="Shop Cart" badge={shopCount} onClick={() => setOpen(false)} />
              </MobileGroup>

              <MobileGroup title="Account">
                {user ? (
                  <>
                    {user.role === Role.ADMIN && <MobileLink href="/admin" label="Admin Panel" onClick={() => setOpen(false)} />}
                    {user.role === Role.PLAYER && <MobileLink href="/player-panel" label="My Profile" onClick={() => setOpen(false)} />}
                    <MobileLink href="/my-orders" label="My Orders & Bookings" onClick={() => setOpen(false)} />
                    <MobileLink href="/settings/security" label="Security" onClick={() => setOpen(false)} />
                    <button onClick={() => { logout(); setOpen(false); }}
                      className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-red-400/80 hover:bg-red-500/10 transition">
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <MobileLink href="/auth/register-player" label={t("nav.joinTalent")} onClick={() => setOpen(false)} />
                    <MobileLink href="/auth/login" label={t("nav.login")} onClick={() => setOpen(false)} />
                    <Link href="/auth/register" onClick={() => setOpen(false)}
                      className="block text-center bg-gradient-to-r from-primary-500 to-primary-600 text-white py-2.5 rounded-xl font-bold text-sm mt-2">
                      {t("nav.hirerRegister")}
                    </Link>
                  </>
                )}
              </MobileGroup>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </>
  );
}

/* ─── Sub-components ─── */

function NavLink({ href, label, active }: { href: string; label: string; active?: boolean }) {
  return (
    <Link href={href}
      className={`text-sm font-medium px-3 py-2 rounded-lg transition whitespace-nowrap ${
        active ? "text-white bg-white/[0.07]" : "text-white/65 hover:text-white hover:bg-white/[0.05]"
      }`}>
      {label}
    </Link>
  );
}

function DropItem({ href, title, desc, icon, color }: {
  href: string; title: string; desc: string; icon: React.ReactNode; color: string;
}) {
  return (
    <Link href={href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.06] transition group">
      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">{icon}</svg>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white whitespace-nowrap">{title}</p>
        <p className="text-[11px] text-white/40 whitespace-nowrap">{desc}</p>
      </div>
    </Link>
  );
}

function IconBtn({ href, count, icon, badgeColor, label }: {
  href: string; count: number; icon: React.ReactNode; badgeColor: string; label: string;
}) {
  return (
    <Link href={href} title={label}
      className="relative p-2.5 rounded-lg text-white/65 hover:text-white hover:bg-white/[0.05] transition">
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">{icon}</svg>
      {count > 0 && (
        <span className={`absolute top-1 right-1 ${badgeColor} text-white text-[9px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center ring-2 ring-dark`}>
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}

function MenuItem({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="block px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/[0.06] transition">
      {label}
    </Link>
  );
}

function MobileGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-white/25 text-[10px] font-bold tracking-[0.15em] px-4 mb-1">{title.toUpperCase()}</p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function MobileLink({ href, label, onClick, badge }: {
  href: string; label: string; onClick: () => void; badge?: number;
}) {
  return (
    <Link href={href} onClick={onClick}
      className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm text-white/75 hover:text-white hover:bg-white/[0.06] transition">
      <span>{label}</span>
      {badge && badge > 0 ? (
        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{badge}</span>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white/20">
          <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </Link>
  );
}