"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/navbar";
import Toast from "@/components/ui/toast";
import AvailabilityCalendar from "@/components/ui/availability-calendar";
import { playersAPI, bookingsAPI } from "@/lib/api";
import { useLang } from "@/lib/language-context";
import { useToast } from "@/lib/hooks";
import { Player } from "@/lib/types";

export default function HirePage() {
  const { playerId } = useParams();
  const router = useRouter();
  const { t } = useLang();
  const { toast, showToast } = useToast();

  const [player, setPlayer] = useState<Player | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const [matchDate, setMatchDate] = useState("");
  const [tournament, setTournament] = useState("");
  const [location, setLocation] = useState("");
  const [matchType, setMatchType] = useState("friendly");
  const [message, setMessage] = useState("");

  useEffect(() => {
    playersAPI.getOne(playerId as string)
      .then(r => setPlayer(r.data))
      .catch(() => router.push("/players"));
  }, [playerId]);

  const isDateUnavailable = (date: string) => player?.unavailableDates?.includes(date);

  const handleDateSelect = (date: string) => {
    if (isDateUnavailable(date)) {
      showToast("Player is not available on this date", "error");
      return;
    }
    setMatchDate(date);
    setShowCalendar(false);
  };

  const onSubmit = async () => {
    if (!matchDate) { showToast("Please select a match date", "error"); return; }
    if (!tournament.trim()) { showToast("Tournament name is required", "error"); return; }
    if (isDateUnavailable(matchDate)) { showToast("Player is not available on this date", "error"); return; }

    setSubmitting(true);
    try {
      await bookingsAPI.create({
        playerId,
        matchDate,
        tournament: tournament.trim(),
        matchType,
        message: `${location ? `Location: ${location}\n` : ""}${message}`,
      });
      showToast("Hire request submitted! Admin will confirm and share pricing.");
      setTimeout(() => router.push("/players"), 2500);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      showToast(Array.isArray(msg) ? msg[0] : (msg || "Failed"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!player) return <div className="min-h-screen bg-dark"><Navbar /><div className="pt-24 text-center text-white/30">Loading...</div></div>;

  const currentClub = player.clubs?.find(c => c.isCurrent);

  return (
    <div className="min-h-screen bg-dark text-white">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 pt-24 pb-16">
        <div className="glass rounded-2xl p-5 sm:p-8 animate-[scaleIn_0.4s_ease-out]">
          <h1 className="text-xl sm:text-2xl font-bold mb-6">
            {t("hire.title")} {player.user?.name}
          </h1>

          {/* Player Info */}
          <div className="flex items-center gap-4 p-4 bg-dark-card rounded-xl border border-dark-border mb-6">
            {player.photo ? (
              <img src={player.photo} alt="" className="w-14 h-14 rounded-xl object-cover" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-primary-800 flex items-center justify-center text-xl font-bold">
                {player.user?.name?.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-bold">{player.user?.name}</p>
              <p className="text-sm text-white/50">
                {player.position || player.playerType}
                {currentClub && ` • ${currentClub.name}`}
              </p>
            </div>
          </div>

          {/* Pricing note */}
          <div className="bg-primary-900/20 border border-primary-800 rounded-xl p-4 mb-6">
            <p className="text-sm text-primary-400 font-semibold mb-1">💬 About Pricing</p>
            <p className="text-xs text-white/50 leading-relaxed">
              Submit your request and our team will contact you with the final price based on match type, date, and duration.
            </p>
          </div>

          <div className="space-y-4">
            {/* Match Date with Calendar */}
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-1">
                {t("hire.matchDate")} *
              </label>
              <button
                type="button"
                onClick={() => setShowCalendar(!showCalendar)}
                className="w-full px-4 py-2.5 rounded-xl bg-dark-card border border-dark-border text-left flex justify-between items-center hover:border-primary-600 transition"
              >
                <span className={matchDate ? "text-white" : "text-white/30"}>
                  {matchDate || "Tap to select date"}
                </span>
                <span className="text-primary-400">📅</span>
              </button>

              {showCalendar && (
                <div className="mt-3 animate-[slideUp_0.3s_ease-out]">
                  <AvailabilityCalendar
                    unavailableDates={player.unavailableDates || []}
                    onToggleDate={handleDateSelect}
                  />
                  <p className="text-xs text-white/40 text-center mt-2">
                    Tap a green date to select
                  </p>
                </div>
              )}
            </div>

            {/* Tournament */}
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-1">
                {t("hire.tournament")} *
              </label>
              <input
                value={tournament}
                onChange={e => setTournament(e.target.value)}
                placeholder="e.g. Mirpur Cup 2026"
                className="w-full px-4 py-2.5 rounded-xl bg-dark-card border border-dark-border text-white"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-1">
                {t("auth.location")}
              </label>
              <input
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Ground / Venue name"
                className="w-full px-4 py-2.5 rounded-xl bg-dark-card border border-dark-border text-white"
              />
            </div>

            {/* Match Type */}
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2">
                {t("hire.matchType")}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { v: "friendly", l: t("charges.friendly"), i: "🤝" },
                  { v: "groupRound", l: t("charges.groupRound"), i: "🏅" },
                  { v: "final", l: t("charges.final"), i: "🏆" },
                ].map(mt => (
                  <button
                    key={mt.v}
                    type="button"
                    onClick={() => setMatchType(mt.v)}
                    className={`py-3 rounded-xl text-sm font-semibold transition border-2 ${
                      matchType === mt.v
                        ? "border-primary-500 bg-primary-900/30 text-primary-400"
                        : "border-dark-border bg-dark-card text-white/50 hover:border-white/20"
                    }`}
                  >
                    <span className="block text-lg mb-0.5">{mt.i}</span>
                    <span className="text-xs">{mt.l}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-1">
                {t("hire.message")}
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={3}
                placeholder="Any special requirements, timing, contact info..."
                className="w-full px-4 py-2.5 rounded-xl bg-dark-card border border-dark-border text-white"
              />
            </div>

            {/* Submit */}
            <button
              onClick={onSubmit}
              disabled={submitting}
              className="w-full btn-primary text-white py-3.5 rounded-xl font-bold text-lg disabled:opacity-50"
            >
              {submitting ? "Submitting..." : `⚡ ${t("hire.submit")}`}
            </button>
          </div>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}