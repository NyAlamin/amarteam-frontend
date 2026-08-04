"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPlayerSchema } from "@/lib/schemas";
import { playersAPI } from "@/lib/api";
import FileUpload from "@/components/ui/file-upload";
import Toast from "@/components/ui/toast";
import { useToast } from "@/lib/hooks";
import { useState } from "react";
import {
  ClubEntry, NationalTeamEntry, NATIONAL_LEVELS,
  PLAYER_TYPES, COACH_SPECIALIZATIONS, REFEREE_LICENSES,
} from "@/lib/types";

const INPUT = "w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition";
const LABEL = "block text-sm font-semibold mb-1 text-slate-700";
const SMALL_INPUT = "px-2 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-green-500";

export default function AddPlayerPage() {
  const router = useRouter();
  const { toast, showToast } = useToast();
  const [photoUrl, setPhotoUrl] = useState("");
  const [playerType, setPlayerType] = useState("player");
  const [clubs, setClubs] = useState<ClubEntry[]>([{ name: "", joinYear: 2024, leftYear: null, isCurrent: true }]);
  const [nationals, setNationals] = useState<NationalTeamEntry[]>([]);

  // Role-specific state
  const [coachData, setCoachData] = useState({ coachingLicense: "", specialization: "Head Coach", tacticsStyle: "" });
  const [refData, setRefData] = useState({ refereeLicense: "District Level", fifaBadge: false, matchesOfficiated: 0 });

  const isPlayer = playerType === "player";
  const isCoach = playerType === "coach";
  const isReferee = playerType === "referee";

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<any>({
    resolver: zodResolver(createPlayerSchema),
    defaultValues: { tier: "C", age: 20, experience: 1, position: "Striker" },
  });

  const addClub = () => setClubs([...clubs, { name: "", joinYear: 2024, leftYear: null, isCurrent: false }]);
  const removeClub = (i: number) => { if (clubs.length > 1) setClubs(clubs.filter((_, idx) => idx !== i)); };
  const updateClub = (i: number, field: string, value: any) => {
    const u = [...clubs]; (u[i] as any)[field] = value;
    if (field === "isCurrent" && value) { u.forEach((c, idx) => { if (idx !== i) c.isCurrent = false; }); u[i].leftYear = null; }
    setClubs(u);
  };

  const addNational = () => setNationals([...nationals, { level: "Senior", year: 2024, isCurrent: true }]);
  const removeNational = (i: number) => setNationals(nationals.filter((_, idx) => idx !== i));
  const updateNational = (i: number, field: string, value: any) => {
    const u = [...nationals]; (u[i] as any)[field] = value; setNationals(u);
  };

  const onSubmit = async (data: any) => {
    if (clubs.length === 0 || !clubs[0].name.trim()) {
      showToast("At least one club/association is required", "error");
      return;
    }
    if (clubs.find(c => !c.name.trim())) {
      showToast("All club entries must have a name", "error");
      return;
    }

    try {
      const payload: any = {
        ...data,
        photo: photoUrl || undefined,
        playerType,
        clubs: clubs.map(c => ({
          name: c.name.trim(),
          joinYear: c.joinYear,
          leftYear: c.isCurrent ? null : c.leftYear,
          isCurrent: c.isCurrent,
        })),
        nationalTeams: nationals,
      };

      if (!isPlayer) delete payload.position;
      if (isCoach) Object.assign(payload, coachData);
      if (isReferee) Object.assign(payload, { ...refData, matchesOfficiated: Number(refData.matchesOfficiated) });

      await playersAPI.create(payload);
      showToast(`${playerType.charAt(0).toUpperCase() + playerType.slice(1)} created!`);
      setTimeout(() => router.push("/admin/players"), 1500);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      showToast(Array.isArray(msg) ? msg[0] : (msg || "Failed to create"), "error");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="glass rounded-2xl p-4 sm:p-6">
        <h2 className="font-bold text-lg mb-5 text-white">Add New Profile</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Photo */}
          <FileUpload type="image" label="Photo" onUploaded={d => setPhotoUrl(d.url)} />

          {/* Type Selector */}
          <div>
            <label className={LABEL}>Type *</label>
            <div className="grid grid-cols-3 gap-2">
              {PLAYER_TYPES.map(pt => (
                <button key={pt.value} type="button" onClick={() => setPlayerType(pt.value)}
                  className={`py-3 rounded-xl text-sm font-bold transition border-2 ${
                    playerType === pt.value
                      ? "border-primary-500 bg-primary-900/40 text-primary-400"
                      : "border-dark-border bg-dark-card text-white/50 hover:border-white/20"
                  }`}>
                  <span className="block text-lg mb-0.5">
                    {pt.value === "player" ? "⚽" : pt.value === "coach" ? "🎓" : "🏁"}
                  </span>
                  {pt.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Account Info */}
          <div className="border-t border-dark-border pt-4">
            <h3 className="font-semibold text-sm mb-3 text-white">🔐 Account Credentials</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={LABEL}>Full Name *</label>
                <input {...register("name")} placeholder="Full name" className={INPUT} />
                {errors.name && <p className="text-red-400 text-xs mt-1">{(errors.name as any).message}</p>}
              </div>
              <div>
                <label className={LABEL}>Email *</label>
                <input {...register("email")} type="email" placeholder="unique@email.com" className={INPUT} />
                {errors.email && <p className="text-red-400 text-xs mt-1">{(errors.email as any).message}</p>}
              </div>
              <div>
                <label className={LABEL}>Password *</label>
                <input {...register("password")} type="password" placeholder="Min 8 chars, Aa1" className={INPUT} />
                {errors.password && <p className="text-red-400 text-xs mt-1">{(errors.password as any).message}</p>}
              </div>
              <div>
                <label className={LABEL}>Phone</label>
                <input {...register("phone")} placeholder="01XXXXXXXXX" className={INPUT} />
              </div>
            </div>
          </div>

          {/* General Info */}
          <div className="border-t border-dark-border pt-4">
            <h3 className="font-semibold text-sm mb-3 text-white">📋 General Info</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              {isPlayer && (
                <div>
                  <label className={LABEL}>Position *</label>
                  <select {...register("position")} className={INPUT}>
                    <option>Striker</option><option>Midfielder</option><option>Defender</option>
                    <option>Goalkeeper</option><option>Winger</option>
                  </select>
                </div>
              )}
              <div>
                <label className={LABEL}>Tier</label>
                <select {...register("tier")} className={INPUT}>
                  <option value="A">⭐ Tier A</option>
                  <option value="B">Tier B</option>
                  <option value="C">Tier C</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={LABEL}>Age *</label>
                <input type="number" {...register("age", { valueAsNumber: true })} className={INPUT} />
                {errors.age && <p className="text-red-400 text-xs mt-1">{(errors.age as any).message}</p>}
              </div>
              <div>
                <label className={LABEL}>Exp (yrs)</label>
                <input type="number" {...register("experience", { valueAsNumber: true })} className={INPUT} />
              </div>
              <div>
                <label className={LABEL}>Location</label>
                <input {...register("location")} placeholder="City" className={INPUT} />
              </div>
            </div>
          </div>

          {/* Coach fields */}
          {isCoach && (
            <div className="border-t border-dark-border pt-4 space-y-3">
              <h3 className="font-semibold text-sm text-white">🎓 Coaching Details</h3>
              <div>
                <label className={LABEL}>Specialization</label>
                <select value={coachData.specialization} onChange={e => setCoachData({ ...coachData, specialization: e.target.value })} className={INPUT}>
                  {COACH_SPECIALIZATIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL}>Coaching License</label>
                <input value={coachData.coachingLicense} onChange={e => setCoachData({ ...coachData, coachingLicense: e.target.value })}
                  placeholder="e.g. AFC C License" className={INPUT} />
              </div>
              <div>
                <label className={LABEL}>Tactical Style</label>
                <textarea value={coachData.tacticsStyle} onChange={e => setCoachData({ ...coachData, tacticsStyle: e.target.value })}
                  rows={2} placeholder="e.g. 4-3-3 possession-based" className={INPUT} />
              </div>
            </div>
          )}

          {/* Referee fields */}
          {isReferee && (
            <div className="border-t border-dark-border pt-4 space-y-3">
              <h3 className="font-semibold text-sm text-white">🏁 Referee Details</h3>
              <div>
                <label className={LABEL}>License Level</label>
                <select value={refData.refereeLicense} onChange={e => setRefData({ ...refData, refereeLicense: e.target.value })} className={INPUT}>
                  {REFEREE_LICENSES.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL}>Matches Officiated</label>
                <input type="number" value={refData.matchesOfficiated}
                  onChange={e => setRefData({ ...refData, matchesOfficiated: +e.target.value })} className={INPUT} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={refData.fifaBadge}
                  onChange={e => setRefData({ ...refData, fifaBadge: e.target.checked })} className="rounded" />
                <span className="text-white/80 font-semibold">🏅 FIFA Badge Holder</span>
              </label>
            </div>
          )}

          {/* Clubs */}
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
                  <input placeholder={isReferee ? "Association *" : "Club name *"} value={c.name}
                    onChange={e => updateClub(i, "name", e.target.value)} className={SMALL_INPUT} />
                  <input type="number" placeholder="From year" value={c.joinYear}
                    onChange={e => updateClub(i, "joinYear", +e.target.value)} className={SMALL_INPUT} />
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <label className="flex items-center gap-1.5 text-sm text-white/70">
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

          {/* National Team */}
          {!isReferee && (
            <div className="border-t border-dark-border pt-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-sm text-white">🇧🇩 National Team</h3>
                <button type="button" onClick={addNational} className="text-primary-400 text-sm font-semibold">+ Add</button>
              </div>
              {nationals.length === 0 && <p className="text-white/30 text-sm">Optional — add if applicable.</p>}
              {nationals.map((n, i) => (
                <div key={i} className="bg-dark-card rounded-xl p-3 mb-2 border border-dark-border">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <select value={n.level} onChange={e => updateNational(i, "level", e.target.value)}
                      className={`${SMALL_INPUT} flex-1 min-w-[100px]`}>
                      {NATIONAL_LEVELS.map(l => <option key={l}>{l}</option>)}
                    </select>
                    <input type="number" value={n.year} onChange={e => updateNational(i, "year", +e.target.value)}
                      className={`${SMALL_INPUT} w-24`} />
                    <label className="flex items-center gap-1.5 text-sm text-white/70">
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

          {/* Bio */}
          <div className="border-t border-dark-border pt-4">
            <label className={LABEL}>Bio</label>
            <textarea {...register("bio")} rows={3}
              placeholder="Description, achievements, playing/coaching style..." className={INPUT} />
          </div>

          {/* Submit */}
          <button type="submit" disabled={isSubmitting}
            className="w-full btn-primary text-white py-3.5 rounded-xl font-bold text-lg disabled:opacity-50">
            {isSubmitting ? "Creating..." : `➕ Add ${playerType.charAt(0).toUpperCase() + playerType.slice(1)}`}
          </button>

          {/* Errors */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-xl text-sm">
              <p className="font-semibold mb-1">Please fix these:</p>
              <ul className="list-disc list-inside text-xs space-y-1">
                {Object.entries(errors).map(([key, val]: [string, any]) => (
                  <li key={key}>{key}: {val?.message || "Invalid"}</li>
                ))}
              </ul>
            </div>
          )}
        </form>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}