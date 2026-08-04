"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import LocationPicker from "@/components/ui/location-picker";
import AvailabilityCalendar from "@/components/ui/availability-calendar";
import { Stars } from "@/components/ui/player-card";
import Toast from "@/components/ui/toast";
import Loading from "@/components/ui/loading";
import { playersAPI, cameramenAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/hooks";
import { Player } from "@/lib/types";

export default function CameramanDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast, showToast } = useToast();

  const [c, setC] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("photos");
  const [submitting, setSubmitting] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const [matchDate, setMatchDate] = useState("");
  const [tournament, setTournament] = useState("");
  const [district, setDistrict] = useState("");
  const [upazila, setUpazila] = useState("");
  const [venue, setVenue] = useState("");
  const [startTime, setStartTime] = useState("");
  const [durationHours, setDurationHours] = useState(2);
  const [message, setMessage] = useState("");

  useEffect(() => {
    playersAPI.getOne(id as string)
      .then(r => {
        setC(r.data);
        if (r.data.district) setDistrict(r.data.district);
        if (r.data.upazila) setUpazila(r.data.upazila);
      })
      .catch(() => router.push("/cameramen"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDateSelect = (date: string) => {
    if (c?.unavailableDates?.includes(date)) {
      showToast("Cameraman is not available on this date", "error");
      return;
    }
    setMatchDate(date);
    setShowCalendar(false);
  };

  const onSubmit = async () => {
    if (!user) { router.push("/auth/login"); return; }
    if (!matchDate) { showToast("Select a match date", "error"); return; }
    if (!district) { showToast("Select a district", "error"); return; }

    setSubmitting(true);
    try {
      await cameramenAPI.createBooking({
        cameramanId: id,
        matchDate,
        tournament: tournament || undefined,
        district,
        upazila: upazila || undefined,
        venue: venue || undefined,
        startTime: startTime || undefined,
        durationHours: Number(durationHours),
        message: message || undefined,
      });
      showToast("Booking submitted! We'll contact you shortly.");
      setTimeout(() => router.push("/cameramen"), 2500);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      showToast(Array.isArray(msg) ? msg[0] : (msg || "Booking failed"), "error");
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="min-h-screen bg-dark"><Navbar /><div className="pt-24"><Loading /></div></div>;
  if (!c) return null;

  const photos = c.portfolioPhotos || [];
  const videos = c.portfolioVideos || [];

  return (
    <div className="min-h-screen bg-dark text-white">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 pt-24 pb-16">
        {/* Hero */}
        <div className="relative rounded-3xl overflow-hidden mb-6 animate-[scaleIn_0.4s_ease-out]">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-dark to-purple-950" />
          {c.photo && <div className="absolute inset-0 opacity-20"><img src={c.photo} alt="" className="w-full h-full object-cover blur-2xl" /></div>}

          <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
            {c.photo ? (
              <img src={c.photo} alt="" className="w-32 h-32 rounded-2xl object-cover border-2 border-white/10 shadow-2xl" />
            ) : (
              <div className="w-32 h-32 rounded-2xl bg-purple-800 flex items-center justify-center text-5xl font-bold text-white/30">
                {c.user?.name?.charAt(0)}
              </div>
            )}

            <div className="text-center sm:text-left">
              <div className="flex flex-wrap items-center gap-2 mb-2 justify-center sm:justify-start">
                <h1 className="text-2xl sm:text-3xl font-bold">{c.user?.name}</h1>
                <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">📷 Cameraman</span>
              </div>
              <p className="text-white/50 mb-2">
                📍 {c.upazila ? `${c.upazila}, ` : ""}{c.district || "Bangladesh"}
              </p>
              {(c.reviews?.length ?? 0) > 0 ? <Stars rating={c.rating} /> : <span className="text-white/30 text-sm">New to the platform</span>}

              <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
                {c.perMatchRate ? (
                  <span className="bg-white/15 text-white px-4 py-1.5 rounded-full font-bold text-sm">
                    ৳{c.perMatchRate.toLocaleString()}/match
                  </span>
                ) : (
                  <span className="bg-white/10 text-white/60 px-4 py-1.5 rounded-full text-sm">Rate on request</span>
                )}
                <span className={`px-4 py-1.5 rounded-full font-semibold text-sm ${
                  c.isAvailable ? "bg-green-500/30 text-green-300" : "bg-red-500/30 text-red-300"
                }`}>
                  {c.isAvailable ? "✓ Available" : "✕ Unavailable"}
                </span>
                <span className="bg-white/10 px-4 py-1.5 rounded-full text-sm text-white/60">
                  {c.experience} yr exp
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT — Portfolio */}
          <div className="lg:col-span-2 space-y-4">
            {/* Bio & Equipment */}
            <div className="glass rounded-2xl p-5">
              {c.bio && <p className="text-white/60 leading-relaxed mb-4">{c.bio}</p>}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { l: "Photos", v: photos.length, i: "📸" },
                  { l: "Videos", v: videos.length, i: "🎬" },
                  { l: "Drone", v: c.hasDrone ? "Yes" : "No", i: "🚁" },
                  { l: "Editing", v: c.doesEditing ? "Yes" : "No", i: "✂️" },
                ].map((s, i) => (
                  <div key={i} className="bg-dark-card rounded-xl p-3 text-center border border-dark-border">
                    <div className="text-lg">{s.i}</div>
                    <div className="font-bold text-sm">{s.v}</div>
                    <div className="text-[10px] text-white/40">{s.l}</div>
                  </div>
                ))}
              </div>

              {c.equipment && (
                <div className="mt-4 p-4 bg-dark-card rounded-xl border border-dark-border">
                  <p className="text-[11px] text-white/40 mb-1">🎥 Equipment</p>
                  <p className="text-sm text-white/70">{c.equipment}</p>
                </div>
              )}
            </div>

            {/* Portfolio tabs */}
            <div className="glass rounded-2xl p-5">
              <div className="flex gap-1 bg-dark-card rounded-xl p-1 mb-5">
                {[
                  { k: "photos", l: `📸 Photos (${photos.length})` },
                  { k: "videos", l: `🎬 Videos (${videos.length})` },
                  { k: "availability", l: "📅 Availability" },
                ].map(t => (
                  <button key={t.k} onClick={() => setTab(t.k)}
                    className={`flex-1 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                      tab === t.k ? "bg-purple-600 text-white" : "text-white/50 hover:text-white"
                    }`}>
                    {t.l}
                  </button>
                ))}
              </div>

              {tab === "photos" && (
                photos.length === 0 ? (
                  <p className="text-center py-12 text-white/30 text-sm">No photos uploaded yet.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {photos.map((p, i) => (
                      <button key={i} onClick={() => setLightbox(p.url)}
                        className="aspect-square rounded-xl overflow-hidden border border-dark-border hover:border-purple-500 transition group">
                        <img src={p.url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </button>
                    ))}
                  </div>
                )
              )}

              {tab === "videos" && (
                videos.length === 0 ? (
                  <p className="text-center py-12 text-white/30 text-sm">No videos uploaded yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {videos.map((v, i) => (
                      <div key={i} className="rounded-xl overflow-hidden border border-dark-border">
                        <video src={v.url} controls poster={v.thumbnailUrl}
                          className="w-full h-44 object-cover bg-black" />
                        <div className="p-3 bg-dark-card">
                          <p className="text-sm font-semibold truncate">{v.title || `Video ${i + 1}`}</p>
                          {v.duration && (
                            <p className="text-[10px] text-white/30">
                              {Math.floor(v.duration / 60)}:{String(Math.floor(v.duration % 60)).padStart(2, "0")}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {tab === "availability" && (
                <div className="max-w-sm mx-auto">
                  <p className="text-center text-xs text-white/40 mb-4">
                    <span className="text-green-400 font-semibold">Green</span> = Available •{" "}
                    <span className="text-red-400 font-semibold">Red</span> = Booked
                  </p>
                  <AvailabilityCalendar
                    unavailableDates={c.unavailableDates || []}
                    onToggleDate={() => {}}
                    readOnly
                  />
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — Booking */}
          <div className="space-y-4">
            <div className="glass rounded-2xl p-5 lg:sticky lg:top-24">
              <h3 className="font-bold mb-4">📷 Book This Cameraman</h3>

              {!c.isAvailable ? (
                <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 text-center">
                  <p className="text-red-400 font-semibold text-sm">Currently Unavailable</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Date */}
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-white/80">Match Date *</label>
                    <button type="button" onClick={() => setShowCalendar(!showCalendar)}
                      className="w-full px-3 py-2.5 rounded-lg bg-dark-card border border-dark-border text-left flex justify-between items-center hover:border-purple-500 transition text-sm">
                      <span className={matchDate ? "text-white" : "text-white/30"}>
                        {matchDate || "Tap to select"}
                      </span>
                      <span className="text-purple-400">📅</span>
                    </button>
                    {showCalendar && (
                      <div className="mt-3 animate-[slideUp_0.3s_ease-out]">
                        <AvailabilityCalendar
                          unavailableDates={c.unavailableDates || []}
                          onToggleDate={handleDateSelect}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1 text-white/80">Tournament</label>
                    <input value={tournament} onChange={e => setTournament(e.target.value)} placeholder="Mirpur Cup"
                      className="w-full px-3 py-2.5 rounded-lg bg-dark-card border border-dark-border text-white text-sm outline-none focus:border-purple-500" />
                  </div>

                  <LocationPicker
                    district={district}
                    upazila={upazila}
                    onDistrictChange={setDistrict}
                    onUpazilaChange={setUpazila}
                    required
                  />

                  <div>
                    <label className="block text-sm font-semibold mb-1 text-white/80">Venue / Ground</label>
                    <input value={venue} onChange={e => setVenue(e.target.value)} placeholder="Ground name"
                      className="w-full px-3 py-2.5 rounded-lg bg-dark-card border border-dark-border text-white text-sm outline-none focus:border-purple-500" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-white/80">Start Time</label>
                      <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg bg-dark-card border border-dark-border text-white text-sm outline-none focus:border-purple-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-white/80">Hours</label>
                      <input type="number" min={1} max={24} value={durationHours}
                        onChange={e => setDurationHours(+e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg bg-dark-card border border-dark-border text-white text-sm outline-none focus:border-purple-500" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1 text-white/80">Message</label>
                    <textarea value={message} onChange={e => setMessage(e.target.value)} rows={2}
                      placeholder="Coverage needs, deliverables..."
                      className="w-full px-3 py-2.5 rounded-lg bg-dark-card border border-dark-border text-white text-sm outline-none focus:border-purple-500" />
                  </div>

                  {c.perMatchRate && (
                    <div className="bg-purple-900/20 border border-purple-800 rounded-xl p-3 text-center">
                      <p className="text-[11px] text-white/40">Quoted rate</p>
                      <p className="text-2xl font-bold text-purple-400">৳{c.perMatchRate.toLocaleString()}</p>
                    </div>
                  )}

                  <button onClick={onSubmit} disabled={submitting}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3.5 rounded-xl font-bold disabled:opacity-50 transition">
                    {submitting ? "Submitting..." : user ? "📷 Book Now" : "Login to Book"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[9999] p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" className="max-w-full max-h-full rounded-xl" />
          <button onClick={() => setLightbox(null)} className="absolute top-6 right-6 text-white text-3xl">✕</button>
        </div>
      )}

      <Footer />
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}