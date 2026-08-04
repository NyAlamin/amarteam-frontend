"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/hooks";
import Toast from "@/components/ui/toast";
import OAuthButtons from "@/components/ui/oauth-buttons";

const INPUT = "w-full px-4 py-3 rounded-xl bg-dark-card border border-dark-border text-white text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition";
const LABEL = "block text-sm font-semibold mb-1.5 text-white/80";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast, showToast } = useToast();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", confirm: "", location: "",
  });

  const upd = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const strength = (() => {
    const p = form.password;
    if (!p) return { pct: 0, label: "", color: "" };
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++;
    if (/\d/.test(p)) score++;
    if (/[^a-zA-Z0-9]/.test(p)) score++;
    const map = [
      { pct: 20, label: "Very weak", color: "bg-red-500" },
      { pct: 40, label: "Weak", color: "bg-orange-500" },
      { pct: 60, label: "Fair", color: "bg-yellow-500" },
      { pct: 80, label: "Good", color: "bg-lime-500" },
      { pct: 100, label: "Strong", color: "bg-primary-500" },
    ];
    return map[Math.max(0, score - 1)];
  })();

  const submit = async () => {
    setError("");

    if (form.name.trim().length < 2) { setError("Enter your full name"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError("Enter a valid email address"); return; }
    if (!/^01\d{9}$/.test(form.phone)) { setError("Enter a valid BD phone number (01XXXXXXXXX)"); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      setError("Password needs an uppercase letter, a lowercase letter and a number"); return;
    }
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }

    setBusy(true);
    try {
      const res = await authAPI.register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone,
        password: form.password,
        location: form.location || undefined,
      });

      login(res.data.token, res.data.user);
      showToast("Account created — check your email for the code");
      setTimeout(() => {
        router.push(`/auth/verify?identifier=${encodeURIComponent(form.email.trim().toLowerCase())}&channel=email`);
      }, 1200);
    } catch (err: any) {
      const m = err.response?.data?.message;
      setError(Array.isArray(m) ? m[0] : (m || "Registration failed"));
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
            <h1 className="text-xl font-bold text-white">Create your account</h1>
            <p className="text-white/40 text-sm mt-1">Hire players, book services, shop gear</p>
          </div>

          <OAuthButtons label="sign up with" />

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[11px] text-white/30 uppercase tracking-wider">or with email</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {error && (
            <div className="bg-red-900/25 border border-red-800 text-red-400 px-4 py-3 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className={LABEL}>Full Name / Club Name</label>
              <input value={form.name} onChange={e => upd("name", e.target.value)}
                placeholder="Your name or club" className={INPUT} autoComplete="name" />
            </div>

            <div>
              <label className={LABEL}>Email</label>
              <input type="email" value={form.email} onChange={e => upd("email", e.target.value)}
                placeholder="you@example.com" className={INPUT} autoComplete="email" />
            </div>

            <div>
              <label className={LABEL}>Phone</label>
              <input value={form.phone} onChange={e => upd("phone", e.target.value)}
                placeholder="01XXXXXXXXX" className={INPUT} inputMode="numeric" autoComplete="tel" />
            </div>

            <div>
              <label className={LABEL}>Password</label>
              <input type="password" value={form.password} onChange={e => upd("password", e.target.value)}
                placeholder="Min 8 characters" className={INPUT} autoComplete="new-password" />

              {form.password && (
                <div className="mt-2">
                  <div className="h-1 bg-dark rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} transition-all duration-300`}
                      style={{ width: `${strength.pct}%` }} />
                  </div>
                  <p className="text-[11px] text-white/40 mt-1">{strength.label}</p>
                </div>
              )}
            </div>

            <div>
              <label className={LABEL}>Confirm Password</label>
              <input type="password" value={form.confirm} onChange={e => upd("confirm", e.target.value)}
                placeholder="Re-enter password" className={INPUT} autoComplete="new-password" />
              {form.confirm && form.password !== form.confirm && (
                <p className="text-[11px] text-red-400 mt-1">Passwords do not match</p>
              )}
            </div>

            <div>
              <label className={LABEL}>Location <span className="text-white/25 font-normal">(optional)</span></label>
              <input value={form.location} onChange={e => upd("location", e.target.value)}
                placeholder="City" className={INPUT} />
            </div>

            <button onClick={submit} disabled={busy}
              className="w-full btn-primary text-white py-3.5 rounded-xl font-bold disabled:opacity-50">
              {busy ? "Creating account..." : "Create Account"}
            </button>

            <p className="text-[11px] text-white/25 text-center leading-relaxed">
              We'll send a verification code to your email.
            </p>
          </div>

          <p className="text-center text-sm text-white/40 mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary-400 font-semibold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}