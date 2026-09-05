"use client";

import { useState } from "react";
import { playerRequestsAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function RequestPlayerCard() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    requesterName: "",
    phone: "",
    playerName: "",
    club: "",
    tournament: "",
    location: "",
    note: "",
  });

  const upd = (k: string, v: string) => {
    setForm({ ...form, [k]: v });
    setError("");
  };

  const submit = async () => {
    if (!form.requesterName.trim()) { setError("Your name is required"); return; }
    if (!/^01\d{9}$/.test(form.phone)) { setError("Valid BD phone required (01XXXXXXXXX)"); return; }
    if (!form.playerName.trim()) { setError("Player name is required"); return; }

    setSubmitting(true);
    try {
      await playerRequestsAPI.create(form);
      setSubmitted(true);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : (msg || "Failed to submit"));
    } finally {
      setSubmitting(false);
    }
  };

  // Success state
  if (submitted) {
    return (
      <div className="rounded-2xl bg-dark-card border border-white/[0.07] p-5 text-center">
        <span className="text-3xl block mb-2">✅</span>
        <p className="text-sm font-semibold text-white mb-1">Request Submitted!</p>
        <p className="text-xs text-white/40 leading-relaxed">
          We'll search for the player and call you at {form.phone} with updates.
        </p>
        <button onClick={() => { setSubmitted(false); setForm({ requesterName: "", phone: "", playerName: "", club: "", tournament: "", location: "", note: "" }); }}
          className="mt-3 text-primary-400 text-xs font-semibold hover:text-primary-300 transition">
          Submit another →
        </button>
      </div>
    );
  }

  // Collapsed card
  if (!open) {
    return (
      <div className="rounded-2xl bg-dark-card border border-white/[0.07] p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-primary-500/15 flex items-center justify-center shrink-0 mt-0.5">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-primary-400">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M11 8v6M8 11h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Can't find a player?</p>
            <p className="text-xs text-white/40 mt-0.5 leading-snug">
              Tell us who you need — name, club, any hint. We'll find them for you.
            </p>
          </div>
        </div>
        <button onClick={() => setOpen(true)}
          className="block text-center w-full bg-primary-500/15 hover:bg-primary-500/25 text-primary-400 py-2.5 rounded-xl text-sm font-semibold transition-colors">
          Request a Player →
        </button>
      </div>
    );
  }

  // Expanded form
  return (
    <div className="rounded-2xl bg-dark-card border border-white/[0.07] p-5 flex-1 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm font-semibold text-white">Request a Player</p>
        <button onClick={() => setOpen(false)} className="text-white/30 hover:text-white/60 transition">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-[11px] font-semibold text-white/40 mb-1">Your Name *</label>
          <input value={form.requesterName} onChange={e => upd("requesterName", e.target.value)}
            placeholder={user?.name || "Your name"}
            className="w-full px-3 py-2 rounded-lg bg-dark border border-dark-border text-white text-sm outline-none focus:border-primary-500/50" />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-white/40 mb-1">Phone Number *</label>
          <input value={form.phone} onChange={e => upd("phone", e.target.value)}
            placeholder="01XXXXXXXXX" maxLength={11}
            className="w-full px-3 py-2 rounded-lg bg-dark border border-dark-border text-white text-sm outline-none focus:border-primary-500/50" />
        </div>

        <div className="pt-1 border-t border-white/[0.05]">
          <label className="block text-[11px] font-semibold text-white/40 mb-1">Player Name *</label>
          <input value={form.playerName} onChange={e => upd("playerName", e.target.value)}
            placeholder="Who are you looking for?"
            className="w-full px-3 py-2 rounded-lg bg-dark border border-dark-border text-white text-sm outline-none focus:border-primary-500/50" />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-white/40 mb-1">Club / Team</label>
          <input value={form.club} onChange={e => upd("club", e.target.value)}
            placeholder="Last known club"
            className="w-full px-3 py-2 rounded-lg bg-dark border border-dark-border text-white text-sm outline-none focus:border-primary-500/50" />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-white/40 mb-1">Tournament</label>
          <input value={form.tournament} onChange={e => upd("tournament", e.target.value)}
            placeholder="Which tournament?"
            className="w-full px-3 py-2 rounded-lg bg-dark border border-dark-border text-white text-sm outline-none focus:border-primary-500/50" />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-white/40 mb-1">Location</label>
          <input value={form.location} onChange={e => upd("location", e.target.value)}
            placeholder="Match venue / area"
            className="w-full px-3 py-2 rounded-lg bg-dark border border-dark-border text-white text-sm outline-none focus:border-primary-500/50" />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-white/40 mb-1">Note / Hint</label>
          <textarea value={form.note} onChange={e => upd("note", e.target.value)} rows={2}
            placeholder="Position, age, any details..."
            className="w-full px-3 py-2 rounded-lg bg-dark border border-dark-border text-white text-sm outline-none focus:border-primary-500/50 resize-none" />
        </div>

        {error && (
          <p className="text-red-400 text-xs font-medium">{error}</p>
        )}

        <button onClick={submit} disabled={submitting}
          className="w-full bg-primary-500 hover:bg-primary-400 text-white py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50">
          {submitting ? "Submitting..." : "📩 Submit Request"}
        </button>
      </div>
    </div>
  );
}