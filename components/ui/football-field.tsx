"use client";

import { Player, FOOTBALL_POSITIONS } from "@/lib/types";
import { useLang } from "@/lib/language-context";

interface Props {
  selectedPositions: Record<string, Player[]>;
  onPositionClick: (positionKey: string) => void;
}

export default function FootballField({ selectedPositions, onPositionClick }: Props) {
  const { lang } = useLang();

  return (
    <div className="relative w-full max-w-sm mx-auto" style={{ aspectRatio: "3/5" }}>
      <svg viewBox="0 0 60 100" className="w-full h-full" preserveAspectRatio="none"
        style={{ filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.5))" }}>
        <defs>
          <pattern id="grass" x="0" y="0" width="60" height="10" patternUnits="userSpaceOnUse">
            <rect width="60" height="5" fill="#1e7e3c" />
            <rect y="5" width="60" height="5" fill="#1a7136" />
          </pattern>
        </defs>

        <rect x="0" y="0" width="60" height="100" fill="url(#grass)" rx="1" />
        <rect x="2" y="2" width="56" height="96" fill="none" stroke="white" strokeWidth="0.5" />
        <line x1="2" y1="50" x2="58" y2="50" stroke="white" strokeWidth="0.5" />
        <circle cx="30" cy="50" r="8" fill="none" stroke="white" strokeWidth="0.5" />
        <circle cx="30" cy="50" r="0.8" fill="white" />
        <rect x="13" y="2" width="34" height="14" fill="none" stroke="white" strokeWidth="0.5" />
        <rect x="21" y="2" width="18" height="6" fill="none" stroke="white" strokeWidth="0.5" />
        <path d="M 21 16 A 10 10 0 0 0 39 16" fill="none" stroke="white" strokeWidth="0.5" />
        <circle cx="30" cy="11" r="0.6" fill="white" />
        <rect x="13" y="84" width="34" height="14" fill="none" stroke="white" strokeWidth="0.5" />
        <rect x="21" y="92" width="18" height="6" fill="none" stroke="white" strokeWidth="0.5" />
        <path d="M 21 84 A 10 10 0 0 1 39 84" fill="none" stroke="white" strokeWidth="0.5" />
        <circle cx="30" cy="89" r="0.6" fill="white" />
        <path d="M 2 5 A 3 3 0 0 0 5 2" fill="none" stroke="white" strokeWidth="0.4" />
        <path d="M 55 2 A 3 3 0 0 0 58 5" fill="none" stroke="white" strokeWidth="0.4" />
        <path d="M 2 95 A 3 3 0 0 1 5 98" fill="none" stroke="white" strokeWidth="0.4" />
        <path d="M 55 98 A 3 3 0 0 1 58 95" fill="none" stroke="white" strokeWidth="0.4" />
      </svg>

      {/* Position markers */}
      {FOOTBALL_POSITIONS.map((pos, idx) => {
        const assigned = selectedPositions[pos.key] || [];
        const count = assigned.length;
        const first = assigned[0];

        return (
          <button
            key={pos.key}
            onClick={() => onPositionClick(pos.key)}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 group z-10"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              animation: `scaleIn 0.4s ease-out ${idx * 0.03}s both`,
            }}
          >
            {count > 0 ? (
              <div className="flex flex-col items-center relative">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 border-white shadow-xl overflow-hidden bg-primary-600 group-hover:scale-110 transition-transform">
                  {first.photo ? (
                    <img src={first.photo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">
                      {first.user?.name?.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Count badge if multiple */}
                {count > 1 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-yellow-500 border-2 border-white flex items-center justify-center text-[9px] font-bold text-white">
                    {count}
                  </span>
                )}

                <span className="text-[7px] sm:text-[9px] text-white font-bold mt-0.5 bg-black/70 px-1.5 py-0.5 rounded-full max-w-[54px] sm:max-w-[64px] truncate">
                  {count > 1 ? `${pos.key} ×${count}` : first.user?.name?.split(" ")[0]}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-600 border-2 border-red-400 flex items-center justify-center shadow-lg group-hover:bg-red-500 group-hover:scale-110 group-hover:border-white transition-all"
                  style={{ animation: `pulse-glow 3s ease-in-out infinite ${idx * 0.15}s` }}>
                  <span className="text-[8px] sm:text-[10px] font-bold text-white">{pos.key}</span>
                </div>
                <span className="text-[6px] sm:text-[8px] text-white/0 group-hover:text-white/90 mt-0.5 bg-black/60 px-1 rounded transition-all whitespace-nowrap absolute -bottom-4">
                  {lang === "bn" ? pos.labelBn : pos.label}
                </span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}