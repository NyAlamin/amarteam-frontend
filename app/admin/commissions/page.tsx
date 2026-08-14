"use client";

import { useEffect, useState } from "react";
import { paymentsAPI, settingsAPI } from "@/lib/api";
import { useToast } from "@/lib/hooks";
import Toast from "@/components/ui/toast";

const FIELD = "w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500";

type Rates = Record<string, number>;

const GROUPS = [
  {
    title: "Players, Coaches & Referees",
    hint: "Commission is taken from the advance. Talent receives the total minus commission, whether the hirer pays 30% or 100% upfront.",
    commission: "commission.talent",
    advance: "advance.talent",
  },
  {
    title: "Cameramen",
    hint: "Full payment upfront. Funds are held until both sides confirm the shoot is complete.",
    commission: "commission.cameraman",
    advance: "advance.cameraman",
  },
  {
    title: "Vehicles",
    hint: "Own service — no commission. Advance only confirms the booking.",
    commission: "commission.vehicle",
    advance: "advance.vehicle",
  },
];

export default function CommissionsPage() {
  const { toast, showToast } = useToast();
  const [rates, setRates] = useState<Rates>({});
  const [payment, setPayment] = useState({ mode: "manual", bkashNumber: "", nagadNumber: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([paymentsAPI.getRates(), settingsAPI.getAll()])
      .then(([r, s]) => {
        setRates(r.data);
        const v = (k: string) => s.data?.[k]?.value ?? "";
        setPayment({
          mode: v("payment.mode") || "manual",
          bkashNumber: v("payment.bkashNumber"),
          nagadNumber: v("payment.nagadNumber"),
        });
      })
      .catch(() => showToast("Could not load settings", "error"))
      .finally(() => setLoading(false));
  }, []);

  const setRate = (key: string, val: string) =>
    setRates(prev => ({ ...prev, [key]: val === "" ? 0 : Number(val) }));

  /** Commission comes out of the advance, so it can never exceed it. */
  const invalid = GROUPS
    .filter(g => (rates[g.commission] ?? 0) > (rates[g.advance] ?? 0))
    .map(g => g.title);

  const save = async () => {
    if (invalid.length) {
      showToast(`Commission cannot exceed the advance for: ${invalid.join(", ")}`, "error");
      return;
    }
    setSaving(true);
    try {
      const writes = Object.entries(rates).map(([k, v]) =>
        settingsAPI.set(k, String(v)),
      );
      writes.push(settingsAPI.set("payment.mode", payment.mode));
      writes.push(settingsAPI.set("payment.bkashNumber", payment.bkashNumber));
      writes.push(settingsAPI.set("payment.nagadNumber", payment.nagadNumber));
      await Promise.all(writes);
      showToast("Settings saved");
    } catch (err: any) {
      showToast(err.response?.data?.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-slate-400">Loading...</div>;

  return (
    <div className="p-4 sm:p-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Commission & Payments</h1>
      <p className="text-slate-500 text-sm mb-6">
        Changes apply to new bookings only. Existing bookings keep the rate they were created with.
      </p>

      {/* Rates */}
      <div className="space-y-4 mb-6">
        {GROUPS.map(g => {
          const com = rates[g.commission] ?? 0;
          const adv = rates[g.advance] ?? 0;
          const bad = com > adv;
          const example = 10000;

          return (
            <div key={g.commission}
              className={`bg-white rounded-2xl border p-5 ${bad ? "border-red-300" : "border-slate-200"}`}>
              <h2 className="font-semibold text-slate-800 mb-1">{g.title}</h2>
              <p className="text-xs text-slate-500 mb-4">{g.hint}</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Commission %
                  </label>
                  <input type="number" min={0} max={100} value={com}
                    onChange={e => setRate(g.commission, e.target.value)} className={FIELD} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Advance %
                  </label>
                  <input type="number" min={0} max={100} value={adv}
                    onChange={e => setRate(g.advance, e.target.value)} className={FIELD} />
                </div>
              </div>

              {bad ? (
                <p className="text-xs text-red-600 mt-3 font-medium">
                  Commission ({com}%) is more than the advance ({adv}%). You'd be taking more than you collect.
                </p>
              ) : (
                <p className="text-xs text-slate-500 mt-3">
                  On a ৳{example.toLocaleString()} booking: hirer pays{" "}
                  <strong className="text-slate-700">৳{Math.round(example * adv / 100).toLocaleString()}</strong> to confirm,
                  you keep <strong className="text-slate-700">৳{Math.round(example * com / 100).toLocaleString()}</strong>,
                  talent receives <strong className="text-slate-700">৳{(example - Math.round(example * com / 100)).toLocaleString()}</strong>.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Payment collection */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
        <h2 className="font-semibold text-slate-800 mb-1">Collection Method</h2>
        <p className="text-xs text-slate-500 mb-4">
          Manual mode shows your numbers to the hirer and waits for you to verify the TrxID.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Mode</label>
            <select value={payment.mode}
              onChange={e => setPayment(p => ({ ...p, mode: e.target.value }))} className={FIELD}>
              <option value="manual">Manual (bKash / Nagad)</option>
              <option value="gateway" disabled>Gateway — not connected yet</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">bKash Number</label>
            <input value={payment.bkashNumber}
              onChange={e => setPayment(p => ({ ...p, bkashNumber: e.target.value }))}
              placeholder="01XXXXXXXXX" className={FIELD} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nagad Number</label>
            <input value={payment.nagadNumber}
              onChange={e => setPayment(p => ({ ...p, nagadNumber: e.target.value }))}
              placeholder="01XXXXXXXXX" className={FIELD} />
          </div>
        </div>
      </div>

      <button onClick={save} disabled={saving || invalid.length > 0}
        className="bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition">
        {saving ? "Saving..." : "Save Settings"}
      </button>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}