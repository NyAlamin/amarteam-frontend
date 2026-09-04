//app/cart/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import FootballField from "@/components/ui/football-field";
import PositionPicker from "@/components/ui/position-picker";
import Toast from "@/components/ui/toast";
import { playersAPI, teamRequestsAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { useLang } from "@/lib/language-context";
import { useToast } from "@/lib/hooks";
import { Player, FOOTBALL_POSITIONS } from "@/lib/types";

export default function CartPage() {
  const router = useRouter();
  const { user, isHirer } = useAuth();
  const { squad, removeFromSquad, clearSquad, addToSquad } = useCart();
  const { t, lang } = useLang();
  const { toast, showToast } = useToast();

  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [positions, setPositions] = useState<Record<string, Player[]>>({});
  const [pickerOpen, setPickerOpen] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const [phone, setPhone] = useState("");
  const [matchDate, setMatchDate] = useState("");
  const [tournament, setTournament] = useState("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    playersAPI.getAll({ playerType: "player", available: "true" })
      .then(r => setAllPlayers(r.data))
      .catch(() => {});
  }, []);

  // Auto-assign squad players to their exact position
  useEffect(() => {
    if (squad.length === 0) return;

    const assigned: Record<string, Player[]> = { ...positions };
    const alreadyIn = Object.values(assigned).flat().map(p => p.id);

    squad.forEach((item: any) => {
      if (alreadyIn.includes(item.player.id)) return;
      const key = item.player.position;
      if (!key) return;
      assigned[key] = [...(assigned[key] || []), item.player];
    });

    setPositions(assigned);
  }, [squad]);

  const handlePositionClick = (key: string) => {
    if (!matchDate) {
      showToast("Please select match date first", "warning");
      return;
    }
    setPickerOpen(key);
  };

  const togglePlayer = (key: string, player: Player) => {
    const current = positions[key] || [];
    const exists = current.some(p => p.id === player.id);
    if (exists) {
      setPositions({ ...positions, [key]: current.filter(p => p.id !== player.id) });
      removeFromSquad(player.id);
    } else {
      setPositions({ ...positions, [key]: [...current, player] });
      addToSquad(player);
    }
  };

  const removeFromPosition = (key: string, playerId: string) => {
    setPositions({ ...positions, [key]: (positions[key] || []).filter(p => p.id !== playerId) });
    removeFromSquad(playerId);
  };

  const assignedFlat = Object.entries(positions).flatMap(([key, arr]) =>
    arr.map(p => ({ key, player: p }))
  );
  const assignedCount = assignedFlat.length;
  const assignedIds = assignedFlat.map(a => a.player.id);
  const unassigned = squad.filter((i: any) => !assignedIds.includes(i.player.id));

  const saveDraft = () => {
    const positionIds: Record<string, string[]> = {};
    Object.entries(positions).forEach(([k, arr]) => {
      if (arr.length > 0) positionIds[k] = arr.map(p => p.id);
    });
    sessionStorage.setItem("cart-draft", JSON.stringify({
      matchDate, tournament, location, budget, message, positionIds,
    }));
  };

  const onSubmit = async () => {
    if (!matchDate) { showToast("Select a match date", "error"); return; }
    if (!/^01\d{9}$/.test(phone)) { showToast("Enter a valid BD phone number (01XXXXXXXXX)", "error"); return; }
    if (assignedCount === 0) { showToast("Assign at least one player", "error"); return; }

    if (!user) { saveDraft(); setShowLoginPrompt(true); return; }
    if (!isHirer) { showToast("Only hirers can submit requests", "error"); return; }

    setSubmitting(true);
    try {
      await teamRequestsAPI.create({
  matchDate,
  tournament: tournament || undefined,
  location: location || undefined,
  budget: budget ? Number(budget) : 0,
  playersNeeded: assignedCount,
  phone,
  message: message || undefined,
  squad: assignedFlat.map(({ key, player }) => ({
    positionKey: key,
    playerId: player.id,
    playerName: player.user?.name || "",
    playerPosition: player.position || "",
  })),
});
      clearSquad();
      setPositions({});
      sessionStorage.removeItem("cart-draft");
      showToast("Request submitted! We'll call you soon.");
      setTimeout(() => router.push("/"), 2500);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      showToast(Array.isArray(msg) ? msg[0] : (msg || "Failed"), "error");
    } finally { setSubmitting(false); }
  };

  const goToAuth = (path: string) => { saveDraft(); router.push(path); };
  const pickerPos = pickerOpen ? FOOTBALL_POSITIONS.find(p => p.key === pickerOpen) : null;

  return (
    <div className="min-h-screen bg-dark text-white">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="text-center mb-8 animate-[slideUp_0.6s_ease-out]">
          <span className="text-4xl block mb-2">🛒</span>
          <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">My Squad</h1>
          <p className="text-white/40 text-sm">
            {assignedCount > 0
              ? `${assignedCount} player${assignedCount > 1 ? "s" : ""} in your squad`
              : "Add players from the players page or tap positions below"}
          </p>
        </div>

        {squad.length === 0 && assignedCount === 0 ? (
          /* Empty state */
          <div className="glass rounded-2xl p-10 text-center animate-[scaleIn_0.4s_ease-out]">
            <span className="text-5xl block mb-4">⚽</span>
            <h3 className="font-bold text-lg mb-2">Your squad is empty</h3>
            <p className="text-white/40 text-sm mb-6">
              Browse players and add them to your squad, or start from the pitch
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/players?playerType=player"
                className="btn-primary text-white px-6 py-3 rounded-xl font-bold">
                Browse Players
              </Link>
              <button onClick={() => setMatchDate(new Date().toISOString().slice(0, 10))}
                className="btn-outline text-white px-6 py-3 rounded-xl font-bold">
                Start from Pitch
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT — Match info + Field */}
            <div className="space-y-4">
              {/* Match Details */}
              <div className="glass rounded-2xl p-4 sm:p-6 animate-[slideUp_0.6s_ease-out_0.1s_both]">
                <h3 className="font-semibold mb-3">📋 Match Details</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold text-white/50 mb-1">Match Date *</label>
                    <input type="date" value={matchDate} onChange={e => setMatchDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-dark-card border border-dark-border text-white text-sm outline-none focus:border-primary-500" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold text-white/50 mb-1">Tournament</label>
                    <input value={tournament} onChange={e => setTournament(e.target.value)} placeholder="Mirpur Cup"
                      className="w-full px-3 py-2.5 rounded-xl bg-dark-card border border-dark-border text-white text-sm outline-none focus:border-primary-500" />
                  </div>

                  <div className="col-span-2">
                  <label className="block text-xs font-semibold text-white/50 mb-1">Phone Number *</label>
                 <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="01XXXXXXXXX" maxLength={11}
                   className="w-full px-3 py-2.5 rounded-xl bg-dark-card border border-dark-border text-white text-sm outline-none focus:border-primary-500" />
                 <p className="text-[10px] text-white/25 mt-1">We'll call to confirm pricing and match details</p>
               </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/50 mb-1">Location</label>
                    <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Venue"
                      className="w-full px-3 py-2.5 rounded-xl bg-dark-card border border-dark-border text-white text-sm outline-none focus:border-primary-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/50 mb-1">Budget (optional)</label>
                    <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="৳"
                      className="w-full px-3 py-2.5 rounded-xl bg-dark-card border border-dark-border text-white text-sm outline-none focus:border-primary-500" />
                  </div>
                </div>
              </div>

              {/* Football Field */}
              <div className="glass rounded-2xl p-4 sm:p-6 animate-[slideUp_0.6s_ease-out_0.2s_both]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-sm sm:text-base">⚽ Formation</h3>
                  <span className="text-xs text-primary-400 font-bold">{assignedCount} assigned</span>
                </div>

                {!matchDate ? (
                  <div className="text-center py-12">
                    <p className="text-4xl mb-3">📅</p>
                    <p className="text-white/30 text-sm">Select a match date to start</p>
                  </div>
                ) : (
                  <>
                    <FootballField selectedPositions={positions} onPositionClick={handlePositionClick} />
                    <p className="text-center text-xs text-white/30 mt-4">
                      Tap red positions • multiple players per position allowed
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* RIGHT — Squad list + Submit */}
            <div className="space-y-4">
              {/* Squad List */}
              <div className="glass rounded-2xl p-4 sm:p-6 animate-[slideUp_0.6s_ease-out_0.3s_both]">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">👥 Squad List ({assignedCount})</h3>
                  {assignedCount > 0 && (
                    <button onClick={() => { clearSquad(); setPositions({}); }}
                      className="text-red-400 text-xs font-semibold hover:underline">
                      Clear all
                    </button>
                  )}
                </div>

                {assignedCount === 0 ? (
                  <p className="text-white/30 text-sm text-center py-8">
                    Tap positions on the pitch to assign players
                  </p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {assignedFlat.map(({ key, player }) => {
                      const pos = FOOTBALL_POSITIONS.find(p => p.key === key);
                      return (
                        <div key={`${key}-${player.id}`}
                          className="flex items-center gap-3 p-3 bg-dark-card rounded-xl border border-dark-border">
                          <span className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                            {key}
                          </span>
                          {player.photo ? (
                            <img src={player.photo} alt="" className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary-800 flex items-center justify-center text-xs font-bold text-white">
                              {player.user?.name?.charAt(0)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{player.user?.name}</p>
                            <p className="text-xs text-white/40">
                              {lang === "bn" ? pos?.labelBn : pos?.label}
                            </p>
                          </div>
                          <button onClick={() => removeFromPosition(key, player.id)}
                            className="text-red-400 text-sm shrink-0 hover:text-red-300">✕</button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Unassigned players */}
              {unassigned.length > 0 && (
                <div className="glass rounded-2xl p-4 animate-[fadeIn_0.4s_ease-out]">
                  <h4 className="text-xs font-semibold text-yellow-400 mb-2">
                    ⚠️ Unassigned Players ({unassigned.length})
                  </h4>
                  <div className="space-y-1.5">
                    {unassigned.map((item: any) => (
                      <div key={item.player.id} className="flex items-center gap-2 text-sm">
                        <span className="text-white/60 flex-1 truncate">{item.player.user?.name}</span>
                        <span className="text-xs text-white/30">{item.player.position}</span>
                        <button onClick={() => removeFromSquad(item.player.id)}
                          className="text-red-400 text-xs">✕</button>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-white/30 mt-2">
                    Tap their position on the pitch to assign them
                  </p>
                </div>
              )}

              {/* Notes */}
              <div className="glass rounded-2xl p-4 sm:p-6 animate-[slideUp_0.6s_ease-out_0.4s_both]">
                <h3 className="font-semibold mb-3">📝 Additional Notes</h3>
                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3}
                  placeholder="Any special requirements..."
                  className="w-full px-3 py-2.5 rounded-xl bg-dark-card border border-dark-border text-white text-sm outline-none focus:border-primary-500" />
              </div>

              {/* Login hint */}
              {!user && assignedCount > 0 && (
                <div className="bg-primary-900/20 border border-primary-800 rounded-2xl p-4 text-center animate-[fadeIn_0.4s_ease-out]">
                  <p className="text-sm text-primary-400 font-semibold mb-1">👋 Almost there!</p>
                  <p className="text-xs text-white/50">You'll need an account to submit. Your squad is saved.</p>
                </div>
              )}

              {/* Submit */}
              <button onClick={onSubmit} disabled={submitting || assignedCount === 0}
                className="w-full btn-primary text-white py-4 rounded-2xl font-bold text-lg disabled:opacity-40 animate-[slideUp_0.6s_ease-out_0.5s_both]">
                {submitting ? "Submitting..." : `📩 Submit Request (${assignedCount})`}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Login Prompt */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9000] p-4"
          onClick={() => setShowLoginPrompt(false)}>
          <div onClick={e => e.stopPropagation()}
            className="glass rounded-2xl p-6 sm:p-8 w-full max-w-sm text-center animate-[scaleIn_0.3s_ease-out]">
            <span className="text-4xl block mb-3">🔐</span>
            <h3 className="text-xl font-bold mb-2">Almost Done!</h3>
            <p className="text-white/50 text-sm mb-1">
              Your squad of <span className="text-primary-400 font-bold">{assignedCount} players</span> is ready.
            </p>
            <p className="text-white/40 text-xs mb-6">
              Create an account or login to submit. We've saved your selection.
            </p>
            <div className="space-y-2">
              <button onClick={() => goToAuth("/auth/register")}
                className="w-full btn-primary text-white py-3 rounded-xl font-bold">Create Account</button>
              <button onClick={() => goToAuth("/auth/login")}
                className="w-full btn-outline text-white py-3 rounded-xl font-bold">I Already Have an Account</button>
              <button onClick={() => setShowLoginPrompt(false)}
                className="w-full text-white/40 py-2 text-sm hover:text-white/60">Keep Editing</button>
            </div>
          </div>
        </div>
      )}

      {/* Position Picker */}
      {pickerOpen && pickerPos && (
        <PositionPicker
          open={true}
          onClose={() => setPickerOpen(null)}
          positionKey={pickerOpen}
          positionLabel={lang === "bn" ? pickerPos.labelBn : pickerPos.label}
          players={allPlayers}
          selected={positions[pickerOpen] || []}
          onToggle={(p) => togglePlayer(pickerOpen, p)}
        />
      )}

      <Footer />
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}