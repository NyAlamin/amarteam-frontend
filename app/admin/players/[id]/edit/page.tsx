"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updatePlayerSchema, UpdatePlayerInput } from "@/lib/schemas";
import { playersAPI } from "@/lib/api";
import FileUpload from "@/components/ui/file-upload";
import Toast from "@/components/ui/toast";
import Loading from "@/components/ui/loading";
import { useToast } from "@/lib/hooks";
import { ClubEntry, NationalTeamEntry, NATIONAL_LEVELS } from "@/lib/types";

export default function EditPlayerPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast, showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoPublicId, setPhotoPublicId] = useState("");
  const [clubs, setClubs] = useState<ClubEntry[]>([]);
  const [nationals, setNationals] = useState<NationalTeamEntry[]>([]);
  const [playerName, setPlayerName] = useState("");

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<UpdatePlayerInput>({
    resolver: zodResolver(updatePlayerSchema),
  });

  useEffect(() => {
    playersAPI.getOne(id as string).then(r => {
      const p = r.data;
      setPlayerName(p.user?.name || "");
      setPhotoUrl(p.photo || "");
      setPhotoPublicId(p.photoPublicId || "");
      setClubs(p.clubs || []);
      setNationals(p.nationalTeams || []);
      reset({
        position: p.position,
        tier: p.tier,
        age: p.age,
        experience: p.experience,
        location: p.location,
        bio: p.bio,
        isAvailable: p.isAvailable,
        rating: p.rating,
        charges: p.charges || {
          friendly: 5000, groupRound: 8000, final: 12000,
          friendlyDiscount: null, groupRoundDiscount: null, finalDiscount: null,
        },
        stats: p.stats || {
          goals: 0, assists: 0, matches: 0,
          cleanSheets: 0, yellowCards: 0, redCards: 0,
        },
      });
      setLoading(false);
    }).catch(() => router.push("/admin/players"));
  }, [id]);

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

  // National team handlers
  const addNational = () => setNationals([...nationals, { level: "Senior", year: 2024, isCurrent: true }]);
  const removeNational = (i: number) => setNationals(nationals.filter((_, idx) => idx !== i));
  const updateNational = (i: number, field: string, value: any) => {
    const u = [...nationals];
    (u[i] as any)[field] = value;
    setNationals(u);
  };

  const onSubmit = async (data: UpdatePlayerInput) => {
    if (clubs.length === 0 || !clubs[0].name.trim()) {
      showToast("At least one club with a name is required", "error");
      return;
    }

    try {
      const payload = {
        ...data,
        photo: photoUrl || undefined,
        photoPublicId: photoPublicId || undefined,
        clubs: clubs.map(c => ({
          name: c.name.trim(),
          joinYear: c.joinYear,
          leftYear: c.isCurrent ? null : c.leftYear,
          isCurrent: c.isCurrent,
        })),
        nationalTeams: nationals.map(n => ({
          level: n.level,
          year: n.year,
          isCurrent: n.isCurrent,
        })),
        
      };

      await playersAPI.update(id as string, payload);
      showToast("Player updated!");
      setTimeout(() => router.push("/admin/players"), 1500);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      showToast(Array.isArray(msg) ? msg[0] : (msg || "Update failed"), "error");
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <h2 className="font-bold text-lg mb-1">Edit Player</h2>
        <p className="text-sm text-slate-500 mb-4">{playerName}</p>

        {/* Photo */}
        <FileUpload
          type="image"
          label="Photo"
          currentUrl={photoUrl}
          onUploaded={d => { setPhotoUrl(d.url); setPhotoPublicId(d.publicId); }}
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-4">

          {/* Position, Tier, Availability */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1">Position</label>
              <select {...register("position")} className="w-full px-3 py-2.5 border rounded-lg text-sm">
                <option>Striker</option><option>Midfielder</option><option>Defender</option>
                <option>Goalkeeper</option><option>Winger</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Tier</label>
              <select {...register("tier")} className="w-full px-3 py-2.5 border rounded-lg text-sm">
                <option value="A">Tier A</option><option value="B">Tier B</option><option value="C">Tier C</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Rating</label>
              <input type="number" step="0.1" min="0" max="5" {...register("rating", { valueAsNumber: true })} className="w-full px-3 py-2.5 border rounded-lg text-sm" />
            </div>
          </div>

          {/* Age, Experience, Location */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1">Age</label>
              <input type="number" {...register("age", { valueAsNumber: true })} className="w-full px-3 py-2.5 border rounded-lg text-sm" />
              {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Exp (yrs)</label>
              <input type="number" {...register("experience", { valueAsNumber: true })} className="w-full px-3 py-2.5 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Location</label>
              <input {...register("location")} className="w-full px-3 py-2.5 border rounded-lg text-sm" />
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="flex items-center gap-2">
            <input type="checkbox" {...register("isAvailable")} className="rounded" />
            <span className="text-sm font-semibold">Available for hiring</span>
          </div>

          {/* ─── Club History ─── */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-sm">🏟️ Club History</h3>
              <button type="button" onClick={addClub} className="text-green-600 text-sm font-semibold">+ Add Club</button>
            </div>
            {clubs.length === 0 && <p className="text-slate-400 text-sm">No clubs added.</p>}
            {clubs.map((c, i) => (
              <div key={i} className="bg-slate-50 rounded-lg p-3 mb-2">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    placeholder="Club name *"
                    value={c.name}
                    onChange={e => updateClub(i, "name", e.target.value)}
                    className="px-2 py-2 border rounded-lg text-sm col-span-2 sm:col-span-1"
                  />
                  <input
                    type="number"
                    placeholder="Joined year"
                    value={c.joinYear}
                    onChange={e => updateClub(i, "joinYear", +e.target.value)}
                    className="px-2 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={c.isCurrent}
                      onChange={e => updateClub(i, "isCurrent", e.target.checked)}
                      className="rounded"
                    />
                    Current
                  </label>
                  {!c.isCurrent && (
                    <input
                      type="number"
                      placeholder="Left year"
                      value={c.leftYear || ""}
                      onChange={e => updateClub(i, "leftYear", +e.target.value || null)}
                      className="px-2 py-2 border rounded-lg text-sm w-28"
                    />
                  )}
                  {clubs.length > 1 && (
                    <button type="button" onClick={() => removeClub(i)} className="text-red-500 text-xs font-semibold ml-auto">Remove</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ─── National Team ─── */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-sm">🇧🇩 National Team</h3>
              <button type="button" onClick={addNational} className="text-green-600 text-sm font-semibold">+ Add</button>
            </div>
            {nationals.length === 0 && <p className="text-slate-400 text-sm">No national team entries.</p>}
            {nationals.map((n, i) => (
              <div key={i} className="bg-slate-50 rounded-lg p-3 mb-2">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <select
                    value={n.level}
                    onChange={e => updateNational(i, "level", e.target.value)}
                    className="px-2 py-2 border rounded-lg text-sm flex-1 min-w-[100px]"
                  >
                    {NATIONAL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <input
                    type="number"
                    placeholder="Year"
                    value={n.year}
                    onChange={e => updateNational(i, "year", +e.target.value)}
                    className="px-2 py-2 border rounded-lg text-sm w-24"
                  />
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={n.isCurrent}
                      onChange={e => updateNational(i, "isCurrent", e.target.checked)}
                      className="rounded"
                    />
                    Current
                  </label>
                </div>
                <button type="button" onClick={() => removeNational(i)} className="text-red-500 text-xs font-semibold">Remove</button>
              </div>
            ))}
          </div>

          

          {/* ─── Bio ─── */}
          <div>
            <label className="block text-sm font-semibold mb-1">Bio</label>
            <textarea {...register("bio")} rows={3} className="w-full px-3 py-2.5 border rounded-lg text-sm" />
          </div>

          {/* ─── Stats ─── */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-sm mb-3">📊 Career Stats</h3>
            <div className="grid grid-cols-3 gap-2">
              {(["goals", "assists", "matches", "cleanSheets", "yellowCards", "redCards"] as const).map(k => (
                <div key={k}>
                  <label className="block text-xs font-semibold mb-1 capitalize">{k.replace(/([A-Z])/g, " $1")}</label>
                  <input type="number" {...register(`stats.${k}`, { valueAsNumber: true })} className="w-full px-2 py-2 border rounded-lg text-sm" />
                </div>
              ))}
            </div>
          </div>

          {/* ─── Submit ─── */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 transition"
          >
            {isSubmitting ? "Saving..." : "💾 Save Changes"}
          </button>
        </form>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}