"use client";

import { useEffect, useState } from "react";
import { playersAPI } from "@/lib/api";
import AvailabilityCalendar from "@/components/ui/availability-calendar";
import Toast from "@/components/ui/toast";
import Loading from "@/components/ui/loading";
import { useToast } from "@/lib/hooks";

export default function PlayerAvailabilityPage() {
  const [unavailDates, setUnavailDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast, showToast } = useToast();

  useEffect(() => {
    playersAPI.getMyProfile().then(r => {
      setUnavailDates(r.data.unavailableDates || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const toggleDate = async (date: string) => {
    const wasUnavail = unavailDates.includes(date);
    const updated = wasUnavail
      ? unavailDates.filter(d => d !== date)
      : [...unavailDates, date].sort();

    setUnavailDates(updated);
    setSaving(true);
    try {
      await playersAPI.selfUpdate({ unavailableDates: updated });
      showToast(wasUnavail ? "✓ Now available" : "✕ Marked unavailable");
    } catch {
      showToast("Failed to save", "error");
      setUnavailDates(unavailDates);
    } finally { setSaving(false); }
  };

  const clearAll = async () => {
    setUnavailDates([]);
    setSaving(true);
    try { await playersAPI.selfUpdate({ unavailableDates: [] }); showToast("All dates available!"); }
    catch { showToast("Failed", "error"); }
    finally { setSaving(false); }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-4">
      {/* Info */}
      <div className="glass rounded-2xl p-4">
        <h2 className="font-bold mb-2 text-white">📅 My Availability</h2>
        <p className="text-sm text-primary-400 font-semibold mb-1">
          ✓ You're available by default on all dates
        </p>
        <p className="text-xs text-white/40">
          Tap any date to mark yourself unavailable. Tap again to make it available.
        </p>
      </div>

      {/* Calendar */}
      <div className="glass rounded-2xl p-4">
        <AvailabilityCalendar unavailableDates={unavailDates} onToggleDate={toggleDate} />
        {saving && <p className="text-center text-xs text-white/30 mt-3">Saving...</p>}
      </div>

      {/* Blocked Dates List */}
      <div className="glass rounded-2xl p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-sm text-white">🚫 Blocked Dates ({unavailDates.length})</h3>
          {unavailDates.length > 0 && (
            <button onClick={clearAll} className="text-primary-400 text-xs font-semibold hover:underline">
              Clear all
            </button>
          )}
        </div>

        {unavailDates.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-4">
            ✅ Available on all dates
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {unavailDates.map(d => (
              <span key={d} className="bg-red-900/30 text-red-400 border border-red-900 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                {d}
                <button onClick={() => toggleDate(d)} className="hover:text-red-200">✕</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}