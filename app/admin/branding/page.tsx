"use client";

import { useEffect, useState } from "react";
import { settingsAPI, uploadAPI } from "@/lib/api";
import Toast from "@/components/ui/toast";
import Loading from "@/components/ui/loading";
import ConfirmModal from "@/components/ui/confirm-modal";
import { useToast } from "@/lib/hooks";

const HERO_SLIDES = [
  { key: "heroImage1", label: "Slide 1 — Talent", desc: "Players, coaches, referees" },
  { key: "heroImage2", label: "Slide 2 — Vehicles", desc: "Team transport" },
  { key: "heroImage3", label: "Slide 3 — Shop", desc: "Sports gear & equipment" },
];

export default function AdminBrandingPage() {
  const { toast, showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);

  const [logo, setLogo] = useState({ value: "", publicId: "" });
  const [heroImages, setHeroImages] = useState<Record<string, { value: string; publicId: string }>>({
    heroImage1: { value: "", publicId: "" },
    heroImage2: { value: "", publicId: "" },
    heroImage3: { value: "", publicId: "" },
  });
  const [siteName, setSiteName] = useState("");
  const [tagline, setTagline] = useState("");

  const load = () => {
    settingsAPI.getAll().then(r => {
      const s = r.data;
      setLogo({ value: s.logo?.value || "", publicId: s.logo?.publicId || "" });
      setHeroImages({
        heroImage1: { value: s.heroImage1?.value || s.heroImage?.value || "", publicId: s.heroImage1?.publicId || s.heroImage?.publicId || "" },
        heroImage2: { value: s.heroImage2?.value || "", publicId: s.heroImage2?.publicId || "" },
        heroImage3: { value: s.heroImage3?.value || "", publicId: s.heroImage3?.publicId || "" },
      });
      setSiteName(s.siteName?.value || "আমার টিম");
      setTagline(s.tagline?.value || "");
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(key);
    try {
      const r = await uploadAPI.image(f);
      await settingsAPI.set(key, r.data.url, r.data.publicId);
      if (key === "logo") {
        setLogo({ value: r.data.url, publicId: r.data.publicId });
      } else {
        setHeroImages(prev => ({ ...prev, [key]: { value: r.data.url, publicId: r.data.publicId } }));
      }
      showToast("Image updated — refresh the site to see it");
    } catch (err: any) {
      showToast(err.response?.data?.message || "Upload failed", "error");
    } finally { setUploading(null); e.target.value = ""; }
  };

  const removeImage = async () => {
    if (!confirm) return;
    try {
      await settingsAPI.remove(confirm);
      if (confirm === "logo") {
        setLogo({ value: "", publicId: "" });
      } else {
        setHeroImages(prev => ({ ...prev, [confirm]: { value: "", publicId: "" } }));
      }
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
          Upload your logo and homepage carousel backgrounds. Changes appear on the public site immediately.
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

        {logo.value && (
          <div className="mt-4 p-4 rounded-xl bg-slate-900 flex items-center gap-2.5">
            <img src={logo.value} alt="" className="h-9 object-contain" />
            <span className="font-bold text-white">{siteName}</span>
            <span className="text-[10px] text-white/30 ml-auto">Navbar preview</span>
          </div>
        )}
      </div>

      {/* HERO CAROUSEL IMAGES */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="font-bold mb-1">Hero Carousel Backgrounds</h3>
        <p className="text-xs text-slate-400 mb-5">
          Upload a background for each homepage carousel slide. Recommended: 1920×1080px or larger.
          Slides without an image will use a gradient.
        </p>

        <div className="space-y-4">
          {HERO_SLIDES.map(slide => {
            const img = heroImages[slide.key];
            return (
              <div key={slide.key} className="border border-slate-200 rounded-xl overflow-hidden">
                {/* Preview */}
                <div className="relative" style={{ aspectRatio: "16/6" }}>
                  {img.value ? (
                    <>
                      <img src={img.value} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent flex items-center">
                        <div className="pl-6">
                          <span className="inline-block px-2.5 py-1 rounded bg-green-500 text-white text-[10px] font-bold mb-2">
                            {slide.label.split("—")[1]?.trim() || slide.label}
                          </span>
                          <p className="text-white font-bold text-lg">Preview with overlay</p>
                          <p className="text-white/40 text-xs">{slide.desc}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center">
                      <span className="text-3xl opacity-15 mb-1">🏟️</span>
                      <p className="text-slate-400 text-xs">No image — gradient will be used</p>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between p-3 bg-slate-50">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{slide.label}</p>
                    <p className="text-[11px] text-slate-400">{slide.desc}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg font-semibold text-xs cursor-pointer hover:bg-green-700 transition">
                      {uploading === slide.key ? "Uploading..." : img.value ? "Replace" : "Upload"}
                      <input type="file" accept="image/*" onChange={e => uploadImage(e, slide.key)} className="hidden" disabled={!!uploading} />
                    </label>
                    {img.value && (
                      <button onClick={() => setConfirm(slide.key)}
                        className="text-red-500 text-xs font-semibold hover:underline">
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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
          message={`Remove this image? It will be deleted permanently.`}
          onConfirm={removeImage}
          onCancel={() => setConfirm(null)}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}