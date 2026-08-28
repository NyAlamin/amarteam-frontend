"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSettings } from "@/lib/settings-context";

interface PopupConfig {
  active: boolean;
  badge: string;
  headline: string;
  description: string;
  code: string;
  cta: string;
  ctaLink: string;
  image: string;
  dismiss: string;
}

export default function PromoPopup() {
  const { get } = useSettings();
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  const raw = get("popup");
  let popup: PopupConfig | null = null;
  try { if (raw) popup = JSON.parse(raw); } catch {}

  useEffect(() => {
    if (!popup?.active) return;
    const dismissed = sessionStorage.getItem("popup-dismissed");
    if (dismissed) return;
    const timer = setTimeout(() => setShow(true), 1500);
    return () => clearTimeout(timer);
  }, [popup?.active]);

  const close = () => {
    setShow(false);
    sessionStorage.setItem("popup-dismissed", "1");
  };

  const copyCode = () => {
    if (!popup?.code) return;
    navigator.clipboard.writeText(popup.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!show || !popup?.active) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={close}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeInSlow_0.3s_ease-out]" />

      {/* Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl animate-[scaleIn_0.3s_ease-out]"
      >
        {/* Close */}
        <button onClick={close}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-gray-500">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Image */}
        {popup.image && (
          <div className="h-44 sm:h-52 overflow-hidden">
            <img src={popup.image} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Content */}
        <div className="p-5 sm:p-7">
          {/* Badge */}
          {popup.badge && (
            <span className="inline-block px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-[11px] font-bold tracking-wide mb-3">
              {popup.badge}
            </span>
          )}

          {/* Headline */}
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight mb-2">
            {popup.headline}
          </h2>

          {/* Description */}
          {popup.description && (
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              {popup.description}
            </p>
          )}

          {/* Promo code */}
          {popup.code && (
            <button onClick={copyCode}
              className="w-full mb-4 p-3 rounded-xl border-2 border-dashed border-primary-300 bg-primary-50 text-center hover:bg-primary-100 transition cursor-pointer group">
              <p className="text-[10px] text-gray-400 font-semibold tracking-wide mb-0.5">
                {copied ? "✓ COPIED!" : "USE CODE"}
              </p>
              <p className="text-lg sm:text-xl font-bold text-primary-600 tracking-widest">
                {popup.code}
              </p>
            </button>
          )}

          {/* CTA */}
          {popup.cta && popup.ctaLink && (
            <Link href={popup.ctaLink} onClick={close}
              className="block w-full text-center bg-primary-500 hover:bg-primary-600 text-white py-3.5 rounded-xl font-bold text-sm transition-colors">
              {popup.cta}
            </Link>
          )}

          {/* Dismiss text */}
          <button onClick={close}
            className="block w-full text-center text-gray-400 text-xs mt-3 hover:text-gray-600 transition">
            {popup.dismiss || "No thanks, I'll pay full price"}
          </button>
        </div>
      </div>
    </div>
  );
}