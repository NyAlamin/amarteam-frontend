"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";
import { useToast } from "@/lib/hooks";
import { OtpChannel, OtpPurpose } from "@/lib/types";
import Toast from "@/components/ui/toast";
import OtpInput from "@/components/ui/otp-input";

const INPUT = "w-full px-4 py-3 rounded-xl bg-dark-card border border-dark-border text-white text-sm outline-none focus:border-primary-500 transition";
const LABEL = "block text-sm font-semibold mb-1.5 text-white/80";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast, showToast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const startCooldown = () => {
    setCooldown(60);
    const t = setInterval(() => {
      setCooldown(c => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; });
    }, 1000);
  };

  const sendCode = async () => {
    setError("");
    const id = identifier.trim();
    const isEmail = id.includes("@");
    const isPhone = /^01\d{9}$/.test(id);

    if (!isEmail && !isPhone) {
      setError("Enter a valid email or phone number");
      return;
    }

    setBusy(true);
    try {
      await authAPI.sendOtp({
        identifier: id,
        channel: isEmail ? OtpChannel.EMAIL : OtpChannel.SMS,
        purpose: OtpPurpose.PASSWORD_RESET,
      });
      setStep(2);
      startCooldown();
      showToast(`Code sent to your ${isEmail ? "email" : "phone"}`);
    } catch (err: any) {
      const m = err.response?.data?.message;
      setError(Array.isArray(m) ? m[0] : (m || "Could not send code"));
    } finally { setBusy(false); }
  };

  const onCodeComplete = (c: string) => {
    setCode(c);
    setError("");
    setStep(3);
  };

  const resetPassword = async () => {
    setError("");
    if (newPassword.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      setError("Password needs an uppercase letter, a lowercase letter and a number"); return;
    }
    if (newPassword !== confirm) { setError("Passwords do not match"); return; }

    setBusy(true);
    try {
      await authAPI.resetPassword({ identifier: identifier.trim(), code, newPassword });
      showToast("Password updated — you can now log in");
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch (err: any) {
      const m = err.response?.data?.message;
      const msg = Array.isArray(m) ? m[0] : (m || "Reset failed");
      setError(msg);
      if (msg.toLowerCase().includes("code")) setStep(2);
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

        {/* Steps */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                step > n ? "bg-primary-600 text-white"
                  : step === n ? "bg-primary-600 text-white ring-4 ring-primary-900/50"
                  : "bg-dark-card text-white/30 border border-dark-border"
              }`}>
                {step > n ? "✓" : n}
              </div>
              {n < 3 && <div className={`w-8 h-0.5 rounded ${step > n ? "bg-primary-600" : "bg-dark-border"}`} />}
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8 animate-[scaleIn_0.3s_ease-out]">
          {error && (
            <div className="bg-red-900/25 border border-red-800 text-red-400 px-4 py-3 rounded-xl text-sm mb-5">
              {error}
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <div className="text-center mb-6">
                <h1 className="text-xl font-bold text-white">Forgot your password?</h1>
                <p className="text-white/40 text-sm mt-1.5">
                  We'll send a code to reset it
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={LABEL}>Email or Phone</label>
                  <input value={identifier} onChange={e => setIdentifier(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && sendCode()}
                    placeholder="you@example.com or 01XXXXXXXXX" className={INPUT} autoFocus />
                </div>

                <button onClick={sendCode} disabled={busy}
                  className="w-full btn-primary text-white py-3.5 rounded-xl font-bold disabled:opacity-50">
                  {busy ? "Sending..." : "Send Reset Code"}
                </button>
              </div>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <div className="text-center mb-6">
                <h1 className="text-xl font-bold text-white">Enter the code</h1>
                <p className="text-white/40 text-sm mt-1.5">
                  Sent to <span className="text-white/70 font-semibold">{identifier}</span>
                </p>
              </div>

              <OtpInput onComplete={onCodeComplete} disabled={busy} />

              <div className="mt-6 text-center space-y-2">
                <button onClick={sendCode} disabled={cooldown > 0 || busy}
                  className="text-sm text-primary-400 font-semibold hover:underline disabled:text-white/25 disabled:no-underline">
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                </button>
                <button onClick={() => { setStep(1); setError(""); }}
                  className="block w-full text-white/40 text-sm hover:text-white/60">
                  ← Change email or phone
                </button>
              </div>
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <div className="text-center mb-6">
                <h1 className="text-xl font-bold text-white">Set a new password</h1>
                <p className="text-white/40 text-sm mt-1.5">Choose something strong</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={LABEL}>New Password</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters" className={INPUT} autoFocus autoComplete="new-password" />
                  <p className="text-[11px] text-white/25 mt-1.5">
                    Must include an uppercase letter, a lowercase letter and a number
                  </p>
                </div>

                <div>
                  <label className={LABEL}>Confirm Password</label>
                  <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && resetPassword()}
                    placeholder="Re-enter password" className={INPUT} autoComplete="new-password" />
                  {confirm && newPassword !== confirm && (
                    <p className="text-[11px] text-red-400 mt-1">Passwords do not match</p>
                  )}
                </div>

                <button onClick={resetPassword} disabled={busy}
                  className="w-full btn-primary text-white py-3.5 rounded-xl font-bold disabled:opacity-50">
                  {busy ? "Updating..." : "Reset Password"}
                </button>
              </div>
            </>
          )}

          <p className="text-center text-sm text-white/40 mt-6">
            Remembered it?{" "}
            <Link href="/auth/login" className="text-primary-400 font-semibold hover:underline">
              Back to login
            </Link>
          </p>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}