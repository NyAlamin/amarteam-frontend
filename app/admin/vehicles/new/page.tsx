"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { vehiclesAPI, uploadAPI } from "@/lib/api";
import Toast from "@/components/ui/toast";
import { useToast } from "@/lib/hooks";
import { VEHICLE_TYPES, PhotoEntry } from "@/lib/types";
import { BD_DISTRICTS } from "@/lib/bd-locations";

const INPUT = "w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition";
const LABEL = "block text-sm font-semibold mb-1 text-slate-700";

export default function AddVehiclePage() {
  const router = useRouter();
  const { toast, showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);

  const [form, setForm] = useState({
    model: "", vehicleType: "car", seats: 4, hasAc: false,
    description: "", basePerDay: 3000, minDays: 1, maxDays: 30,
    baseDistrict: "Dhaka", registrationNo: "",
  });

  const [charges, setCharges] = useState<{ district: string; extraCharge: number }[]>([]);

  const upd = (k: string, v: any) => setForm({ ...form, [k]: v });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (photos.length + files.length > 6) {
      showToast("Maximum 6 photos", "warning"); return;
    }
    setUploading(true);
    try {
      const results = await Promise.all(files.map(f => uploadAPI.image(f)));
      setPhotos([...photos, ...results.map(r => ({ url: r.data.url, publicId: r.data.publicId }))]);
      showToast(`${files.length} photo(s) uploaded`);
    } catch { showToast("Upload failed", "error"); }
    finally { setUploading(false); }
  };

  const addCharge = () => setCharges([...charges, { district: "", extraCharge: 0 }]);
  const removeCharge = (i: number) => setCharges(charges.filter((_, idx) => idx !== i));
  const updCharge = (i: number, field: string, v: any) => {
    const u = [...charges]; (u[i] as any)[field] = v; setCharges(u);
  };

  const onSubmit = async () => {
    if (!form.model.trim()) { showToast("Enter a model name", "error"); return; }
    if (form.basePerDay < 100) { showToast("Base rate must be at least ৳100", "error"); return; }

    setSubmitting(true);
    try {
      await vehiclesAPI.create({
        ...form,
        seats: Number(form.seats),
        basePerDay: Number(form.basePerDay),
        minDays: Number(form.minDays),
        maxDays: form.maxDays ? Number(form.maxDays) : undefined,
        photos,
        districtCharges: charges.filter(c => c.district.trim()).map(c => ({
          district: c.district, extraCharge: Number(c.extraCharge),
        })),
      });
      showToast("Vehicle added!");
      setTimeout(() => router.push("/admin/vehicles"), 1500);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      showToast(Array.isArray(msg) ? msg[0] : (msg || "Failed"), "error");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <h2 className="font-bold text-lg mb-5 text-slate-800">Add New Vehicle</h2>

        <div className="space-y-5">
          {/* Photos */}
          <div>
            <label className={LABEL}>Photos (max 6)</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
              {photos.map((p, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                  <img src={p.url} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                    className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-xl">
                    ✕
                  </button>
                </div>
              ))}
              {photos.length < 6 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-green-400 transition">
                  {uploading ? (
                    <div className="w-6 h-6 border-2 border-green-200 border-t-green-600 rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="text-2xl">📷</span>
                      <span className="text-[10px] text-slate-400 mt-1">Add</span>
                    </>
                  )}
                  <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Basic info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Model Name *</label>
              <input value={form.model} onChange={e => upd("model", e.target.value)}
                placeholder="Toyota Hiace 2020" className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Type *</label>
              <select value={form.vehicleType} onChange={e => upd("vehicleType", e.target.value)} className={INPUT}>
                {VEHICLE_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={LABEL}>Seats *</label>
              <input type="number" value={form.seats} onChange={e => upd("seats", +e.target.value)} className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Base District</label>
              <select value={form.baseDistrict} onChange={e => upd("baseDistrict", e.target.value)} className={INPUT}>
                {BD_DISTRICTS.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL}>Reg. No</label>
              <input value={form.registrationNo} onChange={e => upd("registrationNo", e.target.value)}
                placeholder="DHA-1234" className={INPUT} />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.hasAc} onChange={e => upd("hasAc", e.target.checked)} className="rounded" />
            <span className="font-semibold text-slate-700">❄️ Air Conditioned</span>
          </label>

          <div>
            <label className={LABEL}>Description</label>
            <textarea value={form.description} onChange={e => upd("description", e.target.value)} rows={3}
              placeholder="Comfortable, well-maintained, experienced driver included..." className={INPUT} />
          </div>

          {/* Pricing */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-sm mb-3 text-slate-800">💰 Pricing</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={LABEL}>Base / Day (৳) *</label>
                <input type="number" value={form.basePerDay} onChange={e => upd("basePerDay", +e.target.value)} className={INPUT} />
              </div>
              <div>
                <label className={LABEL}>Min Days</label>
                <input type="number" value={form.minDays} onChange={e => upd("minDays", +e.target.value)} className={INPUT} />
              </div>
              <div>
                <label className={LABEL}>Max Days</label>
                <input type="number" value={form.maxDays} onChange={e => upd("maxDays", +e.target.value)} className={INPUT} />
              </div>
            </div>
          </div>

          {/* District surcharges */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-sm text-slate-800">📍 District Surcharges</h3>
              <button type="button" onClick={addCharge} className="text-green-600 text-sm font-semibold">+ Add</button>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Extra charge on top of base rate for trips to these districts. Districts not listed have no surcharge.
            </p>
            {charges.length === 0 && <p className="text-slate-300 text-sm">No surcharges added.</p>}
            {charges.map((c, i) => (
              <div key={i} className="flex gap-2 items-center mb-2">
                <select value={c.district} onChange={e => updCharge(i, "district", e.target.value)}
                  className={`${INPUT} flex-1`}>
                  <option value="">Select district</option>
                  {BD_DISTRICTS.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
                <input type="number" value={c.extraCharge} onChange={e => updCharge(i, "extraCharge", +e.target.value)}
                  placeholder="৳" className={`${INPUT} w-32`} />
                <button type="button" onClick={() => removeCharge(i)}
                  className="text-red-500 text-sm px-2">✕</button>
              </div>
            ))}
          </div>

          <button onClick={onSubmit} disabled={submitting}
            className="w-full bg-green-600 text-white py-3.5 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 transition">
            {submitting ? "Adding..." : "➕ Add Vehicle"}
          </button>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}