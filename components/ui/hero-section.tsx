"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSettings } from "@/lib/settings-context";
import RequestPlayerCard from "./request-player-card";

interface HeroStats {
  players: number;
  coaches: number;
  referees: number;
  cameramen: number;
  vehicles: number;
}

const slides = [
  {
    badge: "TOP RATED TALENT",
    headline: "Hire Football\nTalent Instantly",
    sub: "Players, coaches, referees & cameramen — ready for your next match across Bangladesh.",
    cta1: { label: "Browse Players", href: "/players?playerType=player" },
    cta2: { label: "Build Your Team", href: "/team-builder" },
  },
  {
    badge: "VEHICLE RENTAL",
    headline: "Team Transport,\nSorted",
    sub: "Buses, microbuses & pickups available in every district. Book for match day or tournament travel.",
    cta1: { label: "Rent a Vehicle", href: "/vehicles" },
    cta2: { label: "View Fleet", href: "/vehicles" },
  },
  {
    badge: "SPORTS SHOP",
    headline: "Gear Up\nFor The Game",
    sub: "Jerseys, boots, balls and training equipment — everything your team needs, delivered.",
    cta1: { label: "Shop Now", href: "/shop" },
    cta2: { label: "View Deals", href: "/shop" },
  },
];

export default function HeroSection({ stats }: { stats: HeroStats }) {
  const { get } = useSettings();

  const heroImages = [
    get("heroImage1") || get("heroImage"),
    get("heroImage2"),
    get("heroImage3"),
  ];
  const logo = get("logo");

  const [current, setCurrent] = useState(0);

  const goTo = useCallback((idx: number) => {
    setCurrent(idx);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((p) => (p + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[current];
  const totalTalent = stats.players + stats.coaches + stats.referees + stats.cameramen;

  return (
    <section className="relative pt-[60px] sm:pt-[64px] lg:pt-[68px]">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 py-3 sm:py-6 lg:py-8">
        <div className="flex gap-5">

          {/* ─── MAIN HERO CARD ─── */}
          <div className="flex-1 relative rounded-2xl lg:rounded-3xl overflow-hidden min-h-[320px] sm:min-h-[380px] lg:min-h-[480px] bg-gradient-to-br from-[#0a1a0f] via-[#0d2818] to-[#0a1a0f]">

            {/* BG Image — per slide */}
            {heroImages[current] && (
              <>
                <div className="absolute inset-0" key={`bg-${current}`}>
                  <img
                    src={heroImages[current]}
                    alt=""
                    className="w-full h-full object-cover animate-[fadeSlideUp_0.6s_ease-out]"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a1a0f]/95 via-[#0a1a0f]/80 to-[#0a1a0f]/40 sm:to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1a0f]/70 via-transparent to-[#0a1a0f]/30" />
              </>
            )}

            {/* Ambient glow (no image for this slide) */}
            {!heroImages[current] && (
              <div className="absolute inset-0">
                <div className="absolute top-1/3 right-[10%] w-48 sm:w-72 h-48 sm:h-72 bg-primary-500/[0.07] rounded-full blur-[80px] sm:blur-[100px]" />
                <div className="absolute bottom-1/4 left-[15%] w-40 sm:w-60 h-40 sm:h-60 bg-primary-600/[0.05] rounded-full blur-[60px] sm:blur-[80px]" />
              </div>
            )}

            {/* Content */}
            <div className="relative z-10 flex h-full min-h-[320px] sm:min-h-[380px] lg:min-h-[480px]">

              {/* Left — text */}
              <div className="flex flex-col justify-center px-5 sm:px-8 lg:px-14 py-8 sm:py-10 lg:py-14 w-full lg:max-w-[620px]">

                {/* Badge */}
                <div key={`badge-${current}`} className="animate-[fadeSlideUp_0.5s_ease-out]">
                  <span className="inline-block px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-md bg-primary-500 text-white text-[10px] sm:text-xs font-bold tracking-wide">
                    {slide.badge}
                  </span>
                </div>

                {/* Headline */}
                <h1
                  key={`head-${current}`}
                  className="mt-3 sm:mt-5 text-[1.65rem] leading-[1.1] sm:text-4xl lg:text-[3.2rem] font-bold text-white whitespace-pre-line animate-[fadeSlideUp_0.5s_ease-out_0.08s_both]"
                >
                  {slide.headline}
                </h1>

                {/* Sub */}
                <p
                  key={`sub-${current}`}
                  className="mt-2.5 sm:mt-4 text-[13px] sm:text-[15px] text-white/50 leading-relaxed max-w-md animate-[fadeSlideUp_0.5s_ease-out_0.16s_both]"
                >
                  {slide.sub}
                </p>

                {/* CTAs */}
                <div
                  key={`cta-${current}`}
                  className="mt-5 sm:mt-7 flex gap-2.5 sm:gap-3 animate-[fadeSlideUp_0.5s_ease-out_0.24s_both]"
                >
                  <Link
                    href={slide.cta1.href}
                    className="bg-primary-500 hover:bg-primary-400 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-[13px] sm:text-sm transition-colors shadow-lg shadow-primary-900/40"
                  >
                    {slide.cta1.label}
                  </Link>
                  <Link
                    href={slide.cta2.href}
                    className="bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-[13px] sm:text-sm transition-colors"
                  >
                    {slide.cta2.label}
                  </Link>
                </div>

                {/* Dots */}
                <div className="mt-5 sm:mt-8 flex items-center gap-2">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      className={`h-[5px] rounded-full transition-all duration-300 ${
                        i === current
                          ? "w-7 bg-primary-500"
                          : "w-[5px] bg-white/20 hover:bg-white/35"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Right — artwork area (desktop only) */}
              <div className="hidden lg:flex flex-1 items-center justify-center relative">
                {!heroImages[current] && logo && (
                  <img
                    src={logo}
                    alt=""
                    className="h-36 mx-auto object-contain opacity-20 animate-[float_6s_ease-in-out_infinite]"
                  />
                )}
              </div>
            </div>
          </div>

          {/* ─── SIDE PANEL (xl desktop only) ─── */}
          <div className="hidden xl:flex flex-col gap-5 w-[300px] shrink-0">
            <RequestPlayerCard />

            {/* Join as Talent card */}
            <div className="rounded-2xl bg-dark-card border border-white/[0.07] p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-primary-500/15 flex items-center justify-center shrink-0 mt-0.5">
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-primary-400">
                    <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Join as Talent</p>
                  <p className="text-xs text-white/40 mt-0.5 leading-snug">
                    Register free. Get discovered by hirers across Bangladesh.
                  </p>
                </div>
              </div>
              <Link
                href="/auth/register-player"
                className="block text-center w-full bg-primary-500/15 hover:bg-primary-500/25 text-primary-400 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                Register Now →
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* ─── MOBILE SECTION ─── */}
      <div className="xl:hidden px-3 sm:px-4 space-y-3 pb-3 sm:pb-4">
        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
          {[
            { v: stats.players, l: "Players" },
            { v: stats.coaches, l: "Coaches" },
            { v: stats.referees, l: "Referees" },
            { v: stats.vehicles, l: "Vehicles" },
          ].map((s, i) => (
            <div key={i} className="bg-dark-card border border-white/[0.06] rounded-xl px-2 py-2.5 sm:py-3 text-center">
              <div className="text-base sm:text-xl font-bold text-white">{s.v}</div>
              <div className="text-[9px] sm:text-[10px] text-white/40 font-medium">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Request player card — mobile */}
        <RequestPlayerCard />
      </div>

      <style jsx>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-10px); }
        }
      `}</style>
    </section>
  );
}