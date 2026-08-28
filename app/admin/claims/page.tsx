"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { paymentsAPI } from "@/lib/api";
import Loading from "@/components/ui/loading";
import Toast from "@/components/ui/toast";
import { useToast } from "@/lib/hooks";

const tk = (n?: number | null) => `৳${Number(n || 0).toLocaleString()}`;

const STATUS: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

export default function AdminClaimsPage() {
  const { toast, showToast } = useToast();
  const [claims, setClaims] = useState<any[]>([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<string | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    paymentsAPI.listClaims(filter || undefined)
      .then(r => setClaims(r.data))
      .catch(() => showToast("Could not load claims", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const openClaim = async (id: string) => {
    if (open === id) { setOpen(null); setDetail(null); return; }
    setOpen(id);
    setDetail(null);
    setNote("");
    try {
      const r = await paymentsAPI.claimDetail(id);
      setDetail(r.data);
    } catch { showToast("Could not load details", "error"); }
  };

  const act = async (id: string, approve: boolean) => {
    setBusy(true);
    try {
      if (approve) await paymentsAPI.approveClaim(id, { adminNote: note || undefined });
      else await paymentsAPI.rejectClaim(id, { adminNote: note || undefined });
      showToast(approve ? "Payment recorded" : "Claim rejected");
      setOpen(null); setDetail(null); load();
    } catch (err: any) {
      const m = err.response?.data?.message;
      showToast(Array.isArray(m) ? m[0] : (m || "Failed"), "error");
    } finally { setBusy(false); }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Payment Verification</h1>
        <p className="text-slate-500 text-sm mt-1">
          Check each transaction ID in your bKash or Nagad app before approving.
        </p>
      </div>

      <div className="flex gap-2 mb-5">
        {[["pending", "Pending"], ["approved", "Approved"], ["rejected", "Rejected"], ["", "All"]].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${
              filter === k ? "bg-green-600 text-white" : "bg-white text-slate-600"
            }`}>
            {l}
          </button>
        ))}
      </div>

      {claims.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-16 text-center">
          <p className="text-4xl mb-3">💳</p>
          <p className="text-slate-400">No claims here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {claims.map(c => (
            <div key={c.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <button onClick={() => openClaim(c.id)}
                className="w-full p-4 text-left hover:bg-slate-50 transition">
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <p className="font-mono font-bold text-slate-800">{c.externalRef}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {c.user?.name} • {c.method} • {c.refs?.length} booking{c.refs?.length > 1 ? "s" : ""}
                    </p>
                    {c.senderNumber && (
                      <p className="text-xs text-slate-400">From {c.senderNumber}</p>
                    )}
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {new Date(c.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-lg text-slate-800">{tk(c.totalAmount)}</p>
                    <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${STATUS[c.status]}`}>
                      {c.status}
                    </span>
                  </div>
                </div>
              </button>

              {open === c.id && (
                <div className="border-t border-slate-100 p-4 bg-slate-50">
                  {!detail ? <p className="text-sm text-slate-400">Loading...</p> : (
                    <>
                      <p className="text-xs font-bold text-slate-500 uppercase mb-2">Covers</p>
                      <div className="space-y-2 mb-4">
                        {detail.lines.map((l: any, i: number) => (
                          <div key={i} className="bg-white rounded-lg p-3 border border-slate-200">
                            <div className="flex justify-between gap-3">
                              <span className="text-sm text-slate-700 truncate">{l.label || l.refType}</span>
                              <span className="font-bold text-sm shrink-0">{tk(l.amount)}</span>
                            </div>
                            {l.missing ? (
                              <p className="text-[11px] text-red-500 mt-1">Booking not found</p>
                            ) : (
                              <p className="text-[11px] text-slate-400 mt-1">
                                {tk(l.total)} total • {tk(l.amountPaid)} paid • {tk(l.remaining)} remaining
                              </p>
                            )}
                          </div>
                        ))}
                      </div>

                      {c.note && (
                        <p className="text-xs text-slate-500 mb-3">Customer note: {c.note}</p>
                      )}

                      {c.status === "pending" ? (
                        <>
                          <textarea value={note} onChange={e => setNote(e.target.value)}
                            rows={2} placeholder="Note (required if rejecting)..."
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm mb-3 outline-none focus:border-green-500" />
                          <div className="flex gap-2">
                            <button onClick={() => act(c.id, true)} disabled={busy}
                              className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white py-2.5 rounded-xl font-bold text-sm transition">
                              {busy ? "Recording..." : `✓ Verified — record ${tk(c.totalAmount)}`}
                            </button>
                            <button onClick={() => act(c.id, false)} disabled={busy}
                              className="px-5 bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-xl font-bold text-sm transition">
                              Reject
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="bg-white rounded-lg p-3 border border-slate-200">
                          <p className="text-xs text-slate-500">
                            {c.status === "approved" ? "Approved" : "Rejected"}
                            {c.reviewedAt && ` on ${new Date(c.reviewedAt).toLocaleString()}`}
                          </p>
                          {c.adminNote && <p className="text-xs text-slate-600 mt-1">{c.adminNote}</p>}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}