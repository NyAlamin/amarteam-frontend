"use client";

import Link from "next/link";
import { Vehicle, VEHICLE_TYPES } from "@/lib/types";
import { useLang } from "@/lib/language-context";

export default function VehicleCard({ vehicle: v }: { vehicle: Vehicle }) {
  const { lang } = useLang();
  const type = VEHICLE_TYPES.find(t => t.value === v.vehicleType);
  const photo = v.photos?.[0]?.url;

  return (
    <Link href={`/vehicles/${v.id}`}>
      <div className="bg-dark-card border border-dark-border rounded-lg sm:rounded-2xl overflow-hidden cursor-pointer card-hover group h-full flex flex-col">

        {/* Photo */}
        <div className="relative h-24 sm:h-36 lg:h-44 bg-gradient-to-br from-slate-800 to-dark overflow-hidden shrink-0">
          {photo ? (
            <img src={photo} alt={v.model} className="w-full h-full object-cover img-zoom" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl sm:text-5xl opacity-30">
              {type?.icon || "🚗"}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-card via-transparent to-transparent" />

          {/* Type + AC */}
          <div className="absolute top-1 left-1 sm:top-3 sm:left-3 flex gap-1">
            <span className="bg-black/60 backdrop-blur text-white px-1 py-0.5 sm:px-2.5 sm:py-1 rounded text-[7px] sm:text-[11px] font-bold">
              {type?.icon}
              <span className="hidden sm:inline"> {lang === "bn" ? type?.labelBn : type?.label}</span>
            </span>
            {v.hasAc && (
              <span className="hidden sm:inline bg-blue-600/80 backdrop-blur text-white px-2 py-1 rounded-lg text-[11px] font-bold">
                ❄️ AC
              </span>
            )}
          </div>

          {/* Seats */}
          <div className="absolute top-1 right-1 sm:top-3 sm:right-3">
            <span className="bg-primary-600 text-white px-1 py-0.5 sm:px-2.5 sm:py-1 rounded text-[7px] sm:text-[11px] font-bold">
              {v.seats}<span className="hidden sm:inline"> seats</span>
            </span>
          </div>

          {!v.isAvailable && (
            <div className="absolute bottom-0 inset-x-0 bg-red-600/90 text-white text-center text-[7px] sm:text-xs font-bold py-0.5 sm:py-1.5">
              UNAVAILABLE
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-1.5 sm:p-3 lg:p-4 flex flex-col flex-1">
          <h3 className="font-bold text-white text-[10px] sm:text-sm lg:text-base truncate mb-0.5 sm:mb-1 leading-tight">
            {v.model}
          </h3>

          {v.description && (
            <p className="hidden sm:block text-white/40 text-xs line-clamp-2 mb-3">
              {v.description}
            </p>
          )}

          <div className="border-t border-dark-border pt-1.5 sm:pt-3 mt-auto">
            <p className="text-primary-400 font-bold text-[11px] sm:text-base lg:text-lg leading-tight">
              ৳{v.basePerDay.toLocaleString()}
              <span className="text-white/30 text-[8px] sm:text-xs font-normal">/day</span>
            </p>

            <div className="flex justify-between items-center mt-1 gap-1">
              <span className="text-white/30 text-[7px] sm:text-[11px] truncate">
                {v.baseDistrict || "Dhaka"}
              </span>
              <span className={`px-1 py-0.5 sm:px-2.5 sm:py-1 rounded text-[7px] sm:text-[11px] font-semibold shrink-0 ${
                v.isAvailable
                  ? "bg-primary-900/50 text-primary-400 border border-primary-800"
                  : "bg-red-900/30 text-red-400 border border-red-900"
              }`}>
                {v.isAvailable ? "Free" : "Busy"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}