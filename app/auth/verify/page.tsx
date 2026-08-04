"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/hooks";
import { Role, OtpChannel, OtpPurpose } from "@/lib/types";
import Toast from "@/components/ui/toast";
import OtpInput from "@/components/ui/otp-input";

function VerifyContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, login, refreshUser } = useAuth();
  const { toast, showToast } = useToast();

  const identifier = params.get("identifier") || user?.email || "";
  const channelParam = params.get("channel") === "sms" ? OtpChannel.SMS : OtpChannel.EMAIL;

  const [channel, setChannel] = useState<OtpChannel>(channelParam);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const target = channel === OtpChannel.EMAIL ? identifier : (user?.phone || "");

  const startCooldown = () => {
    setCooldown(60);
    const t = setInterval(() => {
      setCooldown(c => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; });
    }, 1000);
  };

  useEffect(() => { startCooldown(); }, []);

  const resend = async () => {
    setError("");
    setBusy(true);
    try {
      await authAPI.sendOtp({
        identifier: target,
        channel,
        purpose: channel === OtpChannel.EMAIL ? OtpPurpose.EMAIL_VERIFY : OtpPurpose.PHONE_VERIFY,
      });
      startCooldown();
      showToast(`New code sent to your ${channel === OtpChannel.EMAIL ? "email" : "phone"}`);
    } catch (err: any) {
      const m = err.response?.data?.message;
      setError(Array.isArray(m) ? m[0] : (m || "Could not send code"));
    } finally { setBusy(false); }
  };

  const verify = async (code: string) => {
    setError("");
    setBusy(true);
    try {
      const res = await authAPI.verifyOtp({
        identifier: target,
        code,
        purpose: channel === OtpChannel.EMAIL ? OtpPurpose.EMAIL_VERIFY : OtpPurpose.PHONE_VERIFY,
      });

      if (res.data.token && res.data.user) login(res.data.token, res.data.user);
      else await refreshUser();

      setDone(true);
      setTimeout(() => {
        const role = res.data.user?.role || user?.role;
        if (role === Role.ADMIN) router.push("/admin");
        else if (role === Role.PLAYER) router.push("/player-panel");
        else router.push("/");
      }, 2000);
    } catch (err: any) {
      const m = err.response?.data?.message;
      setError(Array.isArray(m) ? m[0] : (m || "Invalid code"));
    } finally { setBusy(false); }
  };

  const switchChannel = async (c: OtpChannel) => {
    if (c === OtpChannel.SMS && !user?.phone) {
      showToast("No phone number on this account", "warning");
      return;
    }
    setChannel(c);
    setError("");
    setBusy(true);
    try {
      await authAPI.sendOtp({
        identifier: c === OtpChannel.EMAIL ? identifier : user!.phone!,
        channel: c,
        purpose: c === OtpChannel.EMAIL ? OtpPurpose.EMAIL_VERIFY : OtpPurpose.PHONE_VERIFY,
      });
      startCooldown();
      showToast(`Code sent to your ${c === OtpChannel.EMAIL ? "email" : "phone"}`);
    } catch (err: any) {
      showToast(err.response?.data?.message || "Could not send code", "error");
    } finally { setBusy(false); }
  };

  // ─── Success ───
  if (done) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center px-4">
        <div className="glass rounded-2xl p-8 w-full max-w-md text-center animate-[scaleIn_0.4s_ease-out]">
          <div className="w-20 h-20 rounded-full bg-primary-900/40 border-2 border-primary-600 flex items-center justify-center mx-auto mb-5">
            <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-primary-400">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold gradient-text mb-2">Verified</h1>
          <p className="text-white/50 text-sm">Taking you to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="glass rounded-2xl p-6 sm:p-8 animate-[scaleIn_0.3s_ease-out]">

          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary-900/40 border border-primary-700 flex items-center justify-center mx-auto mb-4">
              {channel === OtpChannel.EMAIL ? (
                <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-primary-400">
                  <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-primary-400">
                  <rect x="6" y="2.5" width="12" height="19" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M10.5 18.5h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              )}
            </div>
            <h1 className="text-xl font-bold text-white">Verify your {channel === OtpChannel.EMAIL ? "email" : "phone"}</h1>
            <p className="text-white/40 text-sm mt-1.5">
              Code sent to <span className="text-white/70 font-semibold">{target}</span>
            </p>
          </div>

          {/* Channel switch */}
          {user?.phone && (
            <div className="flex gap-1 bg-dark-card rounded-xl p-1 mb-6">
              <button onClick={() => switchChannel(OtpChannel.EMAIL)} disabled={busy}
                className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition ${
                  channel === OtpChannel.EMAIL ? "bg-primary-600 text-white" : "text-white/50"
                }`}>
                Email
              </button>
              <button onClick={() => switchChannel(OtpChannel.SMS)} disabled={busy}
                className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition ${
                  channel === OtpChannel.SMS ? "bg-primary-600 text-white" : "text-white/50"
                }`}>
                SMS
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-900/25 border border-red-800 text-red-400 px-4 py-3 rounded-xl text-sm mb-5 text-center">
              {error}
            </div>
          )}

          <OtpInput onComplete={verify} disabled={busy} />

          {busy && <p className="text-center text-primary-400 text-sm mt-4">Verifying...</p>}

          <div className="mt-6 text-center space-y-2">
            <button onClick={resend} disabled={cooldown > 0 || busy}
              className="text-sm text-primary-400 font-semibold hover:underline disabled:text-white/25 disabled:no-underline">
              {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
            </button>
            <Link href="/" className="block text-white/30 text-sm hover:text-white/50">
              Skip for now
            </Link>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-dark" />}>
      <VerifyContent />
    </Suspense>
  );
}