"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { teamRequestsAPI, playersAPI } from "@/lib/api";
import FootballField from "@/components/ui/football-field";
import ConfirmModal from "@/components/ui/confirm-modal";
import Toast from "@/components/ui/toast";
import Loading from "@/components/ui/loading";
import { useToast } from "@/lib/hooks";
import { TeamRequest, Player, TEAM_STATUS_INFO, FOOTBALL_POSITIONS } from "@/lib/types";
import { generateTeamRequestPDF } from "@/lib/pdf-generator";
import PaymentPanel from "@/components/admin/payment-panel";


const INPUT = "w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition";
const LABEL = "block text-sm font-semibold mb-1 text-slate-700";

const STATUS_LIGHT: Record<string, { bg: string; text: string }> = {
  callingSoon: { bg: "bg-blue-50 border-blue-200", text: "text-blue-700" },
  advancePending: { bg: "bg-yellow-50 border-yellow-200", text: "text-yellow-700" },
  confirmed: { bg: "bg-green-50 border-green-200", text: "text-green-700" },
  completed: { bg: "bg-purple-50 border-purple-200", text: "text-purple-700" },
  cancelled: { bg: "bg-red-50 border-red-200", text: "text-red-700" },
};

export default function TeamRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast, showToast } = useToast();

  const [tr, setTr] = useState<TeamRequest | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const [form, setForm] = useState({
    status: "callingSoon",
    adminNote: "",
    finalAmount: "",
    advanceAmount: "",
  });

  const load = () => {
    Promise.all([
      teamRequestsAPI.getOne(id as string),
      playersAPI.getAllAdmin(),
    ]).then(([r, p]) => {
      setTr(r.data);
      setPlayers(p.data);
      setForm({
        status: r.data.status,
        adminNote: r.data.adminNote || "",
        finalAmount: r.data.finalAmount ? String(r.data.finalAmount) : "",
        advanceAmount: r.data.advanceAmount ? String(r.data.advanceAmount) : "",
      });
    }).catch(() => showToast("Failed to load request", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const save = async () => {
    setSaving(true);
    try {
      await teamRequestsAPI.update(id as string, {
        status: form.status,
        adminNote: form.adminNote,
        finalAmount: form.finalAmount ? Number(form.finalAmount) : undefined,
        advanceAmount: form.advanceAmount ? Number(form.advanceAmount) : undefined,
      });
      showToast("Request updated!");
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
tr.squad?.forEach(s => {
  const p = players.find(pl => pl.id === s.playerId);
  if (p) {
    fieldPositions[s.positionKey] = [...(fieldPositions[s.positionKey] || []), p];
  }
});

  const balance = (tr.finalAmount || 0) - (tr.advanceAmount || 0);

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

        {/* Status Banner */}
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
            {/* Hirer Info */}
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

            {/* Match Details */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="font-bold mb-3 text-slate-800">📋 Match Details</h3>
              <div className="space-y-2 text-sm">
                <Row label="Match Date" value={tr.matchDate || "Not specified"} highlight />
                <Row label="Tournament" value={tr.tournament || "Not specified"} />
                <Row label="Venue / Location" value={tr.location || "Not specified"} />
                <Row label="Players Requested" value={String(tr.squad?.length || tr.playersNeeded)} />
                <Row label="Hirer Budget" value={tr.budget ? `৳${tr.budget.toLocaleString()}` : "Not specified"} />
              </div>
            </div>

            {/* Hirer Message */}
            {tr.message && (
              <div className="bg-white rounded-xl shadow-sm p-5">
                <h3 className="font-bold mb-3 text-slate-800">💬 Hirer Notes</h3>
                <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">{tr.message}</p>
              </div>
            )}

            {/* Formation */}
            {tr.squad?.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-5">
                <h3 className="font-bold mb-4 text-slate-800">⚽ Requested Formation</h3>
                <FootballField
                  selectedPositions={fieldPositions}
                  onPositionClick={() => {}}
                  />
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="space-y-5">
            {/* Update Panel */}
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL}>Final Amount (৳)</label>
                    <input type="number" value={form.finalAmount}
                      onChange={e => setForm({ ...form, finalAmount: e.target.value })}
                      placeholder="0" className={INPUT} />
                  </div>
                  <div>
                    <label className={LABEL}>Advance (৳)</label>
                    <input type="number" value={form.advanceAmount}
                      onChange={e => setForm({ ...form, advanceAmount: e.target.value })}
                      placeholder="0" className={INPUT} />
                  </div>
                </div>

                {(tr.finalAmount || tr.advanceAmount) ? (
                  <div className="bg-slate-50 rounded-lg p-3 space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Final:</span>
                      <span className="font-bold text-slate-800">৳{(tr.finalAmount || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Advance paid:</span>
                      <span className="font-bold text-green-600">৳{(tr.advanceAmount || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-1.5 border-t border-slate-200">
                      <span className="text-slate-500">Balance due:</span>
                      <span className={`font-bold ${balance > 0 ? "text-yellow-600" : "text-green-600"}`}>
                        ৳{balance.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ) : null}

                <div>
                  <label className={LABEL}>Internal Admin Notes</label>
                  <textarea value={form.adminNote} onChange={e => setForm({ ...form, adminNote: e.target.value })}
                    rows={4} placeholder="Call notes, negotiated terms, follow-ups..." className={INPUT} />
                </div>

                <button onClick={save} disabled={saving}
                  className="w-full bg-green-600 text-white py-3.5 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 transition">
                  {saving ? "Saving..." : "💾 Save Changes"}
                </button>
              </div>
            </div>

            {/* Squad List */}
            {tr.squad?.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-5">
                <h3 className="font-bold mb-3 text-slate-800">👥 Squad List ({tr.squad.length})</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {tr.squad.map((s, i) => {
                    const p = players.find(pl => pl.id === s.playerId);
                    const pos = FOOTBALL_POSITIONS.find(fp => fp.key === s.positionKey);
                    return (
                      <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <span className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                          {s.positionKey}
                        </span>
                        {p?.photo ? (
                          <img src={p.photo} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-700">
                            {s.playerName?.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate text-slate-800">{s.playerName}</p>
                          <p className="text-[11px] text-slate-400">
                            {pos?.label} • {s.playerPosition}
                            {p?.user?.phone && ` • ${p.user.phone}`}
                          </p>
                        </div>
                        {p && (
                          <Link href={`/admin/players/${p.id}/edit`} target="_blank"
                            className="text-green-600 text-[11px] font-semibold shrink-0 hover:underline">
                            View ↗
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Danger Zone */}
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
      </div>

      {deleteConfirm && (
        <ConfirmModal
          message="Delete this team request permanently?"
          onConfirm={del}
          onCancel={() => setDeleteConfirm(false)}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className="mt-6">
        <PaymentPanel refType="teamRequest" refId={id as string} />
      </div>
      
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