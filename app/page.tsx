"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import PlayerCard from "@/components/ui/player-card";
import CameramanCard from "@/components/ui/cameraman-card";
import VehicleCard from "@/components/ui/vehicle-card";
import ProductCard from "@/components/ui/product-card";
import Loading from "@/components/ui/loading";
import { playersAPI, vehiclesAPI, shopAPI } from "@/lib/api";
import { useLang } from "@/lib/language-context";
import { Player, Vehicle, Product } from "@/lib/types";
import { useSettings } from "@/lib/settings-context";
import ForeignPlayersSection from "@/components/ui/foreign-players-section";


function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add("visible"); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

export default function HomePage() {
  const { t } = useLang();
  const { get } = useSettings();
  const heroImage = get("heroImage");
  const logo = get("logo");
  const [players, setPlayers] = useState<Player[]>([]);
  const [coaches, setCoaches] = useState<Player[]>([]);
  const [referees, setReferees] = useState<Player[]>([]);
  const [cameramen, setCameramen] = useState<Player[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      playersAPI.getAll({ playerType: "player", sort: "rating" }),
      playersAPI.getAll({ playerType: "coach", sort: "rating" }),
      playersAPI.getAll({ playerType: "referee", sort: "rating" }),
      playersAPI.getAll({ playerType: "cameraman", sort: "rating" }),
      vehiclesAPI.getAll(),
      shopAPI.getProducts({ featured: "true" }),
    ]).then(([p, c, r, cm, v, pr]) => {
      setPlayers(p.data); setCoaches(c.data); setReferees(r.data);
      setCameramen(cm.data); setVehicles(v.data); setProducts(pr.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const totalTalent = players.length + coaches.length + referees.length + cameramen.length;

  return (
    <div className="min-h-screen bg-dark text-white">
      <Navbar />

      {/* ─── HERO ─── */}
<section className="relative min-h-[88vh] sm:min-h-screen flex items-center justify-center overflow-hidden">
  {/* Background image from admin */}
  {heroImage ? (
    <>
      <div className="absolute inset-0">
        <img src={heroImage} alt="" className="w-full h-full object-cover" />
      </div>
      {/* Overlays for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/70 to-dark" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary-950/50 via-transparent to-primary-950/50" />
    </>
  ) : (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-primary-950 via-dark to-primary-950 animate-[gradient-shift_10s_ease_infinite]"
        style={{ backgroundSize: "200% 200%" }} />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-[10%] w-64 sm:w-96 h-64 sm:h-96 bg-primary-500/10 rounded-full blur-[100px] animate-[float_7s_ease-in-out_infinite]" />
        <div className="absolute bottom-1/4 right-[10%] w-72 sm:w-[28rem] h-72 sm:h-[28rem] bg-primary-600/8 rounded-full blur-[120px] animate-[float_9s_ease-in-out_infinite_1s]" />
      </div>
    </>
  )}

  {/* Subtle grid */}
  <div className="absolute inset-0 opacity-[0.04]"
    style={{ backgroundImage: "radial-gradient(circle, #22c55e 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

  {/* Content */}
  <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-24 pb-16">

    {/* Logo */}
    <div className="mb-6 animate-[hero-zoom_1s_ease-out]">
      {logo ? (
        <img src={logo} alt="" className="h-20 sm:h-28 mx-auto object-contain drop-shadow-2xl animate-[float_5s_ease-in-out_infinite]" />
      ) : (
        <div className="w-20 h-20 sm:w-28 sm:h-28 mx-auto rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-2xl shadow-primary-900/50 animate-[float_5s_ease-in-out_infinite]">
          <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12 sm:w-16 sm:h-16 text-white">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
            <path d="M12 7l3 2.2-1.15 3.5h-3.7L9 9.2 12 7z" fill="currentColor" />
            <path d="M12 3v4M4.5 9l3.5 2.5M19.5 9L16 11.5M7 20l1.5-4M17 20l-1.5-4" stroke="currentColor" strokeWidth="1.3" />
          </svg>
        </div>
      )}
    </div>

    {/* Eyebrow */}
    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.07] border border-white/10 backdrop-blur-sm mb-5 animate-[slideUp_0.8s_ease-out]">
      <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
      <span className="text-[11px] sm:text-xs font-semibold text-white/70 tracking-wide">
        BANGLADESH'S FOOTBALL PLATFORM
      </span>
    </div>

    {/* Headline */}
    <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-4 leading-[1.05] animate-[slideUp_0.8s_ease-out_0.1s_both]">
      <span className="gradient-text">Everything Football</span>
      <span className="block text-white/85 text-xl sm:text-3xl lg:text-4xl mt-3 font-semibold">
        All in one place
      </span>
    </h1>

    <p className="text-sm sm:text-lg text-white/55 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed animate-[slideUp_0.8s_ease-out_0.2s_both]">
      Hire players, coaches, referees and cameramen. Rent vehicles. Buy gear.
      One platform for every match.
    </p>

    {/* 4 Stats only */}
    <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-8 sm:mb-10 max-w-2xl mx-auto animate-[slideUp_0.8s_ease-out_0.3s_both]">
      {[
        { v: players.length, l: "Players" },
        { v: coaches.length, l: "Coaches" },
        { v: referees.length, l: "Referees" },
        { v: vehicles.length, l: "Vehicles" },
      ].map((s, i) => (
        <div key={i}
          className="bg-white/[0.05] backdrop-blur-md border border-white/10 rounded-2xl px-2 py-4 sm:px-4 sm:py-5 hover:bg-white/[0.09] hover:border-white/20 transition-all duration-300"
          style={{ animation: `counter-text 0.5s ease-out ${0.4 + i * 0.08}s both` }}>
          <div className="text-2xl sm:text-4xl font-bold text-white mb-0.5">{s.v}</div>
          <div className="text-[10px] sm:text-xs text-white/45 font-medium">{s.l}</div>
        </div>
      ))}
    </div>

    {/* CTAs */}
    <div className="flex flex-wrap gap-2.5 sm:gap-3 justify-center animate-[slideUp_0.8s_ease-out_0.5s_both]">
      <Link href="/players?playerType=player"
        className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base transition shadow-xl shadow-primary-900/50 hover:shadow-primary-800/60 hover:-translate-y-0.5">
        Browse Players
      </Link>
      <Link href="/team-builder"
        className="bg-white/[0.07] backdrop-blur-sm border border-white/15 hover:bg-white/[0.12] hover:border-white/25 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base transition hover:-translate-y-0.5">
        Build Your Team
      </Link>
      <Link href="/shop"
        className="bg-white/[0.07] backdrop-blur-sm border border-white/15 hover:bg-white/[0.12] hover:border-white/25 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base transition hover:-translate-y-0.5">
        Shop
      </Link>
    </div>
  </div>

  {/* Scroll cue */}
  {/* <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-2 animate-[bounce-subtle_2.5s_infinite]">
    <span className="text-[10px] text-white/25 tracking-widest">SCROLL</span>
    <div className="w-5 h-8 rounded-full border-2 border-white/15 flex items-start justify-center p-1.5">
      <div className="w-1 h-1.5 bg-white/40 rounded-full animate-[slideUp_1.5s_infinite]" />
    </div>
  </div> */}
</section>

<ForeignPlayersSection />

      {/* ─── SECTIONS ─── */}
      <Section title="Top Players" icon="⚽" link="/players?playerType=player" loading={loading} empty={players.length === 0}>
        <Grid>{players.slice(0, 4).map(p => <PlayerCard key={p.id} player={p} />)}</Grid>
      </Section>

      <Section title="Cameramen" icon="📷" link="/cameramen" loading={loading} empty={cameramen.length === 0} dark
        subtitle="Professional match coverage across Bangladesh">
        <Grid>{cameramen.slice(0, 4).map(c => <CameramanCard key={c.id} cameraman={c} />)}</Grid>
      </Section>

      <Section title="Vehicle Rental" icon="🚗" link="/vehicles" loading={loading} empty={vehicles.length === 0}
        subtitle="Transport for your team, any district">
        <Grid>{vehicles.slice(0, 4).map(v => <VehicleCard key={v.id} vehicle={v} />)}</Grid>
      </Section>

      <Section title="Sports Shop" icon="🛍️" link="/shop" loading={loading} empty={products.length === 0} dark
        subtitle="Gear up — jerseys, boots, balls and more">
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
  {products.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
</div>
      </Section>

      <Section title="Coaches" icon="🎓" link="/players?playerType=coach" loading={loading} empty={coaches.length === 0}>
        <Grid>{coaches.slice(0, 4).map(c => <PlayerCard key={c.id} player={c} />)}</Grid>
      </Section>

      <Section title="Referees" icon="🏁" link="/players?playerType=referee" loading={loading} empty={referees.length === 0} dark>
        <Grid>{referees.slice(0, 4).map(r => <PlayerCard key={r.id} player={r} />)}</Grid>
      </Section>

      {/* ─── CTA ─── */}
      <section className="py-12 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center glass rounded-2xl sm:rounded-3xl p-8 sm:p-16">
          <span className="text-4xl block mb-4">📝</span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 gradient-text">
            Join as Player, Coach, Referee or Cameraman
          </h2>
          <p className="text-white/60 mb-6 sm:mb-8 max-w-lg mx-auto text-sm sm:text-base">
            Create your profile, get discovered by clubs across Bangladesh, and start earning from your talent.
          </p>
          <Link href="/auth/register-player"
            className="btn-primary text-white px-8 py-3.5 sm:px-10 sm:py-4 rounded-xl font-bold text-base sm:text-lg inline-block">
            Register Now — It's Free
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Section({ title, icon, link, subtitle, loading, empty, dark, children }: {
  title: string; icon: string; link: string; subtitle?: string;
  loading: boolean; empty: boolean; dark?: boolean; children: React.ReactNode;
}) {
  const ref = useReveal();
  return (
    <section className={`py-12 sm:py-16 px-4 ${dark ? "bg-dark-card" : ""}`}>
      <div ref={ref} className="reveal max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-6 sm:mb-8">
          <div>
            <div className="section-line mb-3" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
              <span>{icon}</span> {title}
            </h2>
            {subtitle && <p className="text-white/30 text-xs sm:text-sm mt-1">{subtitle}</p>}
          </div>
          <Link href={link} className="text-primary-400 font-semibold text-xs sm:text-sm hover:text-primary-300 transition shrink-0">
            View All →
          </Link>
        </div>

        {loading ? <Loading text="" /> : empty ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">{icon}</p>
            <p className="text-white/30 text-sm">Nothing here yet — check back soon.</p>
          </div>
        ) : children}
      </div>
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-4 gap-2 sm:gap-4 lg:gap-6 stagger">{children}</div>;
}