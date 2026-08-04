"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { authAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Role } from "@/lib/types";

function CallbackContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = params.get("token");
    const err = params.get("error");
    const needsPhone = params.get("needsPhone") === "true";

    if (err) { setError(err); return; }
    if (!token) { setError("No sign-in token received"); return; }

    Cookies.set("token", token, {
      expires: 7,
      secure: window.location.protocol === "https:",
      sameSite: "strict",
      path: "/",
    });

    authAPI.getMe()
      .then(res => {
        login(token, res.data);
        if (needsPhone) {
          router.replace("/auth/add-phone");
        } else if (res.data.role === Role.ADMIN) {
          router.replace("/admin");
        } else if (res.data.role === Role.PLAYER) {
          router.replace("/player-panel");
        } else {
          router.replace("/");
        }
      })
      .catch(() => setError("Could not complete sign-in. Please try again."));
  }, [params]);

  if (error) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center px-4">
        <div className="glass rounded-2xl p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-900/30 border-2 border-red-800 flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-red-400">
              <path d="M12 8v5M12 16.5v.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-white mb-2">Sign-in failed</h1>
          <p className="text-white/50 text-sm mb-6">{error}</p>
          <button onClick={() => router.push("/auth/login")}
            className="w-full btn-primary text-white py-3 rounded-xl font-bold">
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary-800 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/50 text-sm">Signing you in...</p>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-dark" />}>
      <CallbackContent />
    </Suspense>
  );
}