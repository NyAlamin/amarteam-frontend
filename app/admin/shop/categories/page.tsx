"use client";

import { useEffect, useState } from "react";
import { shopAPI, uploadAPI } from "@/lib/api";
import ConfirmModal from "@/components/ui/confirm-modal";
import Toast from "@/components/ui/toast";
import Loading from "@/components/ui/loading";
import { useToast } from "@/lib/hooks";
import { Category } from "@/lib/types";

const INPUT = "w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-green-500";

export default function AdminCategoriesPage() {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [confirm, setConfirm] = useState<{ id: string; name: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast, showToast } = useToast();

  const [form, setForm] = useState({ name: "", nameBn: "", icon: "", image: "", imagePublicId: "", description: "", sortOrder: 0 });

  const load = () => {
    shopAPI.getCategoriesAdmin().then(r => setCats(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const reset = () => {
    setForm({ name: "", nameBn: "", icon: "", image: "", imagePublicId: "", description: "", sortOrder: 0 });
    setEditing(null);
    setShowForm(false);
  };

  const startEdit = (c: Category) => {
    setEditing(c);
    setForm({
      name: c.name, nameBn: c.nameBn || "", icon: c.icon || "",
      image: c.image || "", imagePublicId: c.imagePublicId || "",
      description: c.description || "", sortOrder: c.sortOrder,
    });
    setShowForm(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    try {
      const r = await uploadAPI.image(f);
      setForm({ ...form, image: r.data.url, imagePublicId: r.data.publicId });
    } catch { showToast("Upload failed", "error"); }
    finally { setUploading(false); }
  };

  const save = async () => {
    if (!form.name.trim()) { showToast("Enter a category name", "error"); return; }
    try {
      if (editing) await shopAPI.updateCategory(editing.id, form);
      else await shopAPI.createCategory(form);
      showToast(editing ? "Category updated" : "Category created");
      reset(); load();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed", "error");
    }
  };

  const del = async () => {
    if (!confirm) return;
    try {
      await shopAPI.deleteCategory(confirm.id);
      showToast("Category deleted", "error");
      setConfirm(null); load();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed", "error");
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-3xl">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-bold text-slate-800">🏷️ Categories ({cats.length})</h2>
        <button onClick={() => showForm ? reset() : setShowForm(true)}
          className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-green-700">
          {showForm ? "✕ Cancel" : "➕ Add Category"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-5 mb-5">
          <h3 className="font-bold mb-4">{editing ? "Edit Category" : "New Category"}</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold mb-1 text-slate-700">Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Jerseys" className={INPUT} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-slate-700">Icon (emoji)</label>
                <input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })}
                  placeholder="👕" className={INPUT} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold mb-1 text-slate-700">Bangla Name</label>
                <input value={form.nameBn} onChange={e => setForm({ ...form, nameBn: e.target.value })}
                  placeholder="জার্সি" className={INPUT} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-slate-700">Sort Order</label>
                <input type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: +e.target.value })} className={INPUT} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-slate-700">Description</label>
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={INPUT} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-slate-700">Image</label>
              <div className="flex items-center gap-3">
                {form.image && <img src={form.image} className="w-16 h-16 rounded-lg object-cover" alt="" />}
                <label className="border-2 border-dashed border-slate-200 rounded-lg px-6 py-4 cursor-pointer hover:border-green-400 text-sm text-slate-500">
                  {uploading ? "Uploading..." : "📷 Upload image"}
                  <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                </label>
              </div>
            </div>
            <button onClick={save} className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm">
              {editing ? "💾 Update" : "➕ Create"}
            </button>
          </div>
        </div>
      )}

      {cats.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-16 text-center">
          <p className="text-4xl mb-3">🏷️</p>
          <p className="text-slate-400">No categories yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {cats.map(c => (
            <div key={c.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
              {c.image ? (
                <img src={c.image} className="w-12 h-12 rounded-lg object-cover shrink-0" alt="" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-xl shrink-0">
                  {c.icon || "🏷️"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold">{c.icon} {c.name}</p>
                <p className="text-xs text-slate-400">
                  {c.nameBn && `${c.nameBn} • `}Order: {c.sortOrder}
                  {!c.isActive && " • INACTIVE"}
                </p>
              </div>
              <button onClick={() => startEdit(c)} className="text-green-600 text-sm font-semibold">Edit</button>
              <button onClick={() => setConfirm({ id: c.id, name: c.name })} className="text-red-500 text-sm font-semibold">Delete</button>
            </div>
          ))}
        </div>
      )}

      {confirm && <ConfirmModal message={`Delete "${confirm.name}"?`} onConfirm={del} onCancel={() => setConfirm(null)} />}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}