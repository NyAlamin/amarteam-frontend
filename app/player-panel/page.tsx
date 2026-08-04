"use client";

import { useEffect, useState } from "react";
import { playersAPI } from "@/lib/api";
import FileUpload from "@/components/ui/file-upload";
import LocationPicker from "@/components/ui/location-picker";
import PdfDownloadButton from "@/components/ui/pdf-download-button";
import Toast from "@/components/ui/toast";
import Loading from "@/components/ui/loading";
import { useToast } from "@/lib/hooks";
import {
  Player, ClubEntry, NationalTeamEntry, NATIONAL_LEVELS,
  COACH_SPECIALIZATIONS, REFEREE_LICENSES, FOOTBALL_POSITIONS,
} from "@/lib/types";

const INPUT = "w-full px-3 py-2.5 rounded-lg bg-dark-card border border-dark-border text-white text-sm outline-none focus:border-primary-500";
const SMALL = "px-2 py-2 rounded-lg bg-dark border border-dark-border text-white text-sm outline-none focus:border-primary-500";
const LABEL = "block text-sm font-semibold mb-1 text-white/80";

export default function PlayerProfilePage() {
  const { toast, showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Player | null>(null);

  const [photoUrl, setPhotoUrl] = useState("");
  const [photoPublicId, setPhotoPublicId] = useState("");
  const [playerType, setPlayerType] = useState("player");
  const [isApproved, setIsApproved] = useState(false);
  const [clubs, setClubs] = useState<ClubEntry[]>([]);
  const [nationals, setNationals] = useState<NationalTeamEntry[]>([]);

  const [form, setForm] = useState({
    bio: "", location: "", district: "", upazila: "",
    age: 20, experience: 0, position: "ST",
    coachingLicense: "", specialization: "Head Coach", tacticsStyle: "",
    refereeLicense: "District Level", fifaBadge: false, matchesOfficiated: 0,
    perMatchRate: 0, equipment: "", hasDrone: false, doesEditing: false,
  });

  const upd = (k: string, v: any) => setForm({ ...form, [k]: v });
  const isPlayer = playerType === "player";
  const isCoach = playerType === "coach";
  const isReferee = playerType === "referee";
  const isCameraman = playerType === "cameraman";

  useEffect(() => {
    playersAPI.getMyProfile().then(r => {
      const p = r.data;
      setProfile(p);
      setPhotoUrl(p.photo || ""); setPhotoPublicId(p.photoPublicId || "");
      setPlayerType(p.playerType || "player");
      setIsApproved(p.isApproved || false);
      setClubs(p.clubs || []); setNationals(p.nationalTeams || []);
      setForm({
        bio: p.bio || "", location: p.location || "",
        district: p.district || "", upazila: p.upazila || "",
        age: p.age || 20, experience: p.experience || 0,
        position: p.position || "ST",
        coachingLicense: p.coachingLicense || "", specialization: p.specialization || "Head Coach",
        tacticsStyle: p.tacticsStyle || "",
        refereeLicense: p.refereeLicense || "District Level",
        fifaBadge: p.fifaBadge || false, matchesOfficiated: p.matchesOfficiated || 0,
        perMatchRate: p.perMatchRate || 0, equipment: p.equipment || "",
        hasDrone: p.hasDrone || false, doesEditing: p.doesEditing || false,
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const addClub = () => setClubs([...clubs, { name: "", joinYear: 2024, leftYear: null, isCurrent: false }]);
  const removeClub = (i: number) => setClubs(clubs.filter((_, idx) => idx !== i));
  const updClub = (i: number, f: string, v: any) => {
    const u = [...clubs]; (u[i] as any)[f] = v;
    if (f === "isCurrent" && v) { u.forEach((c, idx) => { if (idx !== i) c.isCurrent = false; }); u[i].leftYear = null; }
    setClubs(u);
  };

  const addNat = () => setNationals([...nationals, { level: "Senior", year: 2024, isCurrent: true }]);
  const removeNat = (i: number) => setNationals(nationals.filter((_, idx) => idx !== i));
  const updNat = (i: number, f: string, v: any) => {
    const u = [...nationals]; (u[i] as any)[f] = v; setNationals(u);
  };

  const onSave = async () => {
    if (isCameraman && !form.district) {
      showToast("District is required for cameramen", "error"); return;
    }

    setSaving(true);
    try {
      const payload: any = {
        bio: form.bio, location: form.location,
        district: form.district || undefined,
        upazila: form.upazila || undefined,
        age: Number(form.age), experience: Number(form.experience),
        photo: photoUrl, photoPublicId,
        clubs, nationalTeams: nationals,
      };

      if (isPlayer) payload.position = form.position;
      if (isCoach) {
        payload.coachingLicense = form.coachingLicense;
        payload.specialization = form.specialization;
        payload.tacticsStyle = form.tacticsStyle;
      }
      if (isReferee) {
        payload.refereeLicense = form.refereeLicense;
        payload.fifaBadge = form.fifaBadge;
        payload.matchesOfficiated = Number(form.matchesOfficiated);
      }
      if (isCameraman) {
        payload.perMatchRate = Number(form.perMatchRate);
        payload.equipment = form.equipment;
        payload.hasDrone = form.hasDrone;
        payload.doesEditing = form.doesEditing;
      }

      await playersAPI.selfUpdate(payload);
      showToast("Profile saved!");
    } catch (err: any) {
      const msg = err.response?.data?.message;
      showToast(Array.isArray(msg) ? msg[0] : (msg || "Failed"), "error");
    } finally { setSaving(false); }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-4">
      {/* Approval banner */}
      {!isApproved ? (
        <div className="bg-yellow-900/20 border border-yellow-800 rounded-2xl p-4">
          <p className="text-yellow-400 font-semibold text-sm mb-1">⏳ Pending Approval</p>
          <p className="text-white/50 text-xs">
            Complete your profile below. Admin will review and publish it.
          </p>
        </div>
      ) : (
        <div className="bg-primary-900/20 border border-primary-800 rounded-2xl p-4 flex justify-between items-center gap-3">
          <p className="text-primary-400 font-semibold text-sm">✓ Approved — visible to clients</p>
          {profile && <PdfDownloadButton player={profile} variant="dark" label="CV" />}
        </div>
      )}

      <div className="glass rounded-2xl p-4 sm:p-6">
        <FileUpload type="image" label="Profile Photo" currentUrl={photoUrl}
          onUploaded={d => { setPhotoUrl(d.url); setPhotoPublicId(d.publicId); }} />

        <div className="space-y-5 mt-5">
          {/* Bio */}
          <div>
            <label className={LABEL}>Bio</label>
            <textarea value={form.bio} onChange={e => upd("bio", e.target.value)} rows={4}
              placeholder={
                isCameraman ? "Your style, experience covering matches..." :
                isCoach ? "Your coaching philosophy..." :
                isReferee ? "Your officiating experience..." :
                "Tell clubs about yourself..."
              }
              className={INPUT} />
          </div>

          {/* Location — required for cameramen */}
          <div className="border-t border-dark-border pt-4">
            <h3 className="font-semibold text-sm mb-3 text-white">
              📍 Location {isCameraman && <span className="text-red-400">*</span>}
            </h3>
            {isCameraman && (
              <p className="text-[11px] text-white/40 mb-3">
                Clients search cameramen by district and upazila — keep this accurate.
              </p>
            )}
            <LocationPicker
              district={form.district}
              upazila={form.upazila}
              onDistrictChange={v => upd("district", v)}
              onUpazilaChange={v => upd("upazila", v)}
              required={isCameraman}
            />
            <div className="mt-3">
              <label className={LABEL}>Area / Landmark</label>
              <input value={form.location} onChange={e => upd("location", e.target.value)}
                placeholder="e.g. Mirpur 10" className={INPUT} />
            </div>
          </div>

          {/* Age & Experience */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Age</label>
              <input type="number" value={form.age} onChange={e => upd("age", +e.target.value)} className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Experience (yrs)</label>
              <input type="number" value={form.experience} onChange={e => upd("experience", +e.target.value)} className={INPUT} />
            </div>
          </div>

          {/* PLAYER */}
          {isPlayer && (
            <div className="border-t border-dark-border pt-4">
              <h3 className="font-semibold text-sm mb-3 text-white">⚽ Position</h3>
              <select value={form.position} onChange={e => upd("position", e.target.value)} className={INPUT}>
                {FOOTBALL_POSITIONS.map(p => (
                  <option key={p.key} value={p.key}>{p.key} — {p.label}</option>
                ))}
              </select>
              <p className="text-[11px] text-white/30 mt-1.5">
                Hirers search by exact position on the pitch
              </p>
            </div>
          )}

          {/* COACH */}
          {isCoach && (
            <div className="border-t border-dark-border pt-4 space-y-3">
              <h3 className="font-semibold text-sm text-white">🎓 Coaching Details</h3>
              <div>
                <label className={LABEL}>Specialization</label>
                <select value={form.specialization} onChange={e => upd("specialization", e.target.value)} className={INPUT}>
                  {COACH_SPECIALIZATIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL}>Coaching License</label>
                <input value={form.coachingLicense} onChange={e => upd("coachingLicense", e.target.value)}
                  placeholder="AFC C License" className={INPUT} />
              </div>
              <div>
                <label className={LABEL}>Tactical Style</label>
                <textarea value={form.tacticsStyle} onChange={e => upd("tacticsStyle", e.target.value)} rows={2} className={INPUT} />
              </div>
            </div>
          )}

          {/* REFEREE */}
          {isReferee && (
            <div className="border-t border-dark-border pt-4 space-y-3">
              <h3 className="font-semibold text-sm text-white">🏁 Referee Details</h3>
              <div>
                <label className={LABEL}>License Level</label>
                <select value={form.refereeLicense} onChange={e => upd("refereeLicense", e.target.value)} className={INPUT}>
                  {REFEREE_LICENSES.map(l => <option key={l}>{l}</option>)}
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
                <span className="text-white/80 font-semibold">🏅 FIFA Badge Holder</span>
              </label>
            </div>
          )}

          {/* CAMERAMAN */}
          {isCameraman && (
            <div className="border-t border-dark-border pt-4 space-y-3">
              <h3 className="font-semibold text-sm text-white">📷 Cameraman Details</h3>
              <div>
                <label className={LABEL}>Rate per Match (৳)</label>
                <input type="number" value={form.perMatchRate}
                  onChange={e => upd("perMatchRate", +e.target.value)}
                  placeholder="5000" className={INPUT} />
                <p className="text-[11px] text-white/30 mt-1.5">
                  Shown publicly on your profile — clients see this before booking
                </p>
              </div>
              <div>
                <label className={LABEL}>Equipment</label>
                <input value={form.equipment} onChange={e => upd("equipment", e.target.value)}
                  placeholder="Sony A7 III, 70-200mm lens, gimbal" className={INPUT} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.hasDrone}
                    onChange={e => upd("hasDrone", e.target.checked)} className="rounded" />
                  <span className="text-white/80 font-semibold">🚁 I have a drone</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.doesEditing}
                    onChange={e => upd("doesEditing", e.target.checked)} className="rounded" />
                  <span className="text-white/80 font-semibold">✂️ I provide editing</span>
                </label>
              </div>
            </div>
          )}

          {/* Clubs / Associations / Work history */}
          <div className="border-t border-dark-border pt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-sm text-white">
                {isCameraman ? "🏛️ Work History" : isReferee ? "🏛️ Associations" : isCoach ? "🏟️ Coaching History" : "🏟️ My Clubs"}
              </h3>
              <button type="button" onClick={addClub} className="text-primary-400 text-sm font-semibold">+ Add</button>
            </div>
            {clubs.length === 0 && <p className="text-white/25 text-sm">No entries yet.</p>}
            {clubs.map((c, i) => (
              <div key={i} className="bg-dark-card rounded-xl p-3 mb-2 border border-dark-border">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input placeholder={isCameraman ? "Client / Company" : "Name"} value={c.name}
                    onChange={e => updClub(i, "name", e.target.value)} className={SMALL} />
                  <input type="number" placeholder="From" value={c.joinYear}
                    onChange={e => updClub(i, "joinYear", +e.target.value)} className={SMALL} />
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <label className="flex items-center gap-1.5 text-sm text-white/70 cursor-pointer">
                    <input type="checkbox" checked={c.isCurrent}
                      onChange={e => updClub(i, "isCurrent", e.target.checked)} className="rounded" /> Current
                  </label>
                  {!c.isCurrent && (
                    <input type="number" placeholder="To" value={c.leftYear || ""}
                      onChange={e => updClub(i, "leftYear", +e.target.value || null)}
                      className={`${SMALL} w-24`} />
                  )}
                  <button type="button" onClick={() => removeClub(i)}
                    className="text-red-400 text-xs ml-auto">Remove</button>
                </div>
              </div>
            ))}
          </div>

          {/* National team — not for referees or cameramen */}
          {!isReferee && !isCameraman && (
            <div className="border-t border-dark-border pt-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-sm text-white">🇧🇩 National Team</h3>
                <button type="button" onClick={addNat} className="text-primary-400 text-sm font-semibold">+ Add</button>
              </div>
              {nationals.length === 0 && <p className="text-white/25 text-sm">No entries.</p>}
              {nationals.map((n, i) => (
                <div key={i} className="bg-dark-card rounded-xl p-3 mb-2 border border-dark-border">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <select value={n.level} onChange={e => updNat(i, "level", e.target.value)}
                      className={`${SMALL} flex-1 min-w-[100px]`}>
                      {NATIONAL_LEVELS.map(l => <option key={l}>{l}</option>)}
                    </select>
                    <input type="number" value={n.year} onChange={e => updNat(i, "year", +e.target.value)}
                      className={`${SMALL} w-24`} />
                    <label className="flex items-center gap-1.5 text-sm text-white/70 cursor-pointer">
                      <input type="checkbox" checked={n.isCurrent}
                        onChange={e => updNat(i, "isCurrent", e.target.checked)} className="rounded" /> Current
                    </label>
                  </div>
                  <button type="button" onClick={() => removeNat(i)} className="text-red-400 text-xs">Remove</button>
                </div>
              ))}
            </div>
          )}

          <button onClick={onSave} disabled={saving}
            className="w-full btn-primary text-white py-3.5 rounded-xl font-bold disabled:opacity-50">
            {saving ? "Saving..." : "💾 Save Profile"}
          </button>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}