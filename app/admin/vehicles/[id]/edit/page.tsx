"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { vehiclesAPI, uploadAPI } from "@/lib/api";
import Toast from "@/components/ui/toast";
import Loading from "@/components/ui/loading";
import { useToast } from "@/lib/hooks";
import { VEHICLE_TYPES, PhotoEntry } from "@/lib/types";
import { BD_DISTRICTS } from "@/lib/bd-locations";

const INPUT = "w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-green-500 transition";
const LABEL = "block text-sm font-semibold mb-1 text-slate-700";

export default function EditVehiclePage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast, showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [newDate, setNewDate] = useState("");

  const [form, setForm] = useState<any>({
    model: "", vehicleType: "car", seats: 4, hasAc: false,
    description: "", basePerDay: 3000, minDays: 1, maxDays: 30,
    baseDistrict: "Dhaka", registrationNo: "", isAvailable: true,
  });
  const [charges, setCharges] = useState<{ district: string; extraCharge: number }[]>([]);

  const upd = (k: string, v: any) => setForm({ ...form, [k]: v });

  useEffect(() => {
    vehiclesAPI.getOne(id as string).then(r => {
      const v = r.data;
      setForm({
        model: v.model, vehicleType: v.vehicleType, seats: v.seats, hasAc: v.hasAc,
        description: v.description || "", basePerDay: v.basePerDay,
        minDays: v.minDays, maxDays: v.maxDays || 30,
        baseDistrict: v.baseDistrict || "Dhaka", registrationNo: v.registrationNo || "",
        isAvailable: v.isAvailable,
      });
      setPhotos(v.photos || []);
      setCharges(v.districtCharges || []);
      setBlockedDates(v.unavailableDates || []);
      setLoading(false);
    }).catch(() => router.push("/admin/vehicles"));
  }, [id]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (photos.length + files.length > 6) { showToast("Maximum 6 photos", "warning"); return; }
    setUploading(true);
    try {
      const results = await Promise.all(files.map(f => uploadAPI.image(f)));
      setPhotos([...photos, ...results.map(r => ({ url: r.data.url, publicId: r.data.publicId }))]);
    } catch { showToast("Upload failed", "error"); }
    finally { setUploading(false); }
  };

  const addCharge = () => setCharges([...charges, { district: "", extraCharge: 0 }]);
  const removeCharge = (i: number) => setCharges(charges.filter((_, idx) => idx !== i));
  const updCharge = (i: number, f: string, v: any) => {
    const u = [...charges]; (u[i] as any)[f] = v; setCharges(u);
  };

  const addBlocked = () => {
    if (!newDate || blockedDates.includes(newDate)) return;
    setBlockedDates([...blockedDates, newDate].sort());
    setNewDate("");
  };

  const onSave = async () => {
    setSaving(true);
    try {
      await vehiclesAPI.update(id as string, {
        ...form,
        seats: Number(form.seats),
        basePerDay: Number(form.basePerDay),
        minDays: Number(form.minDays),
        maxDays: form.maxDays ? Number(form.maxDays) : undefined,
        photos,
        districtCharges: charges.filter(c => c.district.trim()).map(c => ({
          district: c.district, extraCharge: Number(c.extraCharge),
        })),
        unavailableDates: blockedDates,
      });
      showToast("Vehicle updated!");
      setTimeout(() => router.push("/admin/vehicles"), 1500);
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed", "error");
    } finally { setSaving(false); }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <h2 className="font-bold text-lg mb-5 text-slate-800">Edit Vehicle</h2>

        <div className="space-y-5">
          {/* Photos */}
          <div>
            <label className={LABEL}>Photos</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {photos.map((p, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                  <img src={p.url} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                    className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-xl">✕</button>
                </div>
              ))}
              {photos.length < 6 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:border-green-400">
                  {uploading ? <div className="w-6 h-6 border-2 border-green-200 border-t-green-600 rounded-full animate-spin" /> : <span className="text-2xl">📷</span>}
                  <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className={LABEL}>Model</label><input value={form.model} onChange={e => upd("model", e.target.value)} className={INPUT} /></div>
            <div>
              <label className={LABEL}>Type</label>
              <select value={form.vehicleType} onChange={e => upd("vehicleType", e.target.value)} className={INPUT}>
                {VEHICLE_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div><label className={LABEL}>Seats</label><input type="number" value={form.seats} onChange={e => upd("seats", +e.target.value)} className={INPUT} /></div>
            <div>
              <label className={LABEL}>Base District</label>
              <select value={form.baseDistrict} onChange={e => upd("baseDistrict", e.target.value)} className={INPUT}>
                {BD_DISTRICTS.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select>
            </div>
            <div><label className={LABEL}>Reg. No</label><input value={form.registrationNo} onChange={e => upd("registrationNo", e.target.value)} className={INPUT} /></div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.hasAc} onChange={e => upd("hasAc", e.target.checked)} className="rounded" />
              <span className="font-semibold text-slate-700">❄️ AC</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.isAvailable} onChange={e => upd("isAvailable", e.target.checked)} className="rounded" />
              <span className="font-semibold text-slate-700">Available for booking</span>
            </label>
          </div>

          <div><label className={LABEL}>Description</label><textarea value={form.description} onChange={e => upd("description", e.target.value)} rows={3} className={INPUT} /></div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-sm mb-3 text-slate-800">💰 Pricing</h3>
            <div className="grid grid-cols-3 gap-3">
              <div><label className={LABEL}>Base / Day (৳)</label><input type="number" value={form.basePerDay} onChange={e => upd("basePerDay", +e.target.value)} className={INPUT} /></div>
              <div><label className={LABEL}>Min Days</label><input type="number" value={form.minDays} onChange={e => upd("minDays", +e.target.value)} className={INPUT} /></div>
              <div><label className={LABEL}>Max Days</label><input type="number" value={form.maxDays} onChange={e => upd("maxDays", +e.target.value)} className={INPUT} /></div>
            </div>
          </div>

          {/* Surcharges */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-sm text-slate-800">📍 District Surcharges</h3>
              <button type="button" onClick={addCharge} className="text-green-600 text-sm font-semibold">+ Add</button>
            </div>
            {charges.map((c, i) => (
              <div key={i} className="flex gap-2 items-center mb-2">
                <select value={c.district} onChange={e => updCharge(i, "district", e.target.value)} className={`${INPUT} flex-1`}>
                  <option value="">Select district</option>
                  {BD_DISTRICTS.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
                <input type="number" value={c.extraCharge} onChange={e => updCharge(i, "extraCharge", +e.target.value)} className={`${INPUT} w-32`} />
                <button type="button" onClick={() => removeCharge(i)} className="text-red-500 px-2">✕</button>
              </div>
            ))}
          </div>

          {/* Blocked dates */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-sm mb-3 text-slate-800">🚫 Blocked Dates ({blockedDates.length})</h3>
            <div className="flex gap-2 mb-3">
              <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className={`${INPUT} flex-1`} />
              <button onClick={addBlocked} className="bg-slate-800 text-white px-5 rounded-lg text-sm font-semibold">Block</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {blockedDates.map(d => (
                <span key={d} className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                  {d}
                  <button onClick={() => setBlockedDates(blockedDates.filter(x => x !== d))}>✕</button>
                </span>
              ))}
            </div>
          </div>

          <button onClick={onSave} disabled={saving}
            className="w-full bg-green-600 text-white py-3.5 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50">
            {saving ? "Saving..." : "💾 Save Changes"}
          </button>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}