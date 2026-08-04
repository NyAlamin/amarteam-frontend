"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import ProductCard from "@/components/ui/product-card";
import Loading from "@/components/ui/loading";
import { shopAPI } from "@/lib/api";
import { useCart } from "@/lib/cart-context";
import { useLang } from "@/lib/language-context";
import { Product, Category } from "@/lib/types";

export default function ShopPage() {
  const { lang } = useLang();
  const { shopCount, shopSubtotal } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [sort, setSort] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    shopAPI.getCategories().then(r => setCategories(r.data)).catch(() => {});
  }, []);

  const load = () => {
    setLoading(true);
    const p: Record<string, string> = {};
    if (search) p.search = search;
    if (categoryId) p.categoryId = categoryId;
    if (sort) p.sort = sort;
    if (maxPrice) p.maxPrice = maxPrice;
    shopAPI.getProducts(p).then(r => setProducts(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [categoryId, sort, maxPrice]);

  return (
    <div className="min-h-screen bg-dark text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="text-center mb-8 animate-[slideUp_0.6s_ease-out]">
          <span className="text-4xl block mb-2">🛍️</span>
          <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">Sports Shop</h1>
          <p className="text-white/40 text-sm">Everything you need for the game</p>
        </div>

        {/* Cart bar */}
        {shopCount > 0 && (
          <Link href="/checkout">
            <div className="glass rounded-2xl p-4 mb-6 flex items-center justify-between hover:border-primary-600 transition cursor-pointer animate-[fadeIn_0.4s_ease-out]">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🛒</span>
                <div>
                  <p className="font-semibold text-sm">{shopCount} item{shopCount > 1 ? "s" : ""} in cart</p>
                  <p className="text-primary-400 font-bold">৳{shopSubtotal.toLocaleString()}</p>
                </div>
              </div>
              <span className="btn-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm">
                Checkout →
              </span>
            </div>
          </Link>
        )}

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
          <button onClick={() => setCategoryId("")}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition border ${
              categoryId === "" ? "bg-primary-600 text-white border-primary-600" : "bg-dark-card text-white/60 border-dark-border hover:text-white"
            }`}>
            🏷️ All
          </button>
          {categories.map(c => (
            <button key={c.id} onClick={() => setCategoryId(c.id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition border ${
                categoryId === c.id ? "bg-primary-600 text-white border-primary-600" : "bg-dark-card text-white/60 border-dark-border hover:text-white"
              }`}>
              {c.icon} {lang === "bn" && c.nameBn ? c.nameBn : c.name}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="glass rounded-2xl p-4 mb-8">
          <form onSubmit={e => { e.preventDefault(); load(); }} className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 items-end">
            <div className="col-span-2 sm:flex-[2] sm:min-w-[200px]">
              <label className="block text-xs font-semibold text-white/50 mb-1">Search</label>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Jersey, boots, ball..."
                className="w-full px-3 py-2.5 rounded-xl bg-dark-card border border-dark-border text-white text-sm outline-none focus:border-primary-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-1">Max Price</label>
              <select value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-dark-card border border-dark-border text-white text-sm">
                <option value="">Any</option>
                <option value="500">Under ৳500</option>
                <option value="1000">Under ৳1,000</option>
                <option value="3000">Under ৳3,000</option>
                <option value="5000">Under ৳5,000</option>
                <option value="10000">Under ৳10,000</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-1">Sort</label>
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-dark-card border border-dark-border text-white text-sm">
                <option value="">Newest</option>
                <option value="price-low">Price: Low→High</option>
                <option value="price-high">Price: High→Low</option>
                <option value="popular">Most Popular</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
            <button type="submit" className="btn-primary text-white px-6 py-2.5 rounded-xl font-semibold col-span-2 sm:col-span-1">
              Search
            </button>
          </form>
        </div>

        <p className="text-sm text-white/40 mb-4">{products.length} product{products.length !== 1 ? "s" : ""}</p>

        {loading ? <Loading /> : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🛍️</p>
            <p className="text-white/40">No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:gap-4 lg:gap-5 stagger">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}