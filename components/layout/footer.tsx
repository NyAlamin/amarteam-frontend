import { useLang } from "@/lib/language-context";

export default function Footer() {
  const { t } = useLang();

  return (
    <footer className="bg-dark-card border-t border-dark-border">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">⚽</span>
              <span className="font-bold text-lg text-white">আমার টিম</span>
            </div>
            <p className="text-white/30 text-sm">{t("footer.tagline")}</p>
          </div>
          <p className="text-white/20 text-xs">© 2026 Amar Team. {t("footer.rights")}</p>
        </div>
      </div>
    </footer>
  );
}