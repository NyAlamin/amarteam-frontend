"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export default function VerifyBanner() {
  const { user, isVerified, loading } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (loading || !user || isVerified || dismissed) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-yellow-900/95 backdrop-blur-sm border-t border-yellow-700 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-yellow-400 shrink-0">
            <path d="M12 8v5M12 16.5v.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
          </svg>
          <p className="text-yellow-100 text-xs sm:text-sm truncate">
            <span className="font-semibold">Verify your account</span>
            <span className="hidden sm:inline"> — confirm your email or phone to secure it</span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link href={`/auth/verify?identifier=${encodeURIComponent(user.email)}&channel=email`}
            className="bg-yellow-500 hover:bg-yellow-400 text-yellow-950 px-4 py-1.5 rounded-lg text-xs font-bold transition">
            Verify
          </Link>
          <button onClick={() => setDismissed(true)}
            className="text-yellow-300/60 hover:text-yellow-200 p-1">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}