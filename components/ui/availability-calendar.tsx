"use client";

import { useState } from "react";

interface CalendarProps {
  unavailableDates: string[];
  onToggleDate: (date: string) => void;
  readOnly?: boolean;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function AvailabilityCalendar({ unavailableDates, onToggleDate, readOnly = false }: CalendarProps) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const todayStr = today.toISOString().slice(0, 10);

  const fmt = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${viewYear}-${m}-${d}`;
  };

  const isPast = (day: number) => fmt(day) < todayStr;
  const isUnavailable = (day: number) => unavailableDates.includes(fmt(day));

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="bg-dark-card rounded-2xl border border-dark-border p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="w-9 h-9 rounded-lg hover:bg-white/5 flex items-center justify-center text-white/60 hover:text-white transition">
          ←
        </button>
        <div className="text-center">
          <p className="font-bold text-white">{MONTHS[viewMonth]}</p>
          <p className="text-xs text-white/40">{viewYear}</p>
        </div>
        <button onClick={nextMonth} className="w-9 h-9 rounded-lg hover:bg-white/5 flex items-center justify-center text-white/60 hover:text-white transition">
          →
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-bold text-white/30 py-1">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;

          const past = isPast(day);
          const unavail = isUnavailable(day);
          const isToday = fmt(day) === todayStr;

          return (
            <button
              key={i}
              disabled={past || readOnly}
              onClick={() => !past && !readOnly && onToggleDate(fmt(day))}
              className={`
                aspect-square rounded-lg text-sm font-semibold transition-all relative
                ${past ? "text-white/10 cursor-not-allowed" :
                  unavail ? "bg-red-900/40 text-red-400 border border-red-800 hover:bg-red-900/60" :
                  "bg-green-900/20 text-green-400 border border-green-900/40 hover:bg-green-900/40"}
                ${isToday ? "ring-2 ring-primary-500" : ""}
                ${readOnly ? "cursor-default" : "cursor-pointer active:scale-95"}
              `}
            >
              {day}
              {unavail && !past && (
                <span className="absolute top-0.5 right-0.5 text-[8px]">✕</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-dark-border">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-900/40 border border-green-900" />
          <span className="text-[10px] text-white/50">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-900/40 border border-red-800" />
          <span className="text-[10px] text-white/50">Unavailable</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded ring-2 ring-primary-500" />
          <span className="text-[10px] text-white/50">Today</span>
        </div>
      </div>
    </div>
  );
}