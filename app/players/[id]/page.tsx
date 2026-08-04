"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { TierBadge, TypeBadge, Stars } from "@/components/ui/player-card";
import Toast from "@/components/ui/toast";
import Loading from "@/components/ui/loading";
import { playersAPI, reviewsAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/language-context";
import { useToast } from "@/lib/hooks";
import { Player, Review } from "@/lib/types";
import AvailabilityCalendar from "@/components/ui/availability-calendar";
import { useCart } from "@/lib/cart-context";
import PdfDownloadButton from "@/components/ui/pdf-download-button";

export default function PlayerProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { isHirer } = useAuth();
  const { t } = useLang();
  const { toast, showToast } = useToast();
  const { isInSquad, addToSquad, removeFromSquad } = useCart();
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    playersAPI.getOne(id as string)
      .then(r => setPlayer(r.data))
      .catch(() => router.push("/players"))
      .finally(() => setLoading(false));
  }, [id]);

  const submitReview = async () => {
    if (!reviewText.trim()) return;
    setSubmitting(true);
    try {
      await reviewsAPI.create({ playerId: id, rating: reviewRating, text: reviewText });
      showToast(t("profile.submitReview") + " ✓");
      setReviewText(""); setReviewRating(5);
      const r = await playersAPI.getOne(id as string);
      setPlayer(r.data);
    } catch (err: any) { showToast(err.response?.data?.message || "Failed", "error"); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="min-h-screen bg-dark"><Navbar /><div className="pt-24"><Loading /></div></div>;
  if (!player) return null;

  const p = player;
  const currentClub = p.clubs?.find(c => c.isCurrent);
  const hasNational = p.nationalTeams?.length > 0;
  const currentNational = p.nationalTeams?.find(n => n.isCurrent);

  const hireLabel = p.playerType === "coach" ? t("profile.hireCoach") : p.playerType === "referee" ? t("profile.hireReferee") : t("profile.hirePlayer");

  const tabs = [
    { k: "overview", l: `📊 ${t("profile.overview")}` },
    { k: "matches", l: `⚽ ${t("profile.matches")}` },
    { k: "videos", l: `🎬 ${t("profile.videos")} (${p.videos?.length || 0})` },
    { k: "calendar", l: `📅 ${t("profile.calendar")}` },
    { k: "reviews", l: `💬 ${t("profile.reviews")} (${p.reviews?.length || 0})` },
  ];

  return (
    <div className="min-h-screen bg-dark text-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 pt-24 pb-16">
        {/* Hero */}
        <div className="relative rounded-3xl overflow-hidden mb-8 animate-[scaleIn_0.5s_ease-out]">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-dark to-primary-950" />
          {p.photo && <div className="absolute inset-0 opacity-20"><img src={p.photo} alt="" className="w-full h-full object-cover blur-2xl" /></div>}

          <div className="relative p-6 sm:p-10 flex flex-col sm:flex-row items-center gap-6">
            {p.photo ? (
              <img src={p.photo} alt="" className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl object-cover border-2 border-white/10 shadow-2xl animate-[slideUp_0.6s_ease-out]" />
            ) : (
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-primary-800 flex items-center justify-center text-5xl font-bold text-white/30">{p.user?.name?.charAt(0)}</div>
            )}

            <div className="text-center sm:text-left animate-[slideUp_0.6s_ease-out_0.1s_both]">
              <div className="flex flex-wrap items-center gap-2 mb-2 justify-center sm:justify-start">
                <h1 className="text-2xl sm:text-3xl font-bold">{p.user?.name}</h1>
                <TierBadge tier={p.tier} size="lg" />
                <TypeBadge playerType={p.playerType} />
              </div>
              <p className="text-white/50 mb-2">
                {p.position && <>{p.position} • </>}
                {currentClub && <>{currentClub.name} • </>}
                {p.location || "Bangladesh"}
              </p>
              {p.reviews?.length > 0 ? <Stars rating={p.rating} /> : <span className="text-white/30 text-sm">{t("card.noRatings")}</span>}
              {hasNational && (
                <p className="text-yellow-400/80 font-semibold text-sm mt-2">
                  🇧🇩 {currentNational ? `${currentNational.level} (${t("card.current")})` : t("card.nationalTeam")}
                </p>
              )}
              <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
                <span className={`px-4 py-1.5 rounded-full font-semibold text-sm ${p.isAvailable ? "bg-primary-900/50 text-primary-400 border border-primary-800" : "bg-red-900/30 text-red-400 border border-red-900"}`}>
                  {p.isAvailable ? `✓ ${t("card.available")}` : `✕ ${t("card.unavailable")}`}
                </span>
                <span className="glass px-4 py-1.5 rounded-full text-sm text-white/60">{p.experience} yrs exp</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hire Button */}
        {p.isAvailable && (
  <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-[slideUp_0.6s_ease-out_0.2s_both]">
  {p.isAvailable && (
    <Link href={isHirer ? `/hire/${p.id}` : "/auth/login"}
      className="flex-1 btn-primary text-white text-center py-4 rounded-2xl font-bold text-lg">
      ⚡ {hireLabel}
    </Link>
  )}
  {isHirer && p.playerType === "player" && p.isAvailable && (
  <button onClick={() => isInSquad(p.id) ? removeFromSquad(p.id) : addToSquad(p)}
    className={`sm:w-48 py-4 rounded-2xl font-bold text-lg transition border-2 ${
      isInSquad(p.id)
        ? "border-red-700 bg-red-900/20 text-red-400"
        : "border-primary-700 bg-primary-900/20 text-primary-400"
    }`}
  >
    {isInSquad(p.id) ? "✕ In Squad" : "➕ Add to Squad"}
  </button>
)}
  <div className="sm:w-44">
    <PdfDownloadButton player={p} variant="dark" fullWidth label="Download CV" />
  </div>
</div>
)}

        {/* Tabs */}
        <div className="flex gap-1 glass rounded-xl p-1 mb-6 overflow-x-auto animate-[slideUp_0.6s_ease-out_0.3s_both]">
          {tabs.map(t => (
            <button key={t.k} onClick={() => setTab(t.k)}
              className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                tab === t.k ? "bg-primary-600 text-white shadow-lg" : "text-white/50 hover:text-white"
              }`}>
              {t.l}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="glass rounded-2xl p-5 sm:p-8 animate-[fadeIn_0.4s_ease-out]">

          {tab === "overview" && (<>
  {p.bio && <p className="text-white/60 leading-relaxed mb-8">{p.bio}</p>}

  {/* Stats — different for each type */}
  {p.playerType === "player" && (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
      {[
        { l: t("profile.matches"), v: p.stats?.matches, i: "⚽" },
        { l: t("profile.goals"), v: p.stats?.goals, i: "🥅" },
        { l: t("profile.assists"), v: p.stats?.assists, i: "🎯" },
        { l: t("profile.cleanSheets"), v: p.stats?.cleanSheets, i: "🧤" },
        { l: t("profile.experience"), v: `${p.experience}${t("common.year")}`, i: "📈" },
        { l: t("profile.age"), v: p.age, i: "🎂" },
      ].map((s, i) => (
        <div key={i} className="bg-dark-card rounded-xl p-3 text-center border border-dark-border">
          <div className="text-lg">{s.i}</div>
          <div className="font-bold text-xl text-white">{s.v}</div>
          <div className="text-xs text-white/40">{s.l}</div>
        </div>
      ))}
    </div>
  )}

  {/* Coach Info */}
  {p.playerType === "coach" && (
    <div className="mb-8">
      <h4 className="font-semibold text-sm mb-3 text-white/80">🎓 Coaching Details</h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { l: "Experience", v: `${p.experience} yrs`, i: "📈" },
          { l: "Age", v: p.age, i: "🎂" },
          { l: "License", v: p.coachingLicense || "—", i: "📜" },
          { l: "Specialization", v: p.specialization || "—", i: "🎯" },
        ].map((s, i) => (
          <div key={i} className="bg-dark-card rounded-xl p-3 text-center border border-dark-border">
            <div className="text-lg">{s.i}</div>
            <div className="font-bold text-sm text-white truncate">{s.v}</div>
            <div className="text-xs text-white/40">{s.l}</div>
          </div>
        ))}
      </div>
      {p.tacticsStyle && (
        <div className="mt-3 p-4 bg-dark-card rounded-xl border border-dark-border">
          <p className="text-xs text-white/40 mb-1">Tactical Style</p>
          <p className="text-sm text-white/70">{p.tacticsStyle}</p>
        </div>
      )}
    </div>
  )}

  {/* Referee Info */}
  {p.playerType === "referee" && (
    <div className="mb-8">
      <h4 className="font-semibold text-sm mb-3 text-white/80">🏁 Referee Details</h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { l: "Experience", v: `${p.experience} yrs`, i: "📈" },
          { l: "Age", v: p.age, i: "🎂" },
          { l: "License", v: p.refereeLicense || "—", i: "📜" },
          { l: "Matches", v: p.matchesOfficiated || 0, i: "⚽" },
        ].map((s, i) => (
          <div key={i} className="bg-dark-card rounded-xl p-3 text-center border border-dark-border">
            <div className="text-lg">{s.i}</div>
            <div className="font-bold text-sm text-white truncate">{s.v}</div>
            <div className="text-xs text-white/40">{s.l}</div>
          </div>
        ))}
      </div>
      {p.fifaBadge && (
        <div className="mt-3 p-3 bg-yellow-900/20 border border-yellow-800 rounded-xl text-center">
          <span className="text-yellow-400 font-bold text-sm">🏅 FIFA Badge Holder</span>
        </div>
      )}
    </div>
  )}

  {/* Club History */}
  {p.clubs?.length > 0 && (
    <div className="mb-8">
      <h4 className="font-semibold text-sm mb-3 text-white/80">🏟️ {t("profile.clubHistory")}</h4>
      <div className="space-y-2">
        {p.clubs.map((c, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-dark-card rounded-xl border border-dark-border">
            <div>
              <p className="font-semibold text-sm">{c.name}</p>
              <p className="text-xs text-white/40">{c.joinYear} — {c.isCurrent ? t("profile.present") : c.leftYear}</p>
            </div>
            {c.isCurrent && <span className="bg-primary-900/50 text-primary-400 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-primary-800">{t("card.current")}</span>}
          </div>
        ))}
      </div>
    </div>
  )}

  {/* National Team */}
  {hasNational && (
    <div className="mb-8">
      <h4 className="font-semibold text-sm mb-3 text-white/80">🇧🇩 {t("card.nationalTeam")}</h4>
      <div className="flex flex-wrap gap-2">
        {p.nationalTeams.map((n, i) => (
          <span key={i} className={`px-3 py-1.5 rounded-xl text-sm font-semibold border ${
            n.isCurrent ? "bg-yellow-900/30 text-yellow-400 border-yellow-800" : "bg-dark-card text-white/50 border-dark-border"
          }`}>
            {n.level} ({n.year}){n.isCurrent ? " ✓" : ""}
          </span>
        ))}
      </div>
    </div>
  )}

  {/* Tournaments */}
  {p.tournaments?.length > 0 && (
    <div>
      <h4 className="font-semibold text-sm mb-3 text-white/80">🏆 {t("profile.tournaments")}</h4>
      <div className="flex flex-wrap gap-2">
        {p.tournaments.map((to, i) => (
          <span key={i} className="bg-primary-900/30 text-primary-400 px-3 py-1 rounded-full text-xs font-semibold border border-primary-800">{to}</span>
        ))}
      </div>
    </div>
  )}
</>)}

          {tab === "matches" && (
            p.matchHistory?.length === 0 ? <p className="text-center py-12 text-white/30">{t("profile.noMatches")}</p> :
            <div className="space-y-3">
              {p.matchHistory?.map((m, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-dark-card rounded-xl border border-dark-border">
                  <div>
                    <p className="font-semibold">{m.opponent}</p>
                    <p className="text-xs text-white/40">{m.tournament} • {m.date}</p>
                    <p className="text-xs text-primary-400 mt-1">{m.performance}</p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-xl font-bold text-sm ${
                    m.result.startsWith("W") ? "bg-green-900/30 text-green-400 border border-green-800" :
                    m.result.startsWith("D") ? "bg-yellow-900/30 text-yellow-400 border border-yellow-800" :
                    "bg-red-900/30 text-red-400 border border-red-800"
                  }`}>{m.result}</span>
                </div>
              ))}
            </div>
          )}

          {tab === "videos" && (
            p.videos?.length === 0 ? <p className="text-center py-12 text-white/30">{t("profile.noVideos")}</p> :
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {p.videos?.map((v, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-dark-border card-hover">
                  <a href={v.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center h-48 bg-gradient-to-br from-primary-900 to-dark">
                    {v.thumbnailUrl ? <img src={v.thumbnailUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-5xl">▶️</span>}
                  </a>
                  <div className="p-3 bg-dark-card flex justify-between items-center">
                    <span className="text-sm font-semibold">🎬 {v.title || `Video ${i + 1}`}</span>
                    <a href={v.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-400 font-semibold">Open ↗</a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "calendar" && (
  <div>
    <p className="text-sm text-white/50 mb-4 text-center">
      <span className="text-green-400 font-semibold">Green</span> = Available •{" "}
      <span className="text-red-400 font-semibold">Red</span> = Unavailable
    </p>
    <div className="max-w-sm mx-auto">
      <AvailabilityCalendar
        unavailableDates={p.unavailableDates || []}
        onToggleDate={() => {}}
        readOnly
      />
    </div>
  </div>
)}

          {tab === "reviews" && (<>
            <div className="space-y-3 mb-6">
              {p.reviews?.length === 0 ? <p className="text-center py-8 text-white/30">{t("profile.noReviews")}</p> :
                p.reviews?.map((r: Review, i: number) => (
                  <div key={i} className="p-4 bg-dark-card rounded-xl border border-dark-border">
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-sm">{r.author?.name || "Anonymous"}</span>
                      <span className="text-xs text-white/30">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <Stars rating={r.rating} />
                    <p className="text-sm text-white/60 mt-2">{r.text}</p>
                  </div>
                ))}
            </div>
            {isHirer && (
              <div className="border-t border-dark-border pt-6">
                <h4 className="font-semibold mb-3">{t("profile.leaveReview")}</h4>
                <div className="mb-3">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setReviewRating(n)} className={`text-2xl ${n <= reviewRating ? "text-yellow-400" : "text-white/20"}`}>★</button>
                  ))}
                </div>
                <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} rows={3} placeholder="..."
                  className="w-full px-4 py-3 rounded-xl bg-dark-card border border-dark-border text-white text-sm mb-3" />
                <button onClick={submitReview} disabled={submitting}
                  className="w-full sm:w-auto btn-primary text-white px-6 py-2.5 rounded-xl font-semibold disabled:opacity-50">
                  {submitting ? "..." : t("profile.submitReview")}
                </button>
              </div>
            )}
          </>)}
        </div>
      </div>

      <Footer />
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}