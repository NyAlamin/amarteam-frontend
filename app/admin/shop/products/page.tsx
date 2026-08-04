"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { shopAPI } from "@/lib/api";
import ConfirmModal from "@/components/ui/confirm-modal";
import Toast from "@/components/ui/toast";
import Loading from "@/components/ui/loading";
import { useToast } from "@/lib/hooks";
import { Product, Category } from "@/lib/types";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [confirm, setConfirm] = useState<{ id: string; name: string } | null>(null);
  const { toast, showToast } = useToast();

  const load = () => {
    setLoading(true);
    const p: Record<string, string> = {};
    if (search) p.search = search;
    if (catFilter) p.categoryId = catFilter;
    shopAPI.getProductsAdmin(p).then(r => setProducts(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { shopAPI.getCategoriesAdmin().then(r => setCats(r.data)); }, []);
  useEffect(() => { load(); }, [catFilter]);

  const toggleActive = async (id: string) => { await shopAPI.toggleActive(id); showToast("Updated"); load(); };
  const toggleFeatured = async (id: string) => { await shopAPI.toggleFeatured(id); showToast("Updated"); load(); };
  const del = async () => {
    if (!confirm) return;
    await shopAPI.deleteProduct(confirm.id);
    showToast("Product deleted", "error");
    setConfirm(null); load();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
        <div className="flex gap-2 flex-1">
          <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && load()}
            placeholder="Search products..." className="flex-1 px-3 py-2.5 border rounded-lg text-sm" />
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="px-3 py-2.5 border rounded-lg text-sm">
            <option value="">All categories</option>
            {cats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </div>
        <Link href="/admin/shop/products/new"
          className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm text-center hover:bg-green-700">
          ➕ Add Product
        </Link>
      </div>

      {loading ? <Loading /> : products.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-16 text-center">
          <p className="text-4xl mb-3">🛍️</p>
          <p className="text-slate-400">No products yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map(p => (
            <div key={p.id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-start gap-3 mb-3">
                {p.photos?.[0] ? (
                  <img src={p.photos[0].url} className="w-16 h-16 rounded-lg object-cover shrink-0" alt="" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center text-xl shrink-0">🛍️</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-bold truncate">{p.name}</p>
                    {p.isFeatured && <span className="bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded text-[10px] font-bold">⭐ Featured</span>}
                    {!p.isActive && <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-bold">HIDDEN</span>}
                  </div>
                  <p className="text-xs text-slate-500">
                    {p.category?.icon} {p.category?.name || "No category"} {p.brand && `• ${p.brand}`}
                  </p>
                  <p className="text-sm font-bold text-green-600 mt-1">
                    ৳{p.price.toLocaleString()}
                    {p.oldPrice && <span className="text-slate-300 line-through text-xs ml-2">৳{p.oldPrice.toLocaleString()}</span>}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-bold ${p.stock > 5 ? "text-green-600" : p.stock > 0 ? "text-yellow-600" : "text-red-500"}`}>
                    {p.stock}
                  </p>
                  <p className="text-[10px] text-slate-400">in stock</p>
                  {p.soldCount > 0 && <p className="text-[10px] text-slate-400 mt-1">{p.soldCount} sold</p>}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                <div className="flex gap-2">
                  <button onClick={() => toggleActive(p.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold ${p.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                    {p.isActive ? "Visible" : "Hidden"}
                  </button>
                  <button onClick={() => toggleFeatured(p.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold ${p.isFeatured ? "bg-yellow-100 text-yellow-700" : "bg-slate-100 text-slate-500"}`}>
                    {p.isFeatured ? "⭐ Featured" : "Not featured"}
                  </button>
                </div>
                <div className="flex gap-3">
                  <Link href={`/admin/shop/products/${p.id}/edit`} className="text-green-600 text-sm font-semibold">Edit</Link>
                  <button onClick={() => setConfirm({ id: p.id, name: p.name })} className="text-red-500 text-sm font-semibold">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirm && <ConfirmModal message={`Delete "${confirm.name}"?`} onConfirm={del} onCancel={() => setConfirm(null)} />}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}