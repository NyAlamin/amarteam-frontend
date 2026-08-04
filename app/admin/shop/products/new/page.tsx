"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { shopAPI, uploadAPI } from "@/lib/api";
import Toast from "@/components/ui/toast";
import { useToast } from "@/lib/hooks";
import { Category, PhotoEntry } from "@/lib/types";

const INPUT = "w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-green-500";
const LABEL = "block text-sm font-semibold mb-1 text-slate-700";

export default function AddProductPage() {
  const router = useRouter();
  const { toast, showToast } = useToast();
  const [cats, setCats] = useState<Category[]>([]);
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "", nameBn: "", description: "", categoryId: "", brand: "",
    price: 0, oldPrice: 0, stock: 0,
    dhakaDeliveryCharge: 60, outsideDeliveryCharge: 120,
    isFeatured: false,
  });

  const [variants, setVariants] = useState<{ name: string; options: string }[]>([]);

  const upd = (k: string, v: any) => setForm({ ...form, [k]: v });

  useEffect(() => { shopAPI.getCategoriesAdmin().then(r => setCats(r.data)); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (photos.length + files.length > 6) { showToast("Max 6 photos", "warning"); return; }
    setUploading(true);
    try {
      const results = await Promise.all(files.map(f => uploadAPI.image(f)));
      setPhotos([...photos, ...results.map(r => ({ url: r.data.url, publicId: r.data.publicId }))]);
    } catch { showToast("Upload failed", "error"); }
    finally { setUploading(false); }
  };

  const onSubmit = async () => {
    if (!form.name.trim()) { showToast("Enter a product name", "error"); return; }
    if (form.price < 1) { showToast("Enter a valid price", "error"); return; }

    setSubmitting(true);
    try {
      await shopAPI.createProduct({
        ...form,
        price: Number(form.price),
        oldPrice: form.oldPrice ? Number(form.oldPrice) : undefined,
        stock: Number(form.stock),
        categoryId: form.categoryId || undefined,
        dhakaDeliveryCharge: Number(form.dhakaDeliveryCharge),
        outsideDeliveryCharge: Number(form.outsideDeliveryCharge),
        photos,
        variants: variants.filter(v => v.name.trim()).map(v => ({
          name: v.name.trim(),
          options: v.options.split(",").map(o => o.trim()).filter(Boolean),
        })),
      });
      showToast("Product created!");
      setTimeout(() => router.push("/admin/shop/products"), 1500);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      showToast(Array.isArray(msg) ? msg[0] : (msg || "Failed"), "error");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <h2 className="font-bold text-lg mb-5 text-slate-800">Add New Product</h2>

        <div className="space-y-5">
          {/* Photos */}
          <div>
            <label className={LABEL}>Photos (max 6)</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {photos.map((p, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                  <img src={p.url} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                    className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-xl">✕</button>
                </div>
              ))}
              {photos.length < 6 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-green-400">
                  {uploading ? <div className="w-6 h-6 border-2 border-green-200 border-t-green-600 rounded-full animate-spin" /> : (
                    <><span className="text-2xl">📷</span><span className="text-[10px] text-slate-400">Add</span></>
                  )}
                  <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>

          <div>
            <label className={LABEL}>Product Name *</label>
            <input value={form.name} onChange={e => upd("name", e.target.value)}
              placeholder="Nike Mercurial Football Boots" className={INPUT} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Bangla Name</label>
              <input value={form.nameBn} onChange={e => upd("nameBn", e.target.value)} className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Brand</label>
              <input value={form.brand} onChange={e => upd("brand", e.target.value)} placeholder="Nike" className={INPUT} />
            </div>
          </div>

          <div>
            <label className={LABEL}>Category</label>
            <select value={form.categoryId} onChange={e => upd("categoryId", e.target.value)} className={INPUT}>
              <option value="">No category</option>
              {cats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>

          <div>
            <label className={LABEL}>Description</label>
            <textarea value={form.description} onChange={e => upd("description", e.target.value)} rows={4} className={INPUT} />
          </div>

          {/* Pricing */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-sm mb-3 text-slate-800">💰 Pricing & Stock</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={LABEL}>Price (৳) *</label>
                <input type="number" value={form.price} onChange={e => upd("price", +e.target.value)} className={INPUT} />
              </div>
              <div>
                <label className={LABEL}>Old Price (৳)</label>
                <input type="number" value={form.oldPrice} onChange={e => upd("oldPrice", +e.target.value)}
                  placeholder="For discount" className={INPUT} />
              </div>
              <div>
                <label className={LABEL}>Stock *</label>
                <input type="number" value={form.stock} onChange={e => upd("stock", +e.target.value)} className={INPUT} />
              </div>
            </div>
          </div>

          {/* Delivery */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-sm mb-3 text-slate-800">🚚 Delivery Charges</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL}>Inside Dhaka (৳)</label>
                <input type="number" value={form.dhakaDeliveryCharge} onChange={e => upd("dhakaDeliveryCharge", +e.target.value)} className={INPUT} />
              </div>
              <div>
                <label className={LABEL}>Outside Dhaka (৳)</label>
                <input type="number" value={form.outsideDeliveryCharge} onChange={e => upd("outsideDeliveryCharge", +e.target.value)} className={INPUT} />
              </div>
            </div>
          </div>

          {/* Variants */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-sm text-slate-800">🎨 Variants</h3>
              <button type="button" onClick={() => setVariants([...variants, { name: "", options: "" }])}
                className="text-green-600 text-sm font-semibold">+ Add</button>
            </div>
            <p className="text-xs text-slate-400 mb-3">e.g. Size → S, M, L, XL (comma separated)</p>
            {variants.map((v, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input value={v.name} onChange={e => { const u = [...variants]; u[i].name = e.target.value; setVariants(u); }}
                  placeholder="Size" className={`${INPUT} w-32`} />
                <input value={v.options} onChange={e => { const u = [...variants]; u[i].options = e.target.value; setVariants(u); }}
                  placeholder="S, M, L, XL" className={`${INPUT} flex-1`} />
                <button onClick={() => setVariants(variants.filter((_, idx) => idx !== i))} className="text-red-500 px-2">✕</button>
              </div>
            ))}
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.isFeatured} onChange={e => upd("isFeatured", e.target.checked)} className="rounded" />
            <span className="font-semibold text-slate-700">⭐ Feature on homepage</span>
          </label>

          <button onClick={onSubmit} disabled={submitting}
            className="w-full bg-green-600 text-white py-3.5 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50">
            {submitting ? "Creating..." : "➕ Add Product"}
          </button>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}