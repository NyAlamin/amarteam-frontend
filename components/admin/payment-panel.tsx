"use client";

import { useEffect, useState } from "react";
import { paymentsAPI } from "@/lib/api";
import { useToast } from "@/lib/hooks";
import Toast from "@/components/ui/toast";

const FIELD = "w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500";
const LABEL = "block text-xs font-semibold text-slate-600 mb-1";

const KIND_LABEL: Record<string, { text: string; cls: string }> = {
  advanceIn:       { text: "Advance received", cls: "bg-green-100 text-green-700" },
  fullIn:          { text: "Full payment",     cls: "bg-green-100 text-green-700" },
  commission:      { text: "Commission",       cls: "bg-amber-100 text-amber-700" },
  payout:          { text: "Paid to talent",   cls: "bg-blue-100 text-blue-700" },
  directToPlayer:  { text: "Paid directly",    cls: "bg-slate-100 text-slate-600" },
  refund:          { text: "Refund",           cls: "bg-red-100 text-red-700" },
};

const tk = (n: number) => `৳${Number(n || 0).toLocaleString()}`;

export default function PaymentPanel({ refType, refId, showPayout = true }: {
  refType: "booking" | "teamRequest" | "cameramanBooking" | "vehicleBooking";
  refId: string;
  /** Vehicles are your own service — nothing to disburse. */
  showPayout?: boolean;
}) {
  const { toast, showToast } = useToast();
  const [quote, setQuote] = useState<any>(null);
  const [ledger, setLedger] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<"in" | "out" | "direct">("in");

  const [inForm, setInForm] = useState({ amount: "", method: "bkash", externalRef: "", note: "" });
  const [outForm, setOutForm] = useState({ amount: "", method: "bkash", externalRef: "", note: "" });
  const [dirForm, setDirForm] = useState({ amount: "", note: "" });

  const load = async () => {
    try {
      const [q, l] = await Promise.all([
        paymentsAPI.quote(refType, refId),
        paymentsAPI.ledger(refType, refId),
      ]);
      setQuote(q.data);
      setLedger(l.data);
    } catch (err: any) {
      showToast(err.response?.data?.message || "Could not load payment info", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [refType, refId]);

  const submit = async (fn: () => Promise<any>, resetForm: () => void) => {
    setBusy(true);
    try {
      await fn();
      resetForm();
      await load();
      showToast("Recorded");
    } catch (err: any) {
      const m = err.response?.data?.message;
      showToast(Array.isArray(m) ? m[0] : (m || "Failed"), "error");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="bg-white rounded-2xl border border-slate-200 p-5 text-slate-400 text-sm">Loading payment info...</div>;

  if (!quote) return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <p className="text-slate-500 text-sm">
        Set the final amount on this booking before recording payments.
      </p>
    </div>
  );

  const statusPill =
    quote.paymentStatus === "fullyPaid" ? "bg-green-100 text-green-700"
    : quote.paymentStatus === "advancePaid" ? "bg-amber-100 text-amber-700"
    : quote.paymentStatus === "refunded" ? "bg-red-100 text-red-700"
    : "bg-slate-100 text-slate-500";

  const statusText =
    quote.paymentStatus === "fullyPaid" ? "Fully paid"
    : quote.paymentStatus === "advancePaid" ? "Advance paid"
    : quote.paymentStatus === "refunded" ? "Refunded"
    : "Unpaid";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="font-semibold text-slate-800">Payment</h2>
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusPill}`}>
          {statusText}
        </span>
      </div>

      {/* Summary */}
      <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-slate-100">
        <Stat label="Booking total" value={tk(quote.total)} />
        <Stat label={`Advance due (${quote.advanceRate}%)`} value={tk(quote.advanceDue)} />
        <Stat label={`Commission (${quote.commissionRate}%)`} value={tk(quote.commissionAmount)} accent="text-amber-600" />
        <Stat label="Talent receives" value={tk(quote.talentReceives)} accent="text-blue-600" />
      </div>

      <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 border-b border-slate-100">
        <Stat label="Received so far" value={tk(quote.amountPaid)} accent="text-green-600" />
        <Stat label="Still owed to us" value={tk(quote.remainingToUs)} />
        <Stat label="Paid out" value={tk(quote.payoutPaid)} />
        <Stat label="Ready to pay out" value={tk(quote.payoutDue)} accent={quote.payoutDue > 0 ? "text-blue-600" : undefined} />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100">
        <Tab active={tab === "in"} onClick={() => setTab("in")}>Record payment</Tab>
        {showPayout && <Tab active={tab === "out"} onClick={() => setTab("out")}>Pay talent</Tab>}
        {showPayout && <Tab active={tab === "direct"} onClick={() => setTab("direct")}>Paid directly</Tab>}
      </div>

      {/* Money in */}
      {tab === "in" && (
        <div className="p-5 space-y-3">
          <p className="text-xs text-slate-500">
            Money received from the hirer. Verify the TrxID in your bKash/Nagad app before recording.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Amount (৳)</label>
              <input type="number" value={inForm.amount}
                onChange={e => setInForm(f => ({ ...f, amount: e.target.value }))}
                placeholder={String(quote.remainingToUs || quote.advanceDue)} className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Method</label>
              <select value={inForm.method}
                onChange={e => setInForm(f => ({ ...f, method: e.target.value }))} className={FIELD}>
                <option value="bkash">bKash</option>
                <option value="nagad">Nagad</option>
                <option value="card">Card</option>
                <option value="cash">Cash</option>
              </select>
            </div>
          </div>
          <div>
            <label className={LABEL}>Transaction ID</label>
            <input value={inForm.externalRef}
              onChange={e => setInForm(f => ({ ...f, externalRef: e.target.value }))}
              placeholder="e.g. 9K5X2ABCDE" className={FIELD} />
          </div>
          <div>
            <label className={LABEL}>Note (optional)</label>
            <input value={inForm.note}
              onChange={e => setInForm(f => ({ ...f, note: e.target.value }))} className={FIELD} />
          </div>
          <button disabled={busy || !inForm.amount}
            onClick={() => submit(
              () => paymentsAPI.record({
                refType, refId,
                amount: Number(inForm.amount),
                method: inForm.method,
                externalRef: inForm.externalRef || undefined,
                note: inForm.note || undefined,
              }),
              () => setInForm({ amount: "", method: "bkash", externalRef: "", note: "" }),
            )}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition">
            {busy ? "Recording..." : "Record payment"}
          </button>
        </div>
      )}

      {/* Money out */}
      {tab === "out" && showPayout && (
        <div className="p-5 space-y-3">
          {quote.payoutDue > 0 ? (
            <p className="text-xs text-slate-500">
              {tk(quote.payoutDue)} is available to disburse. Send it, then record the TrxID here.
            </p>
          ) : (
            <p className="text-xs text-amber-600">
              Nothing available yet — commission is retained from money received before payouts unlock.
            </p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Amount (৳)</label>
              <input type="number" value={outForm.amount}
                onChange={e => setOutForm(f => ({ ...f, amount: e.target.value }))}
                placeholder={String(quote.payoutDue)} className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Method</label>
              <select value={outForm.method}
                onChange={e => setOutForm(f => ({ ...f, method: e.target.value }))} className={FIELD}>
                <option value="bkash">bKash</option>
                <option value="nagad">Nagad</option>
                <option value="cash">Cash</option>
              </select>
            </div>
          </div>
          <div>
            <label className={LABEL}>Transaction ID</label>
            <input value={outForm.externalRef}
              onChange={e => setOutForm(f => ({ ...f, externalRef: e.target.value }))} className={FIELD} />
          </div>
          <div>
            <label className={LABEL}>Who was paid (optional note)</label>
            <input value={outForm.note}
              onChange={e => setOutForm(f => ({ ...f, note: e.target.value }))}
              placeholder="e.g. Ariful Haque — GK" className={FIELD} />
          </div>
          <button disabled={busy || !outForm.amount || quote.payoutDue <= 0}
            onClick={() => submit(
              () => paymentsAPI.payout({
                refType, refId,
                amount: Number(outForm.amount),
                method: outForm.method,
                externalRef: outForm.externalRef || undefined,
                note: outForm.note || undefined,
              }),
              () => setOutForm({ amount: "", method: "bkash", externalRef: "", note: "" }),
            )}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition">
            {busy ? "Recording..." : "Record payout"}
          </button>
        </div>
      )}

      {/* Direct */}
      {tab === "direct" && showPayout && (
        <div className="p-5 space-y-3">
          <p className="text-xs text-slate-500">
            Hirer paid the talent directly on match day. Recorded for the books — no money moves through us.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Amount (৳)</label>
              <input type="number" value={dirForm.amount}
                onChange={e => setDirForm(f => ({ ...f, amount: e.target.value }))} className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Note</label>
              <input value={dirForm.note}
                onChange={e => setDirForm(f => ({ ...f, note: e.target.value }))}
                placeholder="Who, and when" className={FIELD} />
            </div>
          </div>
          <button disabled={busy || !dirForm.amount}
            onClick={() => submit(
              () => paymentsAPI.direct({
                refType, refId,
                amount: Number(dirForm.amount),
                note: dirForm.note || undefined,
              }),
              () => setDirForm({ amount: "", note: "" }),
            )}
            className="bg-slate-700 hover:bg-slate-800 disabled:opacity-40 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition">
            {busy ? "Recording..." : "Record direct payment"}
          </button>
        </div>
      )}

      {/* Ledger */}
      <div className="border-t border-slate-100">
        <div className="px-5 py-3 bg-slate-50">
          <h3 className="text-xs font-bold text-slate-500 tracking-wide uppercase">History</h3>
        </div>
        {ledger.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-400">No transactions yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {ledger.map(t => {
              const meta = KIND_LABEL[t.kind] || { text: t.kind, cls: "bg-slate-100 text-slate-600" };
              return (
                <div key={t.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${meta.cls}`}>
                        {meta.text}
                      </span>
                      {t.externalRef && (
                        <span className="text-[11px] text-slate-400 font-mono">{t.externalRef}</span>
                      )}
                    </div>
                    {t.note && <p className="text-xs text-slate-500 mt-1 truncate">{t.note}</p>}
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {new Date(t.createdAt).toLocaleString()} · {t.method}
                    </p>
                  </div>
                  <span className="font-bold text-slate-800 shrink-0">{tk(Number(t.amount))}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div>
      <p className="text-[11px] text-slate-500 mb-0.5">{label}</p>
      <p className={`font-bold text-sm ${accent || "text-slate-800"}`}>{value}</p>
    </div>
  );
}

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`px-4 py-2.5 text-sm font-semibold transition border-b-2 ${
        active ? "border-green-600 text-green-700" : "border-transparent text-slate-400 hover:text-slate-600"
      }`}>
      {children}
    </button>
  );
}