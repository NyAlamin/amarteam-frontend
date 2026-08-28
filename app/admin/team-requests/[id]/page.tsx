"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { teamRequestsAPI, playersAPI, paymentsAPI } from "@/lib/api";
import FootballField from "@/components/ui/football-field";
import ConfirmModal from "@/components/ui/confirm-modal";
import Toast from "@/components/ui/toast";
import Loading from "@/components/ui/loading";
import { useToast } from "@/lib/hooks";
import { TeamRequest, Player, SquadEntry, TEAM_STATUS_INFO, FOOTBALL_POSITIONS } from "@/lib/types";
import { generateTeamRequestPDF } from "@/lib/pdf-generator";
import PaymentPanel from "@/components/admin/payment-panel";

const INPUT = "w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition";
const LABEL = "block text-sm font-semibold mb-1 text-slate-700";

const STATUS_LIGHT: Record<string, { bg: string; text: string }> = {
  callingSoon: { bg: "bg-blue-50 border-blue-200", text: "text-blue-700" },
  advancePending: { bg: "bg-yellow-50 border-yellow-200", text: "text-yellow-700" },
  confirmed: { bg: "bg-green-50 border-green-200", text: "text-green-700" },
  playerOnTheWay: { bg: "bg-cyan-50 border-cyan-200", text: "text-cyan-700" },
  completed: { bg: "bg-purple-50 border-purple-200", text: "text-purple-700" },
  cancelled: { bg: "bg-red-50 border-red-200", text: "text-red-700" },
};

export default function TeamRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast, showToast } = useToast();

  const [tr, setTr] = useState<TeamRequest | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [advanceRate, setAdvanceRate] = useState(30);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const [form, setForm] = useState({ status: "callingSoon", adminNote: "" });

  /** Squad is editable — admin adds, removes and prices players here. */
  const [squad, setSquad] = useState<SquadEntry[]>([]);
  const [addSearch, setAddSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  /** Admin can override the auto-calculated advance. */
  const [advanceOverride, setAdvanceOverride] = useState<string | null>(null);

  const load = () => {
    Promise.all([
      teamRequestsAPI.getOne(id as string),
      playersAPI.getAllAdmin(),
      paymentsAPI.getRates().catch(() => ({ data: {} })),
    ]).then(([r, p, rates]) => {
      setTr(r.data);
      setPlayers(p.data);
      setAdvanceRate(Number(rates.data?.["advance.talent"] ?? 30));
      setForm({ status: r.data.status, adminNote: r.data.adminNote || "" });
      setSquad(r.data.squad || []);
      setAdvanceOverride(r.data.advanceAmount ? String(r.data.advanceAmount) : null);
    }).catch(() => showToast("Failed to load request", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  // ─── Derived money ───
  const finalAmount = squad.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
  const autoAdvance = Math.round((finalAmount * advanceRate) / 100);
  const advanceAmount = advanceOverride !== null ? Number(advanceOverride) || 0 : autoAdvance;

  // ─── Squad editing ───
  const setFee = (playerId: string, value: string) =>
    setSquad(prev => prev.map(s =>
      s.playerId === playerId ? { ...s, amount: value === "" ? undefined : Number(value) } : s,
    ));

  const removePlayer = (playerId: string) =>
    setSquad(prev => prev.filter(s => s.playerId !== playerId));

  const addPlayer = (p: Player) => {
    if (squad.some(s => s.playerId === p.id)) {
      showToast("Already in the squad", "error");
      return;
    }
    setSquad(prev => [...prev, {
      positionKey: p.position || "CM",
      playerId: p.id,
      playerName: p.user?.name || "Player",
      playerPosition: p.position || "",
    }]);
    setAddSearch("");
    setShowAdd(false);
  };

  const addable = players
    .filter(p => p.playerType === "player" && p.isApproved)
    .filter(p => !squad.some(s => s.playerId === p.id))
    .filter(p => !addSearch || (p.user?.name || "").toLowerCase().includes(addSearch.toLowerCase()))
    .slice(0, 8);

  /** Single save — status, notes, squad, fees and amounts all go together. */
  const save = async () => {
    setSaving(true);
    try {
      await teamRequestsAPI.update(id as string, {
        status: form.status,
        adminNote: form.adminNote,
        squad,
        finalAmount: finalAmount || undefined,
        advanceAmount: advanceAmount || undefined,
      } as any);
      showToast("Saved");
      load();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      showToast(Array.isArray(msg) ? msg[0] : (msg || "Failed"), "error");
    } finally { setSaving(false); }
  };

  const del = async () => {
    try {
      await teamRequestsAPI.delete(id as string);
      showToast("Request deleted", "error");
      setTimeout(() => { window.close(); }, 1200);
    } catch { showToast("Failed to delete", "error"); }
  };

  if (loading) return <div className="min-h-screen bg-slate-50"><Loading /></div>;
  if (!tr) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-slate-400">Request not found.</p>
    </div>
  );

  const info = TEAM_STATUS_INFO[tr.status] || TEAM_STATUS_INFO.callingSoon;
  const lightStyle = STATUS_LIGHT[tr.status] || STATUS_LIGHT.callingSoon;

  const fieldPositions: Record<string, Player[]> = {};
  squad.forEach(s => {
    const p = players.find(pl => pl.id === s.playerId);
    if (p) fieldPositions[s.positionKey] = [...(fieldPositions[s.positionKey] || []), p];
  });

  const unpriced = squad.filter(s => !s.amount).length;
  const payees = squad.map(s => ({ id: s.playerId, name: s.playerName }));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <div className="bg-green-950 px-4 py-4">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-between items-center gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">⚽</span>
              <span className="font-bold text-white">আমার টিম</span>
              <span className="text-white/40 text-xs">Team Request</span>
            </div>
            <p className="text-[11px] text-white/40 font-mono">
              #{tr.id.slice(0, 8).toUpperCase()} • {new Date(tr.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => generateTeamRequestPDF(tr)}
              className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white/20 transition">
              📄 Download PDF
            </button>
            <Link href="/admin/team-requests"
              className="bg-white/10 border border-white/20 text-white/70 px-4 py-2 rounded-lg text-sm font-semibold hover:text-white transition">
              ← Back
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">

        {/* Status banner */}
        <div className={`rounded-xl p-5 border ${lightStyle.bg}`}>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">{info.icon}</span>
            <h2 className={`text-xl font-bold ${lightStyle.text}`}>{info.label}</h2>
          </div>
          <p className="text-slate-500 text-sm">{info.desc}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* LEFT */}
          <div className="space-y-5">
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="font-bold mb-3 text-slate-800">🤝 Hirer Information</h3>
              <div className="space-y-2 text-sm">
                <Row label="Name / Club" value={tr.hirer?.name} />
                <Row label="Email" value={tr.hirer?.email} />
                <Row label="Phone" value={tr.hirer?.phone || "—"} highlight />
                <Row label="Location" value={tr.hirer?.location || "—"} />
              </div>
              {tr.hirer?.phone && (
                <a href={`tel:${tr.hirer.phone}`}
                  className="mt-4 block w-full bg-green-600 text-white text-center py-3 rounded-lg font-bold hover:bg-green-700 transition">
                  📞 Call {tr.hirer.name}
                </a>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="font-bold mb-3 text-slate-800">📋 Match Details</h3>
              <div className="space-y-2 text-sm">
                <Row label="Match Date" value={tr.matchDate || "Not specified"} highlight />
                <Row label="Tournament" value={tr.tournament || "Not specified"} />
                <Row label="Venue / Location" value={tr.location || "Not specified"} />
                <Row label="Players Requested" value={String(tr.playersNeeded)} />
                <Row label="Hirer Budget" value={tr.budget ? `৳${tr.budget.toLocaleString()}` : "Not specified"} />
              </div>
            </div>

            {tr.message && (
              <div className="bg-white rounded-xl shadow-sm p-5">
                <h3 className="font-bold mb-3 text-slate-800">💬 Hirer Notes</h3>
                <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">{tr.message}</p>
              </div>
            )}

            {squad.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-5">
                <h3 className="font-bold mb-4 text-slate-800">⚽ Formation</h3>
                <FootballField selectedPositions={fieldPositions} onPositionClick={() => {}} />
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="space-y-5">
            {/* Squad + fees */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-bold text-slate-800">👥 Squad ({squad.length})</h3>
                <button onClick={() => setShowAdd(!showAdd)}
                  className="text-green-600 text-sm font-semibold hover:underline">
                  {showAdd ? "Cancel" : "+ Add player"}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                Set each fee after the call. Players see their own amount in Earnings.
              </p>

              {/* Add player */}
              {showAdd && (
                <div className="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <input value={addSearch} onChange={e => setAddSearch(e.target.value)}
                    placeholder="Search approved players..." className={INPUT} autoFocus />
                  <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                    {addable.length === 0 ? (
                      <p className="text-xs text-slate-400 py-2">No matching players.</p>
                    ) : addable.map(p => (
                      <button key={p.id} onClick={() => addPlayer(p)}
                        className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-white transition text-left">
                        {p.photo ? (
                          <img src={p.photo} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-700">
                            {p.user?.name?.charAt(0)}
                          </div>
                        )}
                        <span className="flex-1 text-sm font-medium truncate">{p.user?.name}</span>
                        <span className="text-[10px] text-slate-400">{p.position} • {p.tier}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {squad.length === 0 ? (
                <p className="text-sm text-slate-400 py-6 text-center">No players in this squad.</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {squad.map(s => {
                    const p = players.find(pl => pl.id === s.playerId);
                    const pos = FOOTBALL_POSITIONS.find(fp => fp.key === s.positionKey);
                    return (
                      <div key={s.playerId} className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                            {s.positionKey}
                          </span>
                          {p?.photo ? (
                            <img src={p.photo} alt="" className="w-9 h-9 rounded-full object-cover" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-700">
                              {s.playerName?.charAt(0)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate text-slate-800">{s.playerName}</p>
                            <p className="text-[11px] text-slate-400 truncate">
                              {pos?.label}{p?.user?.phone ? ` • ${p.user.phone}` : ""}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-[11px] text-slate-400">৳</span>
                            <input type="number" value={s.amount ?? ""}
                              onChange={e => setFee(s.playerId, e.target.value)}
                              placeholder="fee"
                              className="w-24 px-2 py-1.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-green-500" />
                            <button onClick={() => removePlayer(s.playerId)}
                              className="text-red-400 hover:text-red-600 px-1 text-sm">✕</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Money */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="font-bold mb-3 text-slate-800">💰 Pricing</h3>

              <div className="bg-slate-50 rounded-lg p-3 space-y-2 text-sm mb-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total ({squad.length} players)</span>
                  <span className="font-bold text-slate-800">৳{finalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Advance at {advanceRate}%</span>
                  <span className="font-bold text-green-600">৳{advanceAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="text-slate-500">Balance on match day</span>
                  <span className="font-bold text-yellow-600">
                    ৳{Math.max(0, finalAmount - advanceAmount).toLocaleString()}
                  </span>
                </div>
              </div>

              {unpriced > 0 && (
                <p className="text-[11px] text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg p-2.5 mb-3">
                  {unpriced} player{unpriced > 1 ? "s have" : " has"} no fee set — they won't see an amount.
                </p>
              )}

              <div>
                <label className={LABEL}>Advance (৳)</label>
                <div className="flex gap-2">
                  <input type="number"
                    value={advanceOverride !== null ? advanceOverride : autoAdvance}
                    onChange={e => setAdvanceOverride(e.target.value)}
                    className={INPUT} />
                  {advanceOverride !== null && (
                    <button onClick={() => setAdvanceOverride(null)}
                      className="px-3 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold whitespace-nowrap">
                      Reset to {advanceRate}%
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Auto-calculated from the total. Edit if you agreed something different.
                </p>
              </div>
            </div>

            {/* Status + notes + save */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="font-bold mb-4 text-slate-800">⚙️ Update Request</h3>

              <div className="space-y-4">
                <div>
                  <label className={LABEL}>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={INPUT}>
                    {Object.entries(TEAM_STATUS_INFO).map(([key, i]) => (
                      <option key={key} value={key}>{i.icon} {i.label}</option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    {TEAM_STATUS_INFO[form.status]?.desc}
                  </p>
                </div>

                <div>
                  <label className={LABEL}>Internal Admin Notes</label>
                  <textarea value={form.adminNote} onChange={e => setForm({ ...form, adminNote: e.target.value })}
                    rows={3} placeholder="Call notes, negotiated terms, follow-ups..." className={INPUT} />
                </div>

                <button onClick={save} disabled={saving}
                  className="w-full bg-green-600 text-white py-3.5 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 transition">
                  {saving ? "Saving..." : "💾 Save All Changes"}
                </button>

                <p className="text-[11px] text-slate-400 text-center">
                  Saves squad, fees, amounts, status and notes together.
                </p>
              </div>
            </div>

            {/* Danger */}
            <div className="bg-white rounded-xl shadow-sm p-5 border border-red-100">
              <h3 className="font-bold mb-2 text-red-600 text-sm">⚠️ Danger Zone</h3>
              <p className="text-xs text-slate-400 mb-3">Permanently delete this request. Cannot be undone.</p>
              <button onClick={() => setDeleteConfirm(true)}
                className="w-full bg-red-50 text-red-600 border border-red-200 py-2.5 rounded-lg text-sm font-bold hover:bg-red-100 transition">
                Delete Request
              </button>
            </div>
          </div>
        </div>

        <PaymentPanel refType="teamRequest" refId={id as string} payees={payees} />
      </div>

      {deleteConfirm && (
        <ConfirmModal
          message="Delete this team request permanently?"
          onConfirm={del}
          onCancel={() => setDeleteConfirm(false)}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value?: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-slate-400 shrink-0">{label}</span>
      <span className={`text-right font-semibold break-all ${highlight ? "text-green-600" : "text-slate-700"}`}>
        {value || "—"}
      </span>
    </div>
  );
}