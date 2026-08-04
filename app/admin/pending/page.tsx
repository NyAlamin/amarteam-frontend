"use client";

import { useEffect, useState } from "react";
import { playersAPI } from "@/lib/api";
import { TypeBadge } from "@/components/ui/player-card";
import ConfirmModal from "@/components/ui/confirm-modal";
import Toast from "@/components/ui/toast";
import Loading from "@/components/ui/loading";
import PdfDownloadButton from "@/components/ui/pdf-download-button";
import { useToast } from "@/lib/hooks";
import { Player } from "@/lib/types";

export default function AdminPendingPage() {
  const [pending, setPending] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const { toast, showToast } = useToast();

  const fetchPending = () => {
    playersAPI.getPending()
      .then(r => setPending(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPending(); }, []);

  const approve = async (id: string) => {
    try {
      await playersAPI.approve(id);
      showToast("Approved!");
      fetchPending();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed", "error");
    }
  };

  const reject = async () => {
    if (!rejectId) return;
    try {
      await playersAPI.reject(rejectId);
      showToast("Rejected", "error");
      setRejectId(null);
      fetchPending();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed", "error");
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-lg font-bold">Pending Registrations</h2>
        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">
          {pending.length}
        </span>
      </div>

      {pending.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-16 text-center">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-slate-400">No pending registrations.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map(p => (
            <div key={p.id} className="bg-white rounded-xl shadow-sm p-4 sm:p-5">
              {/* Top section — Photo + Info + Actions */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Photo + Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {p.photo ? (
                    <img src={p.photo} className="w-14 h-14 rounded-xl object-cover shrink-0" alt="" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center font-bold text-green-700 text-lg shrink-0">
                      {p.user?.name?.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-bold truncate">{p.user?.name}</p>
                      <TypeBadge playerType={p.playerType} />
                    </div>
                    <p className="text-xs text-slate-500 break-all">
                      {p.user?.email} • {p.user?.phone || "No phone"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {p.position || p.playerType} • {p.location || "—"} • {p.experience} yrs exp • Age {p.age}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-3 sm:grid-cols-1 gap-2 sm:w-36 shrink-0">
                  <button
                    onClick={() => approve(p.id)}
                    className="bg-green-600 text-white px-3 py-2.5 rounded-lg text-sm font-bold hover:bg-green-700 transition"
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => setRejectId(p.id)}
                    className="bg-red-50 text-red-600 px-3 py-2.5 rounded-lg text-sm font-bold hover:bg-red-100 transition"
                  >
                    ✕ Reject
                  </button>
                  <PdfDownloadButton player={p} variant="light" fullWidth label="PDF" />
                </div>
              </div>

              {/* Role-specific details */}
              {p.playerType === "coach" && (p.specialization || p.coachingLicense) && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex flex-wrap gap-2">
                    {p.specialization && (
                      <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-semibold">
                        🎓 {p.specialization}
                      </span>
                    )}
                    {p.coachingLicense && (
                      <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-xs">
                        📜 {p.coachingLicense}
                      </span>
                    )}
                  </div>
                  {p.tacticsStyle && (
                    <p className="text-xs text-slate-500 mt-2">
                      <strong>Tactics:</strong> {p.tacticsStyle}
                    </p>
                  )}
                </div>
              )}

              {p.playerType === "referee" && (p.refereeLicense || p.matchesOfficiated) && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex flex-wrap gap-2">
                    {p.refereeLicense && (
                      <span className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded-lg text-xs font-semibold">
                        📜 {p.refereeLicense}
                      </span>
                    )}
                    <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-xs">
                      ⚽ {p.matchesOfficiated || 0} matches officiated
                    </span>
                    {p.fifaBadge && (
                      <span className="bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-lg text-xs font-bold">
                        🏅 FIFA Badge
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Bio + Clubs + National */}
              {(p.bio || (p.clubs?.length ?? 0) > 0 || (p.nationalTeams?.length ?? 0) > 0) && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  {p.bio && <p className="text-sm text-slate-500 mb-3">{p.bio}</p>}

                  {(p.clubs?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                      <span className="text-xs text-slate-400 font-semibold">Clubs:</span>
                      {p.clubs.map((c, i) => (
                        <span key={i} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">
                          {c.name} ({c.joinYear}{c.isCurrent ? "–Present" : `–${c.leftYear}`})
                        </span>
                      ))}
                    </div>
                  )}

                  {(p.nationalTeams?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs text-slate-400 font-semibold">National:</span>
                      {p.nationalTeams.map((n, i) => (
                        <span key={i} className="bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded text-xs">
                          {n.level} ({n.year}){n.isCurrent ? " ✓" : ""}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs text-slate-300 mt-3">
                Registered: {new Date(p.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {rejectId && (
        <ConfirmModal
          message="Reject this registration? The profile and account will be deleted permanently."
          onConfirm={reject}
          onCancel={() => setRejectId(null)}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}