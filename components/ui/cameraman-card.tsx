"use client";

import Link from "next/link";
import { Player } from "@/lib/types";
import { Stars } from "@/components/ui/player-card";

export default function CameramanCard({ cameraman: c }: { cameraman: Player }) {
  const photoCount = c.portfolioPhotos?.length || 0;
  const videoCount = c.portfolioVideos?.length || 0;

  return (
    <Link href={`/cameramen/${c.id}`}>
      <div className="bg-dark-card border border-dark-border rounded-lg sm:rounded-2xl overflow-hidden cursor-pointer card-hover group h-full flex flex-col">

        {/* Photo */}
        <div className="relative h-24 sm:h-40 lg:h-52 bg-gradient-to-br from-purple-900/40 to-dark overflow-hidden shrink-0">
          {c.photo ? (
            <img src={c.photo} alt={c.user?.name} className="w-full h-full object-cover img-zoom" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl sm:text-5xl font-bold text-white/20">
              {c.user?.name?.charAt(0) || "📷"}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-card via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-1 right-1 sm:top-3 sm:right-3 flex flex-col gap-1 items-end">
            <span className="bg-purple-600 text-white px-1 py-0.5 sm:px-2.5 sm:py-1 rounded sm:rounded-full text-[7px] sm:text-[11px] font-bold">
              📷<span className="hidden sm:inline"> Cameraman</span>
            </span>
            {c.hasDrone && (
              <span className="hidden sm:inline bg-black/60 backdrop-blur text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                🚁 Drone
              </span>
            )}
          </div>

          {!c.isAvailable && (
            <div className="absolute bottom-0 inset-x-0 bg-red-600/90 text-white text-center text-[7px] sm:text-xs font-bold py-0.5 sm:py-1.5">
              UNAVAILABLE
            </div>
          )}

          {/* Name overlay */}
          <div className="absolute bottom-1 left-1.5 right-1.5 sm:bottom-3 sm:left-4 sm:right-4">
            <h3 className="font-bold text-white text-[10px] sm:text-base lg:text-lg truncate drop-shadow-lg leading-tight">
              {c.user?.name}
            </h3>
          </div>
        </div>

        {/* Info */}
        <div className="p-1.5 sm:p-3 lg:p-4 flex flex-col flex-1">
          <div className="flex justify-between items-center gap-1 mb-1">
            <p className="text-purple-400 text-[8px] sm:text-xs font-semibold truncate">
              📍 {c.district || "Bangladesh"}
            </p>
            <span className="hidden sm:block shrink-0">
              {(c.reviews?.length ?? 0) > 0
                ? <Stars rating={c.rating} />
                : <span className="text-[10px] text-white/25">New</span>}
            </span>
          </div>

          {c.equipment && (
            <p className="hidden sm:block text-white/40 text-[11px] mb-2 truncate">
              🎥 {c.equipment}
            </p>
          )}

          {/* Portfolio counts — desktop only */}
          <div className="hidden sm:flex gap-1.5 mb-3 flex-wrap">
            <span className="bg-dark border border-dark-border px-2 py-0.5 rounded text-[10px] text-white/50">
              📸 {photoCount}
            </span>
            <span className="bg-dark border border-dark-border px-2 py-0.5 rounded text-[10px] text-white/50">
              🎬 {videoCount}
            </span>
            {c.doesEditing && (
              <span className="bg-dark border border-dark-border px-2 py-0.5 rounded text-[10px] text-white/50">
                ✂️ Editing
              </span>
            )}
          </div>

          <div className="border-t border-dark-border pt-1.5 sm:pt-3 mt-auto">
            {c.perMatchRate ? (
              <p className="text-primary-400 font-bold text-[11px] sm:text-base leading-tight">
                ৳{c.perMatchRate.toLocaleString()}
                <span className="text-white/30 text-[8px] sm:text-xs font-normal">/match</span>
              </p>
            ) : (
              <p className="text-white/30 text-[8px] sm:text-xs">On request</p>
            )}

            <div className="flex justify-between items-center mt-1 gap-1">
              <span className="text-white/40 text-[7px] sm:text-[11px]">
                {c.experience} yr exp
              </span>
              <span className={`px-1 py-0.5 sm:px-2 sm:py-0.5 rounded text-[7px] sm:text-[10px] font-semibold shrink-0 ${
                c.isAvailable
                  ? "bg-primary-900/50 text-primary-400 border border-primary-800"
                  : "bg-red-900/30 text-red-400 border border-red-900"
              }`}>
                {c.isAvailable ? "Free" : "Busy"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}