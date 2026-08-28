"use client";

import { useEffect, useState } from "react";
import { settingsAPI, uploadAPI } from "@/lib/api";
import Toast from "@/components/ui/toast";
import Loading from "@/components/ui/loading";
import ConfirmModal from "@/components/ui/confirm-modal";
import { useToast } from "@/lib/hooks";

interface PopupConfig {
  active: boolean;
  badge: string;
  headline: string;
  description: string;
  code: string;
  cta: string;
  ctaLink: string;
  image: string;
  dismiss: string;
}

const EMPTY: PopupConfig = {
  active: false,
  badge: "",
  headline: "",
  description: "",
  code: "",
  cta: "",
  ctaLink: "",
  image: "",
  dismiss: "",
};

export default function AdminPopupPage() {
  const { toast, showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [form, setForm] = useState<PopupConfig>(EMPTY);

  useEffect(() => {
    settingsAPI.getAll().then(r => {
      const raw = r.data?.popup?.value;
      if (raw) {
        try { setForm(JSON.parse(raw)); } catch {}
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const upd = (k: keyof PopupConfig, v: string | boolean) => setForm({ ...form, [k]: v });

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    try {
      const r = await uploadAPI.image(f);
      upd("image", r.data.url);
      showToast("Image uploaded");
    } catch { showToast("Upload failed", "error"); }
    finally { setUploading(false); e.target.value = ""; }
  };

  const save = async () => {
    if (form.active && !form.headline.trim()) {
      showToast("Headline is required", "error");
      return;
    }
    setSaving(true);
    try {
      await settingsAPI.set("popup", JSON.stringify(form));
      showToast("Popup saved — refresh the site to test");
    } catch { showToast("Failed to save", "error"); }
    finally { setSaving(false); }
  };

  const clearPopup = async () => {
    try {
      await settingsAPI.remove("popup");
      setForm(EMPTY);
      showToast("Popup removed");
      setConfirm(false);
    } catch { showToast("Failed", "error"); }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-bold text-slate-800">🎉 Promotional Popup</h2>
          <p className="text-sm text-slate-500 mt-1">
            Create a popup that appears on the homepage. Great for offers, announcements, or promo codes.
          </p>
        </div>
      </div>

      {/* Status toggle */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold">Popup Status</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {form.active ? "Popup is live — visitors will see it once per session" : "Popup is off — not visible to anyone"}
            </p>
          </div>
          <button onClick={() => upd("active", !form.active)}
            className={`relative w-14 h-7 rounded-full transition-colors ${form.active ? "bg-green-500" : "bg-slate-300"}`}>
            <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${
              form.active ? "left-[calc(100%-1.625rem)]" : "left-0.5"
            }`} />
          </button>
        </div>
      </div>

      {/* Image */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="font-bold mb-1">Popup Image</h3>
        <p className="text-xs text-slate-400 mb-4">Optional banner at the top of the popup. Recommended: 800×400px.</p>

        {form.image ? (
          <div className="relative rounded-xl overflow-hidden mb-3" style={{ aspectRatio: "2/1" }}>
            <img src={form.image} alt="" className="w-full h-full object-cover" />
            <button onClick={() => upd("image", "")}
              className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-red-600">
              Remove
            </button>
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center mb-3">
            <span className="text-3xl opacity-20 block mb-2">🖼️</span>
            <p className="text-slate-400 text-xs">No image set</p>
          </div>
        )}

        <label className="inline-block bg-green-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm cursor-pointer hover:bg-green-700 transition">
          {uploading ? "Uploading..." : form.image ? "Replace Image" : "Upload Image"}
          <input type="file" accept="image/*" onChange={uploadImage} className="hidden" disabled={uploading} />
        </label>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
        <h3 className="font-bold">Content</h3>

        <div>
          <label className="block text-sm font-semibold mb-1 text-slate-700">Badge Text</label>
          <input value={form.badge} onChange={e => upd("badge", e.target.value)}
            placeholder="LIMITED TIME"
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-green-500" />
          <p className="text-[11px] text-slate-400 mt-1">Small label above the headline. Leave empty to hide.</p>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1 text-slate-700">Headline *</label>
          <input value={form.headline} onChange={e => upd("headline", e.target.value)}
            placeholder="Eid special: ৳5,000 off"
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-green-500" />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1 text-slate-700">Description</label>
          <textarea value={form.description} onChange={e => upd("description", e.target.value)} rows={2}
            placeholder="Plus free shipping on all orders over ৳3,000. Ends Sunday midnight."
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-green-500" />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1 text-slate-700">Promo Code</label>
          <input value={form.code} onChange={e => upd("code", e.target.value.toUpperCase())}
            placeholder="AMARTEAM10"
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono outline-none focus:border-green-500" />
          <p className="text-[11px] text-slate-400 mt-1">Visitors can tap to copy. Leave empty to hide the code box.</p>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
        <h3 className="font-bold">Call to Action</h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold mb-1 text-slate-700">Button Text</label>
            <input value={form.cta} onChange={e => upd("cta", e.target.value)}
              placeholder="Shop the offer"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-green-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-slate-700">Button Link</label>
            <input value={form.ctaLink} onChange={e => upd("ctaLink", e.target.value)}
              placeholder="/shop"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-green-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1 text-slate-700">Dismiss Text</label>
          <input value={form.dismiss} onChange={e => upd("dismiss", e.target.value)}
            placeholder="No thanks, I'll pay full price"
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-green-500" />
          <p className="text-[11px] text-slate-400 mt-1">Shown below the button. Defaults to "No thanks, I'll pay full price".</p>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="font-bold mb-4">Preview</h3>
        <div className="bg-slate-100 rounded-xl p-6 flex justify-center">
          <div className="w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-xl border border-slate-200">
            {form.image && (
              <div className="h-36 overflow-hidden">
                <img src={form.image} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-5">
              {form.badge && (
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold mb-2">
                  {form.badge}
                </span>
              )}
              {form.headline && <h3 className="text-lg font-bold text-slate-900 mb-1">{form.headline}</h3>}
              {form.description && <p className="text-xs text-slate-500 mb-3">{form.description}</p>}
              {form.code && (
                <div className="p-2.5 rounded-lg border-2 border-dashed border-green-300 bg-green-50 text-center mb-3">
                  <p className="text-[9px] text-slate-400 font-semibold">USE CODE</p>
                  <p className="text-sm font-bold text-green-600 tracking-widest">{form.code}</p>
                </div>
              )}
              {form.cta && (
                <div className="bg-green-500 text-white py-2.5 rounded-lg text-center font-bold text-xs">{form.cta}</div>
              )}
              {(form.dismiss || !form.cta) && (
                <p className="text-center text-slate-400 text-[10px] mt-2">{form.dismiss || "No thanks, I'll pay full price"}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving}
          className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold text-sm hover:bg-green-700 disabled:opacity-50 transition">
          {saving ? "Saving..." : "💾 Save Popup"}
        </button>
        {(form.headline || form.image) && (
          <button onClick={() => setConfirm(true)}
            className="text-red-500 text-sm font-semibold hover:underline">
            Delete popup
          </button>
        )}
      </div>

      {confirm && (
        <ConfirmModal
          message="Delete this popup? It will be removed from the site immediately."
          onConfirm={clearPopup}
          onCancel={() => setConfirm(false)}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}