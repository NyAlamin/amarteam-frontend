"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import FootballField from "@/components/ui/football-field";
import PositionPicker from "@/components/ui/position-picker";
import PlayerCard, { Stars, TierBadge } from "@/components/ui/player-card";
import Toast from "@/components/ui/toast";
import { playersAPI, teamRequestsAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/language-context";
import { useToast } from "@/lib/hooks";
import { Player, FOOTBALL_POSITIONS } from "@/lib/types";

export default function TeamBuilderPage() {
  const router = useRouter();
  const { isHirer, user, loading: authLoading } = useAuth();
  const { t, lang } = useLang();
  const { toast, showToast } = useToast();

  const [players, setPlayers] = useState<Player[]>([]);
  const [coaches, setCoaches] = useState<Player[]>([]);
  const [referees, setReferees] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [positions, setPositions] = useState<Record<string, Player[]>>({});
  const [pickedCoaches, setPickedCoaches] = useState<Player[]>([]);
  const [pickedReferees, setPickedReferees] = useState<Player[]>([]);
  const [pickerOpen, setPickerOpen] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const [matchDate, setMatchDate] = useState("");
  const [tournament, setTournament] = useState("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    Promise.all([
      playersAPI.getAll({ playerType: "player", available: "true" }),
      playersAPI.getAll({ playerType: "coach", available: "true" }),
      playersAPI.getAll({ playerType: "referee", available: "true" }),
    ]).then(([p, c, r]) => {
      setPlayers(p.data); setCoaches(c.data); setReferees(r.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Restore draft
  useEffect(() => {
    const saved = sessionStorage.getItem("team-draft");
    if (saved && players.length > 0) {
      try {
        const d = JSON.parse(saved);
        setMatchDate(d.matchDate || "");
        setTournament(d.tournament || "");
        setLocation(d.location || "");
        setBudget(d.budget || "");
        setMessage(d.message || "");
        if (d.positionIds) {
          const restored: Record<string, Player[]> = {};
          Object.entries(d.positionIds).forEach(([k, ids]: [string, any]) => {
            restored[k] = (ids as string[]).map(id => players.find(p => p.id === id)).filter(Boolean) as Player[];
          });
          setPositions(restored);
        }
      } catch {}
    }
  }, [players]);

  const saveDraft = () => {
    const positionIds: Record<string, string[]> = {};
    Object.entries(positions).forEach(([k, arr]) => {
      if (arr.length > 0) positionIds[k] = arr.map(p => p.id);
    });
    sessionStorage.setItem("team-draft", JSON.stringify({
      matchDate, tournament, location, budget, message, positionIds,
    }));
  };

  const handlePositionClick = (key: string) => {
    if (!matchDate) { showToast("Select match date first", "warning"); return; }
    setPickerOpen(key);
  };

  const togglePlayer = (key: string, player: Player) => {
    const current = positions[key] || [];
    const exists = current.some(p => p.id === player.id);
    setPositions({
      ...positions,
      [key]: exists ? current.filter(p => p.id !== player.id) : [...current, player],
    });
  };

  const removeFromPosition = (key: string, playerId: string) => {
    setPositions({ ...positions, [key]: (positions[key] || []).filter(p => p.id !== playerId) });
  };

  const toggleStaff = (person: Player, type: "coach" | "referee") => {
    const list = type === "coach" ? pickedCoaches : pickedReferees;
    const setter = type === "coach" ? setPickedCoaches : setPickedReferees;
    const exists = list.some(p => p.id === person.id);
    setter(exists ? list.filter(p => p.id !== person.id) : [...list, person]);
  };

  const allSelected = Object.entries(positions).flatMap(([key, arr]) =>
    arr.map(p => ({ key, player: p }))
  );
  const selectedCount = allSelected.length;
  const totalPeople = selectedCount + pickedCoaches.length + pickedReferees.length;

  const quickAdd = (player: Player) => {
    if (!matchDate) { showToast("Select match date first", "warning"); return; }
    const key = player.position;
    const current = positions[key] || [];
    if (current.some(p => p.id === player.id)) {
      showToast("Already in your squad", "warning");
      return;
    }
    setPositions({ ...positions, [key]: [...current, player] });
    showToast(`${player.user?.name} added at ${key}`);
  };

  const onSubmit = async () => {
    if (!matchDate) { showToast("Select a match date", "error"); return; }
    if (totalPeople === 0) { showToast("Select at least one person", "error"); return; }

    if (!user) { saveDraft(); setShowLoginPrompt(true); return; }
    if (!isHirer) { showToast("Only hirers can submit requests", "error"); return; }

    setSubmitting(true);
    try {
      const squad = [
        ...allSelected.map(({ key, player }) => ({
          positionKey: key,
          playerId: player.id,
          playerName: player.user?.name || "",
          playerPosition: player.position || "",
        })),
        ...pickedCoaches.map(c => ({
          positionKey: "COACH",
          playerId: c.id,
          playerName: c.user?.name || "",
          playerPosition: c.specialization || "Coach",
        })),
        ...pickedReferees.map(r => ({
          positionKey: "REFEREE",
          playerId: r.id,
          playerName: r.user?.name || "",
          playerPosition: r.refereeLicense || "Referee",
        })),
      ];

      await teamRequestsAPI.create({
        matchDate,
        tournament: tournament || undefined,
        location: location || undefined,
        budget: budget ? Number(budget) : 0,
        playersNeeded: totalPeople,
        message: message || undefined,
        squad,
      });

      sessionStorage.removeItem("team-draft");
      showToast("Request submitted! We'll call you soon.");
      setTimeout(() => router.push("/"), 2500);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      showToast(Array.isArray(msg) ? msg[0] : (msg || "Failed"), "error");
    } finally { setSubmitting(false); }
  };

  const goToAuth = (path: string) => { saveDraft(); router.push(path); };
  const pickerPos = pickerOpen ? FOOTBALL_POSITIONS.find(p => p.key === pickerOpen) : null;
  const topPlayers = [...players].sort((a, b) => Number(b.rating) - Number(a.rating)).slice(0, 8);

  return (
    <div className="min-h-screen bg-dark text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="text-center mb-8 animate-[slideUp_0.6s_ease-out]">
          <span className="text-4xl block mb-2">🏆</span>
          <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">{t("team.title")}</h1>
          <p className="text-white/40 text-sm">Build your squad — no login needed to browse</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* LEFT — Match info + Field */}
          <div className="lg:col-span-5 space-y-4">
            {/* Match Details */}
            <div className="glass rounded-2xl p-4 sm:p-5 animate-[slideUp_0.6s_ease-out_0.1s_both]">
              <h3 className="font-semibold mb-3">📋 Match Details</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-white/50 mb-1">Match Date *</label>
                  <input type="date" value={matchDate} onChange={e => setMatchDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-dark-card border border-dark-border text-white text-sm outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1">Tournament</label>
                  <input value={tournament} onChange={e => setTournament(e.target.value)} placeholder="Mirpur Cup"
                    className="w-full px-3 py-2.5 rounded-xl bg-dark-card border border-dark-border text-white text-sm outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1">Location</label>
                  <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Venue"
                    className="w-full px-3 py-2.5 rounded-xl bg-dark-card border border-dark-border text-white text-sm outline-none focus:border-primary-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-white/50 mb-1">Budget (optional)</label>
                  <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="৳"
                    className="w-full px-3 py-2.5 rounded-xl bg-dark-card border border-dark-border text-white text-sm outline-none focus:border-primary-500" />
                </div>
              </div>
            </div>

            {/* Field */}
            <div className="glass rounded-2xl p-4 sm:p-5 animate-[slideUp_0.6s_ease-out_0.2s_both]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-sm sm:text-base">⚽ Tap a position</h3>
                <span className="text-xs text-primary-400 font-bold">{selectedCount} players</span>
              </div>

              {!matchDate ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">📅</p>
                  <p className="text-white/30 text-sm">Select a match date to start</p>
                </div>
              ) : loading ? (
                <div className="text-center py-12 text-white/30 text-sm">Loading...</div>
              ) : (
                <>
                  <FootballField selectedPositions={positions} onPositionClick={handlePositionClick} />
                  <p className="text-center text-xs text-white/30 mt-4">
                    Tap red positions • you can add multiple players per position
                  </p>
                </>
              )}
            </div>
          </div>

          {/* MIDDLE — Squad list */}
          <div className="lg:col-span-4 space-y-4">
            <div className="glass rounded-2xl p-4 sm:p-5 animate-[slideUp_0.6s_ease-out_0.3s_both]">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">👥 Squad ({selectedCount})</h3>
                {selectedCount > 0 && (
                  <button onClick={() => setPositions({})} className="text-red-400 text-xs font-semibold hover:underline">
                    Clear
                  </button>
                )}
              </div>

              {selectedCount === 0 ? (
                <p className="text-white/30 text-sm text-center py-8">Tap the pitch to add players</p>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {allSelected.map(({ key, player }) => {
                    const pos = FOOTBALL_POSITIONS.find(p => p.key === key);
                    return (
                      <div key={`${key}-${player.id}`}
                        className="flex items-center gap-3 p-2.5 bg-dark-card rounded-xl border border-dark-border">
                        <span className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                          {key}
                        </span>
                        {player.photo ? (
                          <img src={player.photo} alt="" className="w-9 h-9 rounded-full object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-primary-800 flex items-center justify-center text-xs font-bold">
                            {player.user?.name?.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{player.user?.name}</p>
                          <p className="text-[10px] text-white/40">{lang === "bn" ? pos?.labelBn : pos?.label}</p>
                        </div>
                        <button onClick={() => removeFromPosition(key, player.id)}
                          className="text-red-400 text-sm shrink-0">✕</button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="glass rounded-2xl p-4 sm:p-5 animate-[slideUp_0.6s_ease-out_0.4s_both]">
              <h3 className="font-semibold mb-3">📝 Notes</h3>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3}
                placeholder="Special requirements..."
                className="w-full px-3 py-2.5 rounded-xl bg-dark-card border border-dark-border text-white text-sm outline-none focus:border-primary-500" />
            </div>

            {!authLoading && !user && totalPeople > 0 && (
              <div className="bg-primary-900/20 border border-primary-800 rounded-2xl p-4 text-center">
                <p className="text-sm text-primary-400 font-semibold mb-1">👋 Almost there!</p>
                <p className="text-xs text-white/50">Account needed to submit. Squad is saved.</p>
              </div>
            )}

            <button onClick={onSubmit} disabled={submitting || totalPeople === 0}
              className="w-full btn-primary text-white py-4 rounded-2xl font-bold text-lg disabled:opacity-40">
              {submitting ? "Submitting..." : `📩 Submit Request (${totalPeople})`}
            </button>
          </div>

          {/* RIGHT — Coaches & Referees */}
          <div className="lg:col-span-3 space-y-4">
            {/* Coaches */}
            <div className="glass rounded-2xl p-4 animate-[slideUp_0.6s_ease-out_0.5s_both]">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-sm">🎓 Coaches</h3>
                {pickedCoaches.length > 0 && (
                  <span className="bg-blue-900/40 text-blue-400 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {pickedCoaches.length}
                  </span>
                )}
              </div>

              {coaches.length === 0 ? (
                <p className="text-white/25 text-xs text-center py-6">No coaches available</p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {coaches.map(c => {
                    const sel = pickedCoaches.some(p => p.id === c.id);
                    return (
                      <button key={c.id} onClick={() => toggleStaff(c, "coach")}
                        className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl transition text-left border ${
                          sel ? "bg-blue-900/30 border-blue-700" : "bg-dark-card border-dark-border hover:border-white/20"
                        }`}>
                        {c.photo ? (
                          <img src={c.photo} alt="" className="w-9 h-9 rounded-full object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-blue-800 flex items-center justify-center text-xs font-bold">
                            {c.user?.name?.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-xs truncate">{c.user?.name}</p>
                          <p className="text-[10px] text-white/35 truncate">{c.specialization || "Coach"}</p>
                        </div>
                        <span className={`text-sm shrink-0 ${sel ? "text-blue-400" : "text-white/20"}`}>
                          {sel ? "✓" : "+"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Referees */}
            <div className="glass rounded-2xl p-4 animate-[slideUp_0.6s_ease-out_0.6s_both]">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-sm">🏁 Referees</h3>
                {pickedReferees.length > 0 && (
                  <span className="bg-purple-900/40 text-purple-400 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {pickedReferees.length}
                  </span>
                )}
              </div>

              {referees.length === 0 ? (
                <p className="text-white/25 text-xs text-center py-6">No referees available</p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {referees.map(r => {
                    const sel = pickedReferees.some(p => p.id === r.id);
                    return (
                      <button key={r.id} onClick={() => toggleStaff(r, "referee")}
                        className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl transition text-left border ${
                          sel ? "bg-purple-900/30 border-purple-700" : "bg-dark-card border-dark-border hover:border-white/20"
                        }`}>
                        {r.photo ? (
                          <img src={r.photo} alt="" className="w-9 h-9 rounded-full object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-purple-800 flex items-center justify-center text-xs font-bold">
                            {r.user?.name?.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-xs truncate">{r.user?.name}</p>
                          <p className="text-[10px] text-white/35 truncate">
                            {r.fifaBadge ? "🏅 FIFA" : r.refereeLicense || "Referee"}
                          </p>
                        </div>
                        <span className={`text-sm shrink-0 ${sel ? "text-purple-400" : "text-white/20"}`}>
                          {sel ? "✓" : "+"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM — Top Players */}
        <section className="mt-12">
          <div className="flex justify-between items-center mb-5">
            <div>
              <div className="section-line mb-2" />
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                ⭐ Top Rated Players
              </h2>
              <p className="text-white/30 text-xs mt-1">Tap "Quick Add" to place at their position</p>
            </div>
            <Link href="/players?playerType=player" className="text-primary-400 text-xs sm:text-sm font-semibold hover:text-primary-300">
              View All →
            </Link>
          </div>

          {loading ? (
            <p className="text-center text-white/30 py-8 text-sm">Loading players...</p>
          ) : topPlayers.length === 0 ? (
            <p className="text-center text-white/30 py-8 text-sm">No players available yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {topPlayers.map(p => {
                const inSquad = (positions[p.position] || []).some(x => x.id === p.id);
                return (
                  <div key={p.id} className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden card-hover">
                    <Link href={`/players/${p.id}`}>
                      <div className="relative h-40 bg-gradient-to-br from-primary-900/50 to-dark overflow-hidden">
                        {p.photo ? (
                          <img src={p.photo} alt="" className="w-full h-full object-cover img-zoom" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white/20">
                            {p.user?.name?.charAt(0)}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-card to-transparent" />
                        <div className="absolute top-2 right-2"><TierBadge tier={p.tier} /></div>
                        <div className="absolute top-2 left-2">
                          <span className="bg-red-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                            {p.position}
                          </span>
                        </div>
                        <div className="absolute bottom-2 left-3 right-3">
                          <p className="font-bold text-white text-sm truncate drop-shadow">{p.user?.name}</p>
                        </div>
                      </div>
                    </Link>
                    <div className="p-3">
                      <div className="flex justify-between items-center mb-2.5">
                        {p.reviews?.length > 0 ? <Stars rating={p.rating} /> : <span className="text-[10px] text-white/25">No rating</span>}
                        <span className="text-[10px] text-white/35">{p.experience}yr</span>
                      </div>
                      <button
                        onClick={() => inSquad ? removeFromPosition(p.position, p.id) : quickAdd(p)}
                        className={`w-full py-2 rounded-lg text-xs font-bold transition ${
                          inSquad
                            ? "bg-red-900/30 text-red-400 border border-red-800"
                            : "bg-primary-900/30 text-primary-400 border border-primary-800 hover:bg-primary-900/50"
                        }`}
                      >
                        {inSquad ? "✕ Remove" : `➕ Quick Add (${p.position})`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Login prompt */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9000] p-4" onClick={() => setShowLoginPrompt(false)}>
          <div onClick={e => e.stopPropagation()}
            className="glass rounded-2xl p-6 sm:p-8 w-full max-w-sm text-center animate-[scaleIn_0.3s_ease-out]">
            <span className="text-4xl block mb-3">🔐</span>
            <h3 className="text-xl font-bold mb-2">Almost Done!</h3>
            <p className="text-white/50 text-sm mb-1">
              Your squad of <span className="text-primary-400 font-bold">{totalPeople}</span> is ready.
            </p>
            <p className="text-white/40 text-xs mb-6">Login or register to submit. We've saved your selection.</p>
            <div className="space-y-2">
              <button onClick={() => goToAuth("/auth/register")} className="w-full btn-primary text-white py-3 rounded-xl font-bold">
                Create Account
              </button>
              <button onClick={() => goToAuth("/auth/login")} className="w-full btn-outline text-white py-3 rounded-xl font-bold">
                I Already Have an Account
              </button>
              <button onClick={() => setShowLoginPrompt(false)} className="w-full text-white/40 py-2 text-sm hover:text-white/60">
                Keep Editing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Position picker */}
      {pickerOpen && pickerPos && (
        <PositionPicker
          open={true}
          onClose={() => setPickerOpen(null)}
          positionKey={pickerOpen}
          positionLabel={lang === "bn" ? pickerPos.labelBn : pickerPos.label}
          players={players}
          selected={positions[pickerOpen] || []}
          onToggle={(p) => togglePlayer(pickerOpen, p)}
        />
      )}

      <Footer />
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}