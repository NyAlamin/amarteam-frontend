"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/hooks";
import { Role, OtpChannel, OtpPurpose } from "@/lib/types";
import Toast from "@/components/ui/toast";
import OtpInput from "@/components/ui/otp-input";
import OAuthButtons from "@/components/ui/oauth-buttons";

const INPUT = "w-full px-4 py-3 rounded-xl bg-dark-card border border-dark-border text-white text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition";
const LABEL = "block text-sm font-semibold mb-1.5 text-white/80";

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { login } = useAuth();
  const { toast, showToast } = useToast();

  const [mode, setMode] = useState<"password" | "otp">("password");
  const [step, setStep] = useState<"input" | "code">("input");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(params.get("error") || "");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const startCooldown = () => {
    setCooldown(60);
    const t = setInterval(() => {
      setCooldown(c => {
        if (c <= 1) { clearInterval(t); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  const redirectByRole = (role: string) => {
    if (role === Role.ADMIN) router.push("/admin");
    else if (role === Role.PLAYER) router.push("/player-panel");
    else router.push("/");
  };

  // ─── Password login ───
  const passwordLogin = async () => {
    setError("");
    if (!email.trim() || !password) { setError("Enter your email and password"); return; }

    setBusy(true);
    try {
      const res = await authAPI.login({ email: email.trim().toLowerCase(), password });
      login(res.data.token, res.data.user);

      if (res.data.requiresVerification) {
        router.push(`/auth/verify?identifier=${encodeURIComponent(res.data.user.email)}&channel=email`);
        return;
      }
      redirectByRole(res.data.user.role);
    } catch (err: any) {
      const m = err.response?.data?.message;
      setError(Array.isArray(m) ? m[0] : (m || "Login failed"));
    } finally { setBusy(false); }
  };

  // ─── OTP login ───
  const sendCode = async () => {
    setError("");
    const id = identifier.trim();
    const isEmail = id.includes("@");
    const isPhone = /^01\d{9}$/.test(id);

    if (!isEmail && !isPhone) {
      setError("Enter a valid email or phone number (01XXXXXXXXX)");
      return;
    }

    setBusy(true);
    try {
      await authAPI.sendOtp({
        identifier: id,
        channel: isEmail ? OtpChannel.EMAIL : OtpChannel.SMS,
        purpose: OtpPurpose.LOGIN,
      });
      setStep("code");
      startCooldown();
      showToast(`Code sent to your ${isEmail ? "email" : "phone"}`);
    } catch (err: any) {
      const m = err.response?.data?.message;
      setError(Array.isArray(m) ? m[0] : (m || "Could not send code"));
    } finally { setBusy(false); }
  };

  const verifyCode = async (code: string) => {
    setError("");
    setBusy(true);
    try {
      const res = await authAPI.otpLogin({ identifier: identifier.trim(), code });
      login(res.data.token, res.data.user);
      redirectByRole(res.data.user.role);
    } catch (err: any) {
      const m = err.response?.data?.message;
      setError(Array.isArray(m) ? m[0] : (m || "Invalid code"));
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
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
          {step === "input" ? (
            <>
              <div className="text-center mb-6">
                <h1 className="text-xl font-bold text-white">Welcome back</h1>
                <p className="text-white/40 text-sm mt-1">Sign in to your account</p>
              </div>

              {/* Mode toggle */}
              <div className="flex gap-1 bg-dark-card rounded-xl p-1 mb-6">
                {[
                  { k: "password", l: "Password" },
                  { k: "otp", l: "Email / SMS Code" },
                ].map(m => (
                  <button key={m.k} onClick={() => { setMode(m.k as any); setError(""); }}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition ${
                      mode === m.k ? "bg-primary-600 text-white" : "text-white/50 hover:text-white"
                    }`}>
                    {m.l}
                  </button>
                ))}
              </div>

              {error && (
                <div className="bg-red-900/25 border border-red-800 text-red-400 px-4 py-3 rounded-xl text-sm mb-4">
                  {error}
                </div>
              )}

              {mode === "password" ? (
                <div className="space-y-4">
                  <div>
                    <label className={LABEL}>Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && passwordLogin()}
                      placeholder="you@example.com" className={INPUT} autoComplete="email" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-sm font-semibold text-white/80">Password</label>
                      <Link href="/auth/forgot-password"
                        className="text-[11px] text-primary-400 hover:underline font-semibold">
                        Forgot password?
                      </Link>
                    </div>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && passwordLogin()}
                      placeholder="••••••••" className={INPUT} autoComplete="current-password" />
                  </div>

                  <button onClick={passwordLogin} disabled={busy}
                    className="w-full btn-primary text-white py-3.5 rounded-xl font-bold disabled:opacity-50">
                    {busy ? "Signing in..." : "Sign In"}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className={LABEL}>Email or Phone</label>
                    <input value={identifier} onChange={e => setIdentifier(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && sendCode()}
                      placeholder="you@example.com or 01XXXXXXXXX" className={INPUT} />
                    <p className="text-[11px] text-white/25 mt-1.5">
                      We'll send a 6-digit code — no password needed
                    </p>
                  </div>

                  <button onClick={sendCode} disabled={busy}
                    className="w-full btn-primary text-white py-3.5 rounded-xl font-bold disabled:opacity-50">
                    {busy ? "Sending..." : "Send Code"}
                  </button>
                </div>
              )}

              <div className="mt-6">
                <OAuthButtons />
              </div>

              <p className="text-center text-sm text-white/40 mt-6">
                No account?{" "}
                <Link href="/auth/register" className="text-primary-400 font-semibold hover:underline">
                  Register
                </Link>
              </p>
              <p className="text-center text-xs text-white/25 mt-2">
                Player, coach, referee or cameraman?{" "}
                <Link href="/auth/register-player" className="text-white/45 hover:underline">
                  Join as talent
                </Link>
              </p>
            </>
          ) : (
            /* ─── CODE STEP ─── */
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-primary-900/40 border border-primary-700 flex items-center justify-center mx-auto mb-4">
                  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-primary-400">
                    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-white">Enter your code</h1>
                <p className="text-white/40 text-sm mt-1">
                  Sent to <span className="text-white/70 font-semibold">{identifier}</span>
                </p>
              </div>

              {error && (
                <div className="bg-red-900/25 border border-red-800 text-red-400 px-4 py-3 rounded-xl text-sm mb-5 text-center">
                  {error}
                </div>
              )}

              <OtpInput onComplete={verifyCode} disabled={busy} />

              {busy && <p className="text-center text-primary-400 text-sm mt-4">Verifying...</p>}

              <div className="mt-6 text-center space-y-2">
                <button onClick={sendCode} disabled={cooldown > 0 || busy}
                  className="text-sm text-primary-400 font-semibold hover:underline disabled:text-white/25 disabled:no-underline">
                  {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
                </button>
                <button onClick={() => { setStep("input"); setError(""); }}
                  className="block w-full text-white/40 text-sm hover:text-white/60">
                  ← Use a different email or phone
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-dark" />}>
      <LoginContent />
    </Suspense>
  );
}