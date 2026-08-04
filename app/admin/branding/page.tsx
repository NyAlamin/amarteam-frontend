"use client";

import { useEffect, useState } from "react";
import { settingsAPI, uploadAPI } from "@/lib/api";
import Toast from "@/components/ui/toast";
import Loading from "@/components/ui/loading";
import ConfirmModal from "@/components/ui/confirm-modal";
import { useToast } from "@/lib/hooks";

export default function AdminBrandingPage() {
  const { toast, showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);

  const [logo, setLogo] = useState({ value: "", publicId: "" });
  const [heroImage, setHeroImage] = useState({ value: "", publicId: "" });
  const [siteName, setSiteName] = useState("");
  const [tagline, setTagline] = useState("");

  const load = () => {
    settingsAPI.getAll().then(r => {
      const s = r.data;
      setLogo({ value: s.logo?.value || "", publicId: s.logo?.publicId || "" });
      setHeroImage({ value: s.heroImage?.value || "", publicId: s.heroImage?.publicId || "" });
      setSiteName(s.siteName?.value || "আমার টিম");
      setTagline(s.tagline?.value || "");
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>, key: "logo" | "heroImage") => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(key);
    try {
      const r = await uploadAPI.image(f);
      await settingsAPI.set(key, r.data.url, r.data.publicId);
      if (key === "logo") setLogo({ value: r.data.url, publicId: r.data.publicId });
      else setHeroImage({ value: r.data.url, publicId: r.data.publicId });
      showToast(`${key === "logo" ? "Logo" : "Hero image"} updated — refresh the site to see it`);
    } catch (err: any) {
      showToast(err.response?.data?.message || "Upload failed", "error");
    } finally { setUploading(null); e.target.value = ""; }
  };

  const removeImage = async () => {
    if (!confirm) return;
    try {
      await settingsAPI.remove(confirm);
      if (confirm === "logo") setLogo({ value: "", publicId: "" });
      else setHeroImage({ value: "", publicId: "" });
      showToast("Removed", "error");
      setConfirm(null);
    } catch { showToast("Failed", "error"); }
  };

  const saveText = async () => {
    setSaving(true);
    try {
      await settingsAPI.set("siteName", siteName);
      await settingsAPI.set("tagline", tagline);
      showToast("Saved");
    } catch { showToast("Failed", "error"); }
    finally { setSaving(false); }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-800">🎨 Site Branding</h2>
        <p className="text-sm text-slate-500 mt-1">
          Upload your logo and homepage background. Changes appear on the public site immediately.
        </p>
      </div>

      {/* LOGO */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="font-bold mb-1">Logo</h3>
        <p className="text-xs text-slate-400 mb-4">
          Shown in the navbar and hero. PNG with transparent background works best. Recommended: 400×400px or wider.
        </p>

        <div className="flex items-center gap-4">
          <div className="w-32 h-32 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shrink-0"
            style={{ background: "repeating-conic-gradient(#f1f5f9 0% 25%, white 0% 50%) 50% / 16px 16px" }}>
            {logo.value ? (
              <img src={logo.value} alt="" className="w-full h-full object-contain p-2" />
            ) : (
              <span className="text-3xl opacity-20">🖼️</span>
            )}
          </div>

          <div className="space-y-2">
            <label className="inline-block bg-green-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm cursor-pointer hover:bg-green-700 transition">
              {uploading === "logo" ? "Uploading..." : logo.value ? "Replace Logo" : "Upload Logo"}
              <input type="file" accept="image/*" onChange={e => uploadImage(e, "logo")} className="hidden" disabled={!!uploading} />
            </label>
            {logo.value && (
              <button onClick={() => setConfirm("logo")}
                className="block text-red-500 text-sm font-semibold hover:underline">
                Remove logo
              </button>
            )}
          </div>
        </div>

        {/* Preview */}
        {logo.value && (
          <div className="mt-4 p-4 rounded-xl bg-slate-900 flex items-center gap-2.5">
            <img src={logo.value} alt="" className="h-9 object-contain" />
            <span className="font-bold text-white">{siteName}</span>
            <span className="text-[10px] text-white/30 ml-auto">Navbar preview</span>
          </div>
        )}
      </div>

      {/* HERO IMAGE */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="font-bold mb-1">Homepage Background</h3>
        <p className="text-xs text-slate-400 mb-4">
          Full-screen hero background. A dark overlay is applied automatically so text stays readable.
          Recommended: 1920×1080px or larger.
        </p>

        <div className="rounded-xl border-2 border-dashed border-slate-200 overflow-hidden mb-3"
          style={{ aspectRatio: "16/7" }}>
          {heroImage.value ? (
            <div className="relative w-full h-full">
              <img src={heroImage.value} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-green-400 text-2xl font-bold">Everything Football</p>
                  <p className="text-white/50 text-sm">Preview with overlay</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50">
              <span className="text-4xl opacity-20 mb-2">🏟️</span>
              <p className="text-slate-400 text-sm">No background set — gradient will be used</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <label className="inline-block bg-green-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm cursor-pointer hover:bg-green-700 transition">
            {uploading === "heroImage" ? "Uploading..." : heroImage.value ? "Replace Background" : "Upload Background"}
            <input type="file" accept="image/*" onChange={e => uploadImage(e, "heroImage")} className="hidden" disabled={!!uploading} />
          </label>
          {heroImage.value && (
            <button onClick={() => setConfirm("heroImage")}
              className="text-red-500 text-sm font-semibold hover:underline">
              Remove background
            </button>
          )}
        </div>
      </div>

      {/* TEXT */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="font-bold mb-4">Site Text</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold mb-1 text-slate-700">Site Name</label>
            <input value={siteName} onChange={e => setSiteName(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-green-500" />
            <p className="text-[11px] text-slate-400 mt-1">Shown next to the logo in the navbar</p>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-slate-700">Tagline</label>
            <input value={tagline} onChange={e => setTagline(e.target.value)}
              placeholder="Bangladesh's #1 Football Platform"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-green-500" />
          </div>
          <button onClick={saveText} disabled={saving}
            className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-green-700 disabled:opacity-50">
            {saving ? "Saving..." : "💾 Save Text"}
          </button>
        </div>
      </div>

      {confirm && (
        <ConfirmModal
          message={`Remove the ${confirm === "logo" ? "logo" : "background image"}? It will be deleted permanently.`}
          onConfirm={removeImage}
          onCancel={() => setConfirm(null)}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}