"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authAPI, usersAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/hooks";
import { OtpChannel, OtpPurpose } from "@/lib/types";
import Toast from "@/components/ui/toast";
import OtpInput from "@/components/ui/otp-input";

const INPUT = "w-full px-4 py-3 rounded-xl bg-dark-card border border-dark-border text-white text-sm outline-none focus:border-primary-500 transition";
const LABEL = "block text-sm font-semibold mb-1.5 text-white/80";

export default function AddPhonePage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { toast, showToast } = useToast();

  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const startCooldown = () => {
    setCooldown(60);
    const t = setInterval(() => {
      setCooldown(c => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; });
    }, 1000);
  };

  const savePhone = async () => {
    setError("");
    if (!/^01\d{9}$/.test(phone)) {
      setError("Enter a valid BD phone number (01XXXXXXXXX)");
      return;
    }

    setBusy(true);
    try {
      await usersAPI.updateMe({ phone });
      await authAPI.sendOtp({
        identifier: phone,
        channel: OtpChannel.SMS,
        purpose: OtpPurpose.PHONE_VERIFY,
      });
      setStep(2);
      startCooldown();
      showToast("Code sent to your phone");
    } catch (err: any) {
      const m = err.response?.data?.message;
      setError(Array.isArray(m) ? m[0] : (m || "Could not save phone number"));
    } finally { setBusy(false); }
  };

  const resend = async () => {
    setError("");
    setBusy(true);
    try {
      await authAPI.sendOtp({
        identifier: phone,
        channel: OtpChannel.SMS,
        purpose: OtpPurpose.PHONE_VERIFY,
      });
      startCooldown();
      showToast("New code sent");
    } catch (err: any) {
      const m = err.response?.data?.message;
      setError(Array.isArray(m) ? m[0] : (m || "Could not resend"));
    } finally { setBusy(false); }
  };

  const verify = async (code: string) => {
    setError("");
    setBusy(true);
    try {
      await authAPI.verifyOtp({
        identifier: phone,
        code,
        purpose: OtpPurpose.PHONE_VERIFY,
      });
      await refreshUser();
      showToast("Phone verified");
      setTimeout(() => router.push("/"), 1500);
    } catch (err: any) {
      const m = err.response?.data?.message;
      setError(Array.isArray(m) ? m[0] : (m || "Invalid code"));
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
              <path d="M12 7l3 2.2-1.15 3.5h-3.7L9 9.2 12 7z" fill="currentColor" />
            </svg>
          </div>
          <span className="font-bold text-2xl text-white">আমার টিম</span>
        </Link>

        <div className="glass rounded-2xl p-6 sm:p-8 animate-[scaleIn_0.3s_ease-out]">

          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary-900/40 border border-primary-700 flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-primary-400">
                <rect x="6" y="2.5" width="12" height="19" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
                <path d="M10.5 18.5h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">
              {step === 1 ? "Add your phone number" : "Verify your phone"}
            </h1>
            <p className="text-white/40 text-sm mt-1.5">
              {step === 1
                ? "So clubs and our team can reach you about bookings"
                : <>Code sent to <span className="text-white/70 font-semibold">{phone}</span></>}
            </p>
          </div>

          {error && (
            <div className="bg-red-900/25 border border-red-800 text-red-400 px-4 py-3 rounded-xl text-sm mb-5">
              {error}
            </div>
          )}

          {step === 1 ? (
            <div className="space-y-4">
              <div>
                <label className={LABEL}>Phone Number</label>
                <input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && savePhone()}
                  placeholder="01XXXXXXXXX"
                  className={INPUT}
                  inputMode="numeric"
                  autoComplete="tel"
                  autoFocus
                />
              </div>

              <button onClick={savePhone} disabled={busy}
                className="w-full btn-primary text-white py-3.5 rounded-xl font-bold disabled:opacity-50">
                {busy ? "Sending code..." : "Send Verification Code"}
              </button>

              <Link href="/" className="block text-center text-white/30 text-sm hover:text-white/50 py-2">
                Skip for now
              </Link>
            </div>
          ) : (
            <>
              <OtpInput onComplete={verify} disabled={busy} />

              {busy && <p className="text-center text-primary-400 text-sm mt-4">Verifying...</p>}

              <div className="mt-6 text-center space-y-2">
                <button onClick={resend} disabled={cooldown > 0 || busy}
                  className="text-sm text-primary-400 font-semibold hover:underline disabled:text-white/25 disabled:no-underline">
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                </button>
                <button onClick={() => { setStep(1); setError(""); }}
                  className="block w-full text-white/40 text-sm hover:text-white/60">
                  ← Change phone number
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}