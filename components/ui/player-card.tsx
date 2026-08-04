"use client";

import Link from "next/link";
import { Player, Tier, PlayerType } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";

const tierBg: Record<string, string> = {
  A: "bg-yellow-500",
  B: "bg-slate-400",
  C: "bg-amber-700",
};

const tierText: Record<string, string> = {
  A: "⭐ Tier A",
  B: "Tier B",
  C: "Tier C",
};

const typeBadge: Record<string, { icon: string; label: string; bg: string }> = {
  player: { icon: "⚽", label: "Player", bg: "bg-primary-600" },
  coach: { icon: "🎓", label: "Coach", bg: "bg-blue-600" },
  referee: { icon: "🏁", label: "Referee", bg: "bg-purple-600" },
  cameraman: { icon: "📷", label: "Cameraman", bg: "bg-pink-600" },
};

export function TierBadge({ tier, size = "sm" }: { tier: Tier; size?: "sm" | "lg" }) {
  return (
    <span
      className={`${tierBg[tier]} text-white ${
        size === "lg" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs"
      } rounded-full font-bold`}
    >
      {tierText[tier]}
    </span>
  );
}

export function TypeBadge({ playerType }: { playerType: PlayerType }) {
  const badge = typeBadge[playerType] || typeBadge.player;
  return (
    <span className={`${badge.bg} text-white px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1`}>
      {badge.icon} {badge.label}
    </span>
  );
}

export function Stars({ rating }: { rating: number }) {
  const full = Math.floor(Number(rating));
  return (
    <span className="inline-flex items-center gap-0.5 text-sm">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={i < full ? "text-yellow-400" : "text-white/20"}>★</span>
      ))}
      <span className="ml-1 text-white/50 font-semibold">{Number(rating).toFixed(1)}</span>
    </span>
  );
}

export default function PlayerCard({ player: p }: { player: Player }) {
  const { isInSquad, addToSquad, removeFromSquad } = useCart();
  const { isHirer } = useAuth();

  const currentClub = p.clubs?.find(c => c.isCurrent);
  const hasNational = (p.nationalTeams?.length ?? 0) > 0;
  const currentNational = p.nationalTeams?.find(n => n.isCurrent);
  const inSquad = isInSquad(p.id);

  const handleSquadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inSquad) removeFromSquad(p.id);
    else addToSquad(p);
  };

  return (
    <Link href={`/players/${p.id}`}>
      <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden cursor-pointer card-hover group relative">
        {/* Photo */}
        <div className="relative h-24 sm:h-44 lg:h-56 bg-gradient-to-br from-primary-900/50 to-dark overflow-hidden">
          {p.photo ? (
            <img
              src={p.photo}
              alt={p.user?.name}
              className="w-full h-full object-cover img-zoom opacity-90 group-hover:opacity-100"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-800 to-primary-950 flex items-center justify-center text-6xl font-bold text-white/20">
              {p.user?.name?.charAt(0) || "?"}
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-dark-card via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-1 right-1 sm:top-3 sm:right-3 flex flex-col gap-1 items-end">
  <span className={`${p.tier === "A" ? "bg-yellow-500" : p.tier === "B" ? "bg-slate-400" : "bg-amber-700"} text-white px-1.5 py-0.5 rounded text-[8px] sm:text-xs font-bold`}>
    {p.tier}
  </span>
  <span className="hidden sm:block"><TypeBadge playerType={p.playerType} /></span>
</div>

          {/* Position badge for players */}
          {p.playerType === "player" && p.position && (
  <div className="absolute top-1 left-1 sm:top-3 sm:left-3">
    <span className="bg-red-600 text-white px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded sm:rounded-full text-[8px] sm:text-[11px] font-bold">
      {p.position}
    </span>
  </div>
)}

          {!p.isAvailable && (
            <div className="absolute bottom-0 inset-x-0 bg-red-600/90 text-white text-center text-xs font-bold py-1.5 tracking-wide">
              UNAVAILABLE
            </div>
          )}

          {/* Name overlay */}
          <div className="absolute bottom-1 left-1.5 right-1.5 sm:bottom-3 sm:left-4 sm:right-4">
  <h3 className="font-bold text-white text-[10px] sm:text-base lg:text-xl truncate drop-shadow-lg leading-tight">
    {p.user?.name}
  </h3>
</div>
        </div>

        {/* Info */}
        {/* Info */}
<div className="p-1.5 sm:p-3 lg:p-4">
          <div className="flex justify-between items-center mb-1 sm:mb-3">
  <span className="text-primary-400 font-semibold text-[9px] sm:text-sm truncate">
              {p.playerType === "player"
                ? p.position
                : p.playerType === "coach"
                ? p.specialization || "Coach"
                : p.playerType === "referee"
                ? p.refereeLicense || "Referee"
                : "Cameraman"}
            </span>
            <span className="hidden sm:block">
  {(p.reviews?.length ?? 0) > 0 ? <Stars rating={p.rating} /> : <span className="text-xs text-white/30">No ratings</span>}
</span>
          </div>

          {currentClub && (
  <p className="text-white/50 text-[8px] sm:text-xs mb-1 truncate">{currentClub.name}</p>
)}

{hasNational && (
  <p className="hidden sm:block text-yellow-500/80 text-xs font-semibold mb-2">
    🇧🇩 {currentNational ? currentNational.level : "National Team"}
  </p>
)}

          <div className="flex justify-between items-center border-t border-dark-border pt-1.5 sm:pt-3 mt-1 gap-1">
  <span className="text-white/40 text-[8px] sm:text-xs truncate">
    {p.district || p.location || "BD"}
  </span>
  <span className={`px-1 py-0.5 sm:px-2.5 sm:py-1 rounded text-[7px] sm:text-xs font-semibold shrink-0 ${
    p.isAvailable
      ? "bg-primary-900/50 text-primary-400 border border-primary-800"
      : "bg-red-900/30 text-red-400 border border-red-900"
  }`}>
    {p.isAvailable ? "Free" : "Busy"}
  </span>
</div>

          {/* Add to Squad — hirers only, players only */}
          {isHirer && p.isAvailable && p.playerType === "player" && (
  <button onClick={handleSquadClick}
    className={`w-full mt-1.5 sm:mt-3 py-1 sm:py-2 rounded-lg sm:rounded-xl text-[8px] sm:text-sm font-semibold transition ${
      inSquad
        ? "bg-red-900/30 text-red-400 border border-red-800"
        : "bg-primary-900/30 text-primary-400 border border-primary-800"
    }`}>
    {inSquad ? "✕ Remove" : "+ Squad"}
  </button>
)}
        </div>
      </div>
    </Link>
  );
}