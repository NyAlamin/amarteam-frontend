"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import HeroSection from "@/components/ui/hero-section";
import PlayerCard from "@/components/ui/player-card";
import CameramanCard from "@/components/ui/cameraman-card";
import VehicleCard from "@/components/ui/vehicle-card";
import ProductCard from "@/components/ui/product-card";
import Loading from "@/components/ui/loading";
import { playersAPI, vehiclesAPI, shopAPI } from "@/lib/api";
import { useLang } from "@/lib/language-context";
import { Player, Vehicle, Product } from "@/lib/types";
import ForeignPlayersSection from "@/components/ui/foreign-players-section";
import PromoPopup from "@/components/ui/promo-popup";


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
  const [players, setPlayers] = useState<Player[]>([]);
  const [coaches, setCoaches] = useState<Player[]>([]);
  const [referees, setReferees] = useState<Player[]>([]);
  const [cameramen, setCameramen] = useState<Player[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      playersAPI.getAll({ playerType: "player", sort: "rating", isForeign: "false" }),
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

  return (
    <div className="min-h-screen bg-dark text-white pb-[70px] lg:pb-0">
      <Navbar />
      <PromoPopup />

      <HeroSection
        stats={{
          players: players.length,
          coaches: coaches.length,
          referees: referees.length,
          cameramen: cameramen.length,
          vehicles: vehicles.length,
        }}
      />

      <ForeignPlayersSection />

      <Section title="Deshi Top Players" icon="⚽" link="/players?playerType=player" loading={loading} empty={players.length === 0}>
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          {products.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </Section>

      <Section title="Coaches" icon="🎓" link="/players?playerType=coach" loading={loading} empty={coaches.length === 0}>
        <Grid>{coaches.slice(0, 4).map(c => <PlayerCard key={c.id} player={c} />)}</Grid>
      </Section>

      <Section title="Referees" icon="🏁" link="/players?playerType=referee" loading={loading} empty={referees.length === 0} dark>
        <Grid>{referees.slice(0, 4).map(r => <PlayerCard key={r.id} player={r} />)}</Grid>
      </Section>

      <section className="py-10 sm:py-20 px-3 sm:px-4">
        <div className="max-w-4xl mx-auto text-center glass rounded-2xl sm:rounded-3xl p-6 sm:p-16">
          <span className="text-3xl sm:text-4xl block mb-3 sm:mb-4">📝</span>
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 gradient-text">
            Join as Player, Coach, Referee or Cameraman
          </h2>
          <p className="text-white/60 mb-5 sm:mb-8 max-w-lg mx-auto text-sm">
            Create your profile, get discovered by clubs across Bangladesh, and start earning from your talent.
          </p>
          <Link href="/auth/register-player"
            className="btn-primary text-white px-6 py-3 sm:px-10 sm:py-4 rounded-xl font-bold text-sm sm:text-lg inline-block">
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
    <section className={`py-8 sm:py-16 px-3 sm:px-4 ${dark ? "bg-dark-card" : ""}`}>
      <div ref={ref} className="reveal max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-4 sm:mb-8">
          <div>
            <div className="section-line mb-2 sm:mb-3" />
            <h2 className="text-lg sm:text-3xl font-bold text-white flex items-center gap-1.5 sm:gap-2">
              <span className="text-base sm:text-2xl">{icon}</span> {title}
            </h2>
            {subtitle && <p className="text-white/30 text-[11px] sm:text-sm mt-0.5 sm:mt-1">{subtitle}</p>}
          </div>
          <Link href={link} className="text-primary-400 font-semibold text-[11px] sm:text-sm hover:text-primary-300 transition shrink-0">
            View All →
          </Link>
        </div>

        {loading ? <Loading text="" /> : empty ? (
          <div className="text-center py-8 sm:py-12">
            <p className="text-3xl sm:text-4xl mb-2 sm:mb-3">{icon}</p>
            <p className="text-white/30 text-xs sm:text-sm">Nothing here yet — check back soon.</p>
          </div>
        ) : children}
      </div>
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 lg:gap-6 stagger">{children}</div>;
}