"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import Toast from "@/components/ui/toast";
import Loading from "@/components/ui/loading";
import { authAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/hooks";
import { OtpChannel, OtpPurpose, AuthProvider } from "@/lib/types";

const INPUT = "w-full px-4 py-3 rounded-xl bg-dark-card border border-dark-border text-white text-sm outline-none focus:border-primary-500 transition";
const LABEL = "block text-sm font-semibold mb-1.5 text-white/80";

export default function SecuritySettingsPage() {
  const router = useRouter();
  const { user, loading, isVerified } = useAuth();
  const { toast, showToast } = useToast();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });

  const upd = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const changePassword = async () => {
    setError("");
    if (!form.current) { setError("Enter your current password"); return; }
    if (form.next.length < 8) { setError("New password must be at least 8 characters"); return; }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.next)) {
      setError("Password needs an uppercase letter, a lowercase letter and a number"); return;
    }
    if (form.next !== form.confirm) { setError("Passwords do not match"); return; }
    if (form.current === form.next) { setError("New password must be different"); return; }

    setBusy(true);
    try {
      await authAPI.changePassword({
        currentPassword: form.current,
        newPassword: form.next,
      });
      setForm({ current: "", next: "", confirm: "" });
      showToast("Password changed successfully");
    } catch (err: any) {
      const m = err.response?.data?.message;
      setError(Array.isArray(m) ? m[0] : (m || "Could not change password"));
    } finally { setBusy(false); }
  };

  const sendVerify = async (channel: OtpChannel) => {
    const identifier = channel === OtpChannel.EMAIL ? user!.email : user!.phone!;
    if (!identifier) { showToast("No phone number on this account", "warning"); return; }

    setBusy(true);
    try {
      await authAPI.sendOtp({
        identifier,
        channel,
        purpose: channel === OtpChannel.EMAIL ? OtpPurpose.EMAIL_VERIFY : OtpPurpose.PHONE_VERIFY,
      });
      router.push(`/auth/verify?identifier=${encodeURIComponent(identifier)}&channel=${channel}`);
    } catch (err: any) {
      showToast(err.response?.data?.message || "Could not send code", "error");
    } finally { setBusy(false); }
  };

  if (loading) return <div className="min-h-screen bg-dark"><Navbar /><div className="pt-24"><Loading /></div></div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-dark text-white">
        <Navbar />
        <div className="max-w-md mx-auto px-4 pt-32 text-center">
          <h1 className="text-xl font-bold mb-4">Login required</h1>
          <Link href="/auth/login" className="btn-primary text-white px-6 py-3 rounded-xl font-bold inline-block">
            Login
          </Link>
        </div>
      </div>
    );
  }

  const isOAuth = user.authProvider !== AuthProvider.LOCAL;

  return (
    <div className="min-h-screen bg-dark text-white">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 pt-24 pb-16 space-y-5">
        <div className="text-center mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Account Security</h1>
          <p className="text-white/40 text-sm mt-1">Manage your password and verification</p>
        </div>

        {/* Account overview */}
        <div className="glass rounded-2xl p-5">
          <h2 className="font-bold mb-4">Account</h2>
          <div className="space-y-3">
            <Row label="Name" value={user.name} />
            <Row
              label="Email"
              value={user.email}
              badge={user.emailVerified ? "verified" : "unverified"}
              action={!user.emailVerified ? { label: "Verify", onClick: () => sendVerify(OtpChannel.EMAIL) } : undefined}
            />
            <Row
              label="Phone"
              value={user.phone || "Not added"}
              badge={user.phone ? (user.phoneVerified ? "verified" : "unverified") : undefined}
              action={
                !user.phone
                  ? { label: "Add", onClick: () => router.push("/auth/add-phone") }
                  : !user.phoneVerified
                    ? { label: "Verify", onClick: () => sendVerify(OtpChannel.SMS) }
                    : undefined
              }
            />
            <Row
              label="Sign-in method"
              value={
                user.authProvider === AuthProvider.GOOGLE ? "Google"
                : user.authProvider === AuthProvider.APPLE ? "Apple"
                : "Email & password"
              }
            />
          </div>
        </div>

        {/* Verification banner */}
        {!isVerified && (
          <div className="bg-yellow-900/20 border border-yellow-800 rounded-2xl p-4">
            <p className="text-yellow-400 font-semibold text-sm mb-1">⚠️ Account not verified</p>
            <p className="text-white/50 text-xs">
              Verify your email or phone to secure your account and receive booking updates.
            </p>
          </div>
        )}

        {/* Change password */}
        <div className="glass rounded-2xl p-5">
          <h2 className="font-bold mb-1">Change password</h2>
          <p className="text-white/40 text-xs mb-4">
            {isOAuth
              ? `You signed up with ${user.authProvider}. Use "Forgot password" to set a password for the first time.`
              : "Choose something you don't use anywhere else."}
          </p>

          {error && (
            <div className="bg-red-900/25 border border-red-800 text-red-400 px-4 py-3 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}

          {isOAuth ? (
            <Link href="/auth/forgot-password"
              className="block w-full btn-outline text-white text-center py-3 rounded-xl font-bold">
              Set a Password
            </Link>
          ) : (
            <div className="space-y-4">
              <div>
                <label className={LABEL}>Current Password</label>
                <input type="password" value={form.current} onChange={e => upd("current", e.target.value)}
                  className={INPUT} autoComplete="current-password" />
              </div>
              <div>
                <label className={LABEL}>New Password</label>
                <input type="password" value={form.next} onChange={e => upd("next", e.target.value)}
                  placeholder="Min 8 characters" className={INPUT} autoComplete="new-password" />
              </div>
              <div>
                <label className={LABEL}>Confirm New Password</label>
                <input type="password" value={form.confirm} onChange={e => upd("confirm", e.target.value)}
                  onKeyDown={e => e.key === "Enter" && changePassword()}
                  className={INPUT} autoComplete="new-password" />
                {form.confirm && form.next !== form.confirm && (
                  <p className="text-[11px] text-red-400 mt-1">Passwords do not match</p>
                )}
              </div>

              <button onClick={changePassword} disabled={busy}
                className="w-full btn-primary text-white py-3.5 rounded-xl font-bold disabled:opacity-50">
                {busy ? "Updating..." : "Change Password"}
              </button>

              <Link href="/auth/forgot-password"
                className="block text-center text-primary-400 text-sm hover:underline">
                Forgot your current password?
              </Link>
            </div>
          )}
        </div>
      </div>

      <Footer />
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

function Row({ label, value, badge, action }: {
  label: string;
  value: string;
  badge?: "verified" | "unverified";
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-dark-border last:border-0">
      <div className="min-w-0">
        <p className="text-[11px] text-white/30">{label}</p>
        <p className="text-sm text-white/80 truncate">{value}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {badge === "verified" && (
          <span className="bg-primary-900/40 text-primary-400 border border-primary-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
            ✓ Verified
          </span>
        )}
        {badge === "unverified" && (
          <span className="bg-yellow-900/30 text-yellow-400 border border-yellow-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
            Unverified
          </span>
        )}
        {action && (
          <button onClick={action.onClick}
            className="text-primary-400 text-xs font-semibold hover:underline">
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}