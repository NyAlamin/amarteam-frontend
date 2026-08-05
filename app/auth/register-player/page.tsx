"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/navbar";
import Toast from "@/components/ui/toast";
import FileUpload from "@/components/ui/file-upload";
import { playersAPI } from "@/lib/api";
import { useLang } from "@/lib/language-context";
import { useToast } from "@/lib/hooks";
import {
  ClubEntry, NationalTeamEntry, NATIONAL_LEVELS,
  PLAYER_TYPES, COACH_SPECIALIZATIONS, REFEREE_LICENSES,
} from "@/lib/types";
import LocationPicker from "@/components/ui/location-picker";

const INPUT = "w-full px-3 py-2.5 rounded-lg bg-dark-card border border-dark-border text-white text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition";
const SMALL_INPUT = "px-2 py-2 rounded-lg bg-dark border border-dark-border text-white text-sm outline-none focus:border-primary-500";
const LABEL = "block text-sm font-semibold mb-1 text-white/80";

const TYPE_ICONS: Record<string, string> = {
  player: "⚽",
  coach: "🎓",
  referee: "🏁",
  cameraman: "📷",
};

export default function RegisterPlayerPage() {
  const router = useRouter();
  const { t, lang } = useLang();
  const { toast, showToast } = useToast();

  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");

  const [form, setForm] = useState({
  name: "", email: "", password: "", phone: "",
  playerType: "player",
  position: "ST",
  age: 20, experience: 0, location: "", bio: "",
  // Coach
  coachingLicense: "", specialization: "Head Coach", tacticsStyle: "",
  // Referee
  refereeLicense: "District Level", fifaBadge: false, matchesOfficiated: 0,
  // Cameraman
  district: "", upazila: "", perMatchRate: 0, equipment: "",
  hasDrone: false, doesEditing: false,
});

  const [clubs, setClubs] = useState<ClubEntry[]>([{ name: "", joinYear: 2024, leftYear: null, isCurrent: true }]);
  const [nationals, setNationals] = useState<NationalTeamEntry[]>([]);

  const upd = (key: string, val: any) => setForm({ ...form, [key]: val });

  const isPlayer = form.playerType === "player";
  const isCoach = form.playerType === "coach";
  const isReferee = form.playerType === "referee";
  const isCameraman = form.playerType === "cameraman";

  const pickRole = (v: string) => {
    upd("playerType", v);
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Club handlers
  const addClub = () => setClubs([...clubs, { name: "", joinYear: 2024, leftYear: null, isCurrent: false }]);
  const removeClub = (i: number) => { if (clubs.length > 1) setClubs(clubs.filter((_, idx) => idx !== i)); };
  const updateClub = (i: number, field: string, value: any) => {
    const u = [...clubs];
    (u[i] as any)[field] = value;
    if (field === "isCurrent" && value) {
      u.forEach((c, idx) => { if (idx !== i) c.isCurrent = false; });
      u[i].leftYear = null;
    }
    setClubs(u);
  };

  // National handlers
  const addNational = () => setNationals([...nationals, { level: "Senior", year: 2024, isCurrent: true }]);
  const removeNational = (i: number) => setNationals(nationals.filter((_, idx) => idx !== i));
  const updateNational = (i: number, field: string, value: any) => {
    const u = [...nationals];
    (u[i] as any)[field] = value;
    setNationals(u);
  };

  const onSubmit = async () => {
  // Common validation
  if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
    showToast("Name, email & password are required", "error"); return;
  }
  if (form.password.length < 8) {
    showToast("Password must be at least 8 characters", "error"); return;
  }
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
    showToast("Password needs uppercase, lowercase & a number", "error"); return;
  }
  if (!/^01\d{9}$/.test(form.phone)) {
    showToast("Enter a valid BD phone number (01XXXXXXXXX)", "error"); return;
  }

  // Cameraman-specific validation
  if (isCameraman) {
    if (!form.district) { showToast("District is required", "error"); return; }
    if (!form.upazila) { showToast("Upazila is required", "error"); return; }
    if (!form.perMatchRate || form.perMatchRate < 1) {
      showToast("Enter your rate per match", "error"); return;
    }
  } else {
    // Player/Coach/Referee need at least one club
    if (clubs.length === 0 || !clubs[0].name.trim()) {
      showToast(isReferee ? "At least one association is required" : "At least one club is required", "error");
      return;
    }
  }

  setSubmitting(true);
  try {
    const payload: any = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      phone: form.phone,
      playerType: form.playerType,
      age: Number(form.age),
      experience: Number(form.experience),
      location: form.location || undefined,
      bio: form.bio || undefined,
      photo: photoUrl || undefined,
      clubs: clubs.filter(c => c.name.trim()).map(c => ({
        name: c.name.trim(),
        joinYear: Number(c.joinYear),
        leftYear: c.isCurrent ? null : (c.leftYear ? Number(c.leftYear) : null),
        isCurrent: c.isCurrent,
      })),
      nationalTeams: nationals.map(n => ({
        level: n.level,
        year: Number(n.year),
        isCurrent: n.isCurrent,
      })),
    };

    if (isPlayer) payload.position = form.position;

    if (isCoach) {
      payload.coachingLicense = form.coachingLicense || undefined;
      payload.specialization = form.specialization;
      payload.tacticsStyle = form.tacticsStyle || undefined;
    }

    if (isReferee) {
      payload.refereeLicense = form.refereeLicense;
      payload.fifaBadge = form.fifaBadge;
      payload.matchesOfficiated = Number(form.matchesOfficiated);
    }

    if (isCameraman) {
      payload.district = form.district;
      payload.upazila = form.upazila;
      payload.perMatchRate = Number(form.perMatchRate);
      payload.equipment = form.equipment || undefined;
      payload.hasDrone = form.hasDrone;
      payload.doesEditing = form.doesEditing;
    }

    await playersAPI.register(payload);
    showToast("Registration submitted! Admin will review your profile.");
    setTimeout(() => router.push("/"), 3000);
  } catch (err: any) {
    const msg = err.response?.data?.message;
    showToast(Array.isArray(msg) ? msg[0] : (msg || "Registration failed"), "error");
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className="min-h-screen bg-dark text-white">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 pt-24 pb-16">
        <div className="glass rounded-2xl p-5 sm:p-8 animate-[scaleIn_0.4s_ease-out]">

          {/* Header */}
          <div className="text-center mb-8">
            <span className="text-4xl block mb-3">📝</span>
            <h1 className="text-2xl font-bold gradient-text">{t("reg.title")}</h1>
            <p className="text-white/50 text-sm mt-2">{t("reg.subtitle")}</p>
          </div>

          {/* ═══════════ STEP 1 — ROLE SELECTION ONLY ═══════════ */}
          {step === 1 && (
            <div className="animate-[fadeIn_0.4s_ease-out]">
              <label className={LABEL}>{t("reg.type")} *</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                {PLAYER_TYPES.map(pt => (
                  <button
                    key={pt.value}
                    type="button"
                    onClick={() => pickRole(pt.value)}
                    className="glass rounded-2xl p-6 text-center border-2 border-dark-border hover:border-primary-500 transition group"
                  >
                    <span className="block text-3xl mb-2 group-hover:scale-110 transition">
                      {TYPE_ICONS[pt.value]}
                    </span>
                    <span className="font-bold text-white text-sm block">
                      {lang === "bn" ? pt.labelBn : pt.labelEn}
                    </span>
                  </button>
                ))}
              </div>

              <p className="text-center text-sm text-white/40 mt-8">
                {t("auth.haveAccount")}{" "}
                <Link href="/auth/login" className="text-primary-400 font-semibold hover:underline">
                  {t("nav.login")}
                </Link>
              </p>
            </div>
          )}

          {/* ═══════════ STEP 2 — ROLE-SPECIFIC FORM ═══════════ */}
{step === 2 && (
  <div className="space-y-5 animate-[fadeIn_0.4s_ease-out]">

    {/* Selected role banner */}
    <button
      type="button"
      onClick={() => setStep(1)}
      className="w-full glass rounded-xl p-3 flex items-center gap-3 border-2 border-primary-600 hover:opacity-90 transition"
    >
      <span className="text-2xl">{TYPE_ICONS[form.playerType]}</span>
      <div className="flex-1 text-left">
        <p className="text-[10px] text-white/40 uppercase tracking-widest">Registering as</p>
        <p className="font-bold text-primary-400 text-sm">
          {lang === "bn"
            ? PLAYER_TYPES.find(p => p.value === form.playerType)?.labelBn
            : PLAYER_TYPES.find(p => p.value === form.playerType)?.labelEn}
        </p>
      </div>
      <span className="text-white/40 text-xs font-semibold">Change</span>
    </button>

    {/* Photo */}
    <FileUpload type="image" label="Profile Photo" isPublic onUploaded={d => setPhotoUrl(d.url)} />

    {/* ─── ACCOUNT (all roles) ─── */}
    <div className="border-t border-dark-border pt-4">
      <h3 className="font-semibold text-sm mb-3 text-white">🔐 Account Details</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Full Name *</label>
          <input value={form.name} onChange={e => upd("name", e.target.value)}
            placeholder="Your full name" className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Email *</label>
          <input type="email" value={form.email} onChange={e => upd("email", e.target.value)}
            placeholder="you@email.com" className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Password *</label>
          <input type="password" value={form.password} onChange={e => upd("password", e.target.value)}
            placeholder="Min 8 chars, Aa1" className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Phone *</label>
          <input value={form.phone} onChange={e => upd("phone", e.target.value)}
            placeholder="01XXXXXXXXX" className={INPUT} />
        </div>
      </div>
    </div>

    {/* ═══════════════════════════════════════════ */}
    {/* ─────────── CAMERAMAN FORM ─────────── */}
    {/* ═══════════════════════════════════════════ */}
    {isCameraman && (
      <>
        {/* Location — required */}
        <div className="border-t border-dark-border pt-4">
          <h3 className="font-semibold text-sm mb-1 text-white">📍 Service Location *</h3>
          <p className="text-[11px] text-white/40 mb-3">
            Clients search cameramen by district and upazila — this is how they find you.
          </p>
          <LocationPicker
  district={form.district}
  upazila={form.upazila}
  onDistrictChange={v => setForm(prev => ({ ...prev, district: v }))}
  onUpazilaChange={v => setForm(prev => ({ ...prev, upazila: v }))}
  required
/>
          <div className="mt-3">
            <label className={LABEL}>Area / Landmark</label>
            <input value={form.location} onChange={e => upd("location", e.target.value)}
              placeholder="e.g. Mirpur 10, near stadium" className={INPUT} />
          </div>
        </div>

        {/* Cameraman details */}
        <div className="border-t border-dark-border pt-4 space-y-3">
          <h3 className="font-semibold text-sm text-white">📷 Professional Details</h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Age *</label>
              <input type="number" value={form.age} onChange={e => upd("age", +e.target.value)} className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Experience (years) *</label>
              <input type="number" value={form.experience} onChange={e => upd("experience", +e.target.value)} className={INPUT} />
            </div>
          </div>

          <div>
            <label className={LABEL}>Rate per Match (৳) *</label>
            <input type="number" value={form.perMatchRate}
              onChange={e => upd("perMatchRate", +e.target.value)}
              placeholder="5000" className={INPUT} />
            <p className="text-[11px] text-white/30 mt-1.5">
              Shown publicly — clients see this before booking you
            </p>
          </div>

          <div>
            <label className={LABEL}>Equipment</label>
            <input value={form.equipment} onChange={e => upd("equipment", e.target.value)}
              placeholder="Sony A7 III, 70-200mm lens, gimbal, tripod" className={INPUT} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-2.5 text-sm cursor-pointer bg-dark-card border border-dark-border rounded-xl p-3">
              <input type="checkbox" checked={form.hasDrone}
                onChange={e => upd("hasDrone", e.target.checked)} className="rounded" />
              <div>
                <span className="text-white/90 font-semibold block">🚁 Drone</span>
                <span className="text-[10px] text-white/40">I own a drone</span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 text-sm cursor-pointer bg-dark-card border border-dark-border rounded-xl p-3">
              <input type="checkbox" checked={form.doesEditing}
                onChange={e => upd("doesEditing", e.target.checked)} className="rounded" />
              <div>
                <span className="text-white/90 font-semibold block">✂️ Editing</span>
                <span className="text-[10px] text-white/40">I edit footage too</span>
              </div>
            </label>
          </div>
        </div>

        {/* Work history — cameraman */}
        <div className="border-t border-dark-border pt-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-sm text-white">🏛️ Work History</h3>
            <button type="button" onClick={addClub} className="text-primary-400 text-sm font-semibold">+ Add</button>
          </div>
          <p className="text-[11px] text-white/40 mb-3">
            Clubs, tournaments or companies you've covered. Optional but builds trust.
          </p>
          {clubs.map((c, i) => (
            <div key={i} className="bg-dark-card rounded-xl p-3 mb-2 border border-dark-border">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input placeholder="Client / Tournament" value={c.name}
                  onChange={e => updateClub(i, "name", e.target.value)} className={SMALL_INPUT} />
                <input type="number" placeholder="From year" value={c.joinYear}
                  onChange={e => updateClub(i, "joinYear", +e.target.value)} className={SMALL_INPUT} />
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <label className="flex items-center gap-1.5 text-sm text-white/70 cursor-pointer">
                  <input type="checkbox" checked={c.isCurrent}
                    onChange={e => updateClub(i, "isCurrent", e.target.checked)} className="rounded" />
                  Ongoing
                </label>
                {!c.isCurrent && (
                  <input type="number" placeholder="To year" value={c.leftYear || ""}
                    onChange={e => updateClub(i, "leftYear", +e.target.value || null)}
                    className={`${SMALL_INPUT} w-28`} />
                )}
                {clubs.length > 1 && (
                  <button type="button" onClick={() => removeClub(i)}
                    className="text-red-400 text-xs font-semibold ml-auto">Remove</button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Portfolio note */}
        <div className="bg-pink-900/20 border border-pink-800 rounded-xl p-4">
          <p className="text-pink-400 font-semibold text-sm mb-1">📸 Portfolio</p>
          <p className="text-white/50 text-xs">
            After logging in you can upload up to <strong>30 photos</strong> and <strong>5 videos</strong> (2 min each) to showcase your work.
          </p>
        </div>
      </>
    )}

    {/* ═══════════════════════════════════════════ */}
    {/* ─────────── PLAYER / COACH / REFEREE ─────────── */}
    {/* ═══════════════════════════════════════════ */}
    {!isCameraman && (
      <>
        <div className="border-t border-dark-border pt-4">
          <h3 className="font-semibold text-sm mb-3 text-white">📋 General Info</h3>

          {/* Position — players only */}
          {isPlayer && (
            <div className="mb-3">
              <label className={LABEL}>Position *</label>
              <select value={form.position} onChange={e => upd("position", e.target.value)} className={INPUT}>
                <optgroup label="🧤 Goalkeeper">
                  <option value="GK">GK — Goalkeeper</option>
                </optgroup>
                <optgroup label="🛡️ Defense">
                  <option value="LB">LB — Left Back</option>
                  <option value="CB">CB — Center Back</option>
                  <option value="RB">RB — Right Back</option>
                  <option value="LWB">LWB — Left Wing Back</option>
                  <option value="RWB">RWB — Right Wing Back</option>
                </optgroup>
                <optgroup label="⚙️ Midfield">
                  <option value="CDM">CDM — Defensive Midfielder</option>
                  <option value="CM">CM — Center Midfielder</option>
                  <option value="CAM">CAM — Attacking Midfielder</option>
                  <option value="LM">LM — Left Midfielder</option>
                  <option value="RM">RM — Right Midfielder</option>
                </optgroup>
                <optgroup label="⚡ Attack">
                  <option value="LW">LW — Left Winger</option>
                  <option value="RW">RW — Right Winger</option>
                  <option value="LF">LF — Left Forward</option>
                  <option value="CF">CF — Center Forward</option>
                  <option value="RF">RF — Right Forward</option>
                  <option value="ST">ST — Striker</option>
                </optgroup>
              </select>
              <p className="text-[11px] text-white/30 mt-1.5">
                Hirers search by exact position on the pitch
              </p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={LABEL}>Age *</label>
              <input type="number" value={form.age} onChange={e => upd("age", +e.target.value)} className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Experience</label>
              <input type="number" value={form.experience} onChange={e => upd("experience", +e.target.value)} className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Location</label>
              <input value={form.location} onChange={e => upd("location", e.target.value)}
                placeholder="City" className={INPUT} />
            </div>
          </div>
        </div>

        {/* Coach fields */}
        {isCoach && (
          <div className="border-t border-dark-border pt-4 space-y-3">
            <h3 className="font-semibold text-sm text-white">🎓 Coaching Details</h3>
            <div>
              <label className={LABEL}>Specialization *</label>
              <select value={form.specialization} onChange={e => upd("specialization", e.target.value)} className={INPUT}>
                {COACH_SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL}>Coaching License</label>
              <input value={form.coachingLicense} onChange={e => upd("coachingLicense", e.target.value)}
                placeholder="e.g. AFC C License, BFF License" className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Tactical Style</label>
              <textarea value={form.tacticsStyle} onChange={e => upd("tacticsStyle", e.target.value)} rows={2}
                placeholder="e.g. 4-3-3 possession-based, high pressing..." className={INPUT} />
            </div>
          </div>
        )}

        {/* Referee fields */}
        {isReferee && (
          <div className="border-t border-dark-border pt-4 space-y-3">
            <h3 className="font-semibold text-sm text-white">🏁 Referee Details</h3>
            <div>
              <label className={LABEL}>License Level *</label>
              <select value={form.refereeLicense} onChange={e => upd("refereeLicense", e.target.value)} className={INPUT}>
                {REFEREE_LICENSES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL}>Matches Officiated</label>
              <input type="number" value={form.matchesOfficiated}
                onChange={e => upd("matchesOfficiated", +e.target.value)} className={INPUT} />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.fifaBadge}
                onChange={e => upd("fifaBadge", e.target.checked)} className="rounded" />
              <span className="text-white/80 font-semibold">🏅 I hold a FIFA Badge</span>
            </label>
          </div>
        )}

        {/* Clubs / Associations */}
        <div className="border-t border-dark-border pt-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-sm text-white">
              {isReferee ? "🏛️ Associations" : isCoach ? "🏟️ Coaching History" : "🏟️ Club History"} *
            </h3>
            <button type="button" onClick={addClub} className="text-primary-400 text-sm font-semibold">+ Add</button>
          </div>
          {clubs.map((c, i) => (
            <div key={i} className="bg-dark-card rounded-xl p-3 mb-2 border border-dark-border">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input
                  placeholder={isReferee ? "Association name *" : "Club name *"}
                  value={c.name}
                  onChange={e => updateClub(i, "name", e.target.value)}
                  className={SMALL_INPUT}
                />
                <input type="number" placeholder="From year" value={c.joinYear}
                  onChange={e => updateClub(i, "joinYear", +e.target.value)} className={SMALL_INPUT} />
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <label className="flex items-center gap-1.5 text-sm text-white/70 cursor-pointer">
                  <input type="checkbox" checked={c.isCurrent}
                    onChange={e => updateClub(i, "isCurrent", e.target.checked)} className="rounded" />
                  Current
                </label>
                {!c.isCurrent && (
                  <input type="number" placeholder="To year" value={c.leftYear || ""}
                    onChange={e => updateClub(i, "leftYear", +e.target.value || null)}
                    className={`${SMALL_INPUT} w-28`} />
                )}
                {clubs.length > 1 && (
                  <button type="button" onClick={() => removeClub(i)}
                    className="text-red-400 text-xs font-semibold ml-auto">Remove</button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* National team — player & coach only */}
        {!isReferee && (
          <div className="border-t border-dark-border pt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-sm text-white">🇧🇩 National Team</h3>
              <button type="button" onClick={addNational} className="text-primary-400 text-sm font-semibold">+ Add</button>
            </div>
            {nationals.length === 0 && (
              <p className="text-white/30 text-sm">Optional — add if you represented Bangladesh.</p>
            )}
            {nationals.map((n, i) => (
              <div key={i} className="bg-dark-card rounded-xl p-3 mb-2 border border-dark-border">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <select value={n.level} onChange={e => updateNational(i, "level", e.target.value)}
                    className={`${SMALL_INPUT} flex-1 min-w-[100px]`}>
                    {NATIONAL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <input type="number" value={n.year} onChange={e => updateNational(i, "year", +e.target.value)}
                    className={`${SMALL_INPUT} w-24`} />
                  <label className="flex items-center gap-1.5 text-sm text-white/70 cursor-pointer">
                    <input type="checkbox" checked={n.isCurrent}
                      onChange={e => updateNational(i, "isCurrent", e.target.checked)} className="rounded" />
                    Current
                  </label>
                </div>
                <button type="button" onClick={() => removeNational(i)}
                  className="text-red-400 text-xs font-semibold">Remove</button>
              </div>
            ))}
          </div>
        )}
      </>
    )}

    {/* Bio — all roles */}
    <div className="border-t border-dark-border pt-4">
      <label className={LABEL}>Bio / About</label>
      <textarea value={form.bio} onChange={e => upd("bio", e.target.value)} rows={3}
        placeholder={
          isCameraman ? "Your shooting style, past coverage, what makes your work stand out..." :
          isCoach ? "Your coaching philosophy, achievements..." :
          isReferee ? "Your officiating experience, notable matches..." :
          "Tell us about yourself, playing style, achievements..."
        }
        className={INPUT} />
    </div>

    {/* Submit */}
    <button onClick={onSubmit} disabled={submitting}
      className="w-full btn-primary text-white py-3.5 rounded-xl font-bold text-lg disabled:opacity-50">
      {submitting ? "Submitting..." : "📝 Submit Registration"}
    </button>

    <button type="button" onClick={() => setStep(1)}
      className="w-full text-white/40 py-2 text-sm hover:text-white/60 transition">
      ← Back to role selection
    </button>

    <p className="text-center text-sm text-white/40">
      Already have an account?{" "}
      <Link href="/auth/login" className="text-primary-400 font-semibold hover:underline">
        Login
      </Link>
    </p>
  </div>
)}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}