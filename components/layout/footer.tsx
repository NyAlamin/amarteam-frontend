"use client";

import Link from "next/link";
import { useLang } from "@/lib/language-context";
import { useSettings } from "@/lib/settings-context";

export default function Footer() {
  const { t } = useLang();
  const { get } = useSettings();
  const logo = get("logo");
  const siteName = get("siteName") || "আমার টিম";

  return (
    <footer className="bg-[#070c16] border-t border-white/[0.06]">

      {/* ─── MAIN FOOTER ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">

          {/* ─── Brand column ─── */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-2 lg:pr-8">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              {logo ? (
                <img src={logo} alt={siteName} className="h-9 object-contain" />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M12 7l3 2.2-1.15 3.5h-3.7L9 9.2 12 7z" fill="currentColor" />
                  </svg>
                </div>
              )}
              <span className="font-bold text-lg text-white">{siteName}</span>
            </Link>
            <p className="text-white/35 text-sm leading-relaxed mb-5 max-w-xs">
              {t("footer.tagline")}
            </p>

            {/* Social links */}
            <div className="flex items-center gap-2">
              <SocialIcon href="https://facebook.com/amarteam.app" label="Facebook"
                icon={<path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />} />
              <SocialIcon href="https://youtube.com/@amarteam" label="YouTube"
                icon={<><path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 001.94-2A29 29 0 0023 12a29 29 0 00-.46-5.58z" /><path d="M9.75 15.02l5.75-3.27-5.75-3.27v6.54z" fill="#070c16" /></>} />
              <SocialIcon href="https://instagram.com/amarteam.app" label="Instagram"
                icon={<><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1.5" /></>} />
              <SocialIcon href="https://tiktok.com/@amarteam" label="TikTok"
                icon={<path d="M9 12a4 4 0 104 4V4a5 5 0 005 5" />} />
            </div>
          </div>

          {/* ─── Talent ─── */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Talent</h4>
            <div className="space-y-2.5">
              <FooterLink href="/players?playerType=player" label="Players" />
              <FooterLink href="/players?playerType=coach" label="Coaches" />
              <FooterLink href="/players?playerType=referee" label="Referees" />
              <FooterLink href="/cameramen" label="Cameramen" />
              <FooterLink href="/foreign-players" label="Foreign Players" />
            </div>
          </div>

          {/* ─── Services ─── */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Services</h4>
            <div className="space-y-2.5">
              <FooterLink href="/team-builder" label="Build Your Team" />
              <FooterLink href="/vehicles" label="Vehicle Rental" />
              <FooterLink href="/shop" label="Sports Shop" />
              <FooterLink href="/my-orders" label="My Orders" />
              <FooterLink href="/cart" label="My Squad" />
            </div>
          </div>

          {/* ─── Join ─── */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Join Us</h4>
            <div className="space-y-2.5">
              <FooterLink href="/auth/register-player" label="Register as Talent" />
              <FooterLink href="/auth/register" label="Hirer Sign Up" />
              <FooterLink href="/auth/login" label="Login" />
            </div>

            {/* CTA */}
            <div className="mt-5">
              <Link href="/auth/register-player"
                className="inline-flex items-center gap-2 bg-primary-500/10 hover:bg-primary-500/20 border border-primary-500/20 text-primary-400 px-4 py-2 rounded-xl text-xs font-semibold transition-colors">
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
                  <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                  <path d="M19 8v6M22 11h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Join Free
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── BOTTOM BAR ─── */}
      <div className="border-t border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-white/20 text-xs">
            © {new Date().getFullYear()} {siteName}. {t("footer.rights")}
          </p>
          <div className="flex items-center gap-4">
            <span className="text-primary-400 text-[11px]">Build by <a href="https://nyalamin.vercel.app/">Alamin</a></span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href}
      className="block text-white/35 hover:text-white/70 text-sm transition-colors">
      {label}
    </Link>
  );
}

function SocialIcon({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" title={label}
      className="w-9 h-9 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 transition-all">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        {icon}
      </svg>
    </a>
  );
}