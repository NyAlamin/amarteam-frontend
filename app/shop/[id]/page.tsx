"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import ProductCard from "@/components/ui/product-card";
import Toast from "@/components/ui/toast";
import Loading from "@/components/ui/loading";
import { shopAPI } from "@/lib/api";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/hooks";
import { Product } from "@/lib/types";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { addToShop, isInShop, removeFromShop } = useCart();
  const { toast, showToast } = useToast();

  const [p, setP] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  useEffect(() => {
    shopAPI.getProduct(id as string)
      .then(r => {
        setP(r.data);
        if (r.data.categoryId) {
          shopAPI.getProducts({ categoryId: r.data.categoryId })
            .then(rel => setRelated(rel.data.filter((x: Product) => x.id !== r.data.id).slice(0, 5)))
            .catch(() => {});
        }
      })
      .catch(() => router.push("/shop"))
      .finally(() => setLoading(false));
  }, [id]);

  const inCart = p ? isInShop(p.id) : false;
  const discount = p?.oldPrice && p.oldPrice > p.price
    ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0;

  const handleAdd = () => {
    if (!user) { router.push("/auth/login"); return; }
    if (!p) return;
    const variantStr = Object.entries(selectedVariants).map(([k, v]) => `${k}: ${v}`).join(", ");
    addToShop(p, qty, variantStr || undefined);
    showToast(`Added ${qty} × ${p.name} to cart`);
  };

  if (loading) return <div className="min-h-screen bg-dark"><Navbar /><div className="pt-24"><Loading /></div></div>;
  if (!p) return null;

  return (
    <div className="min-h-screen bg-dark text-white">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 pt-24 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-white/30 mb-4">
          <Link href="/shop" className="hover:text-white/60">Shop</Link>
          {p.category && (
            <>
              <span>/</span>
              <Link href={`/shop?categoryId=${p.categoryId}`} className="hover:text-white/60">
                {p.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-white/50 truncate">{p.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Photos */}
          <div className="space-y-3">
            <div className="glass rounded-2xl overflow-hidden aspect-square animate-[scaleIn_0.4s_ease-out]">
              {p.photos?.length > 0 ? (
                <img src={p.photos[activePhoto]?.url} alt={p.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl opacity-20 bg-white/5">🛍️</div>
              )}
            </div>
            {p.photos?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {p.photos.map((ph, i) => (
                  <button key={i} onClick={() => setActivePhoto(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                      activePhoto === i ? "border-primary-500" : "border-dark-border opacity-60"
                    }`}>
                    <img src={ph.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-4">
            <div className="glass rounded-2xl p-5">
              {p.category && (
                <p className="text-primary-400 text-xs font-semibold mb-2">
                  {p.category.icon} {p.category.name}
                </p>
              )}
              <h1 className="text-2xl font-bold mb-2">{p.name}</h1>
              {p.brand && <p className="text-white/40 text-sm mb-3">by {p.brand}</p>}

              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-3xl font-bold text-primary-400">৳{p.price.toLocaleString()}</span>
                {p.oldPrice && p.oldPrice > p.price && (
                  <>
                    <span className="text-white/25 line-through text-lg">৳{p.oldPrice.toLocaleString()}</span>
                    <span className="bg-red-500 text-white px-2 py-0.5 rounded-lg text-xs font-bold">-{discount}%</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm mb-4">
                <span className={p.stock > 0 ? "text-green-400" : "text-red-400"}>
                  {p.stock > 0 ? `✓ ${p.stock} in stock` : "✕ Out of stock"}
                </span>
                {p.soldCount > 0 && <span className="text-white/30">{p.soldCount} sold</span>}
              </div>

              {p.description && (
                <p className="text-white/50 text-sm leading-relaxed border-t border-dark-border pt-4">
                  {p.description}
                </p>
              )}
            </div>

            {/* Variants */}
            {p.variants?.length > 0 && (
              <div className="glass rounded-2xl p-5 space-y-4">
                {p.variants.map((v, i) => (
                  <div key={i}>
                    <label className="block text-sm font-semibold mb-2 text-white/80">{v.name}</label>
                    <div className="flex flex-wrap gap-2">
                      {v.options.map(opt => (
                        <button key={opt}
                          onClick={() => setSelectedVariants({ ...selectedVariants, [v.name]: opt })}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition border ${
                            selectedVariants[v.name] === opt
                              ? "bg-primary-600 text-white border-primary-600"
                              : "bg-dark-card text-white/60 border-dark-border hover:border-white/20"
                          }`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add to cart */}
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <label className="text-sm font-semibold text-white/80">Quantity</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-9 h-9 rounded-lg bg-dark-card border border-dark-border hover:border-white/20">−</button>
                  <span className="w-12 text-center font-bold">{qty}</span>
                  <button onClick={() => setQty(Math.min(p.stock, qty + 1))}
                    className="w-9 h-9 rounded-lg bg-dark-card border border-dark-border hover:border-white/20">+</button>
                </div>
              </div>

              {inCart ? (
                <div className="space-y-2">
                  <Link href="/checkout" className="block w-full btn-primary text-white text-center py-3.5 rounded-xl font-bold">
                    🛒 Go to Checkout
                  </Link>
                  <button onClick={() => removeFromShop(p.id)}
                    className="w-full bg-red-900/30 text-red-400 border border-red-800 py-2.5 rounded-xl font-semibold text-sm">
                    ✕ Remove from Cart
                  </button>
                </div>
              ) : (
                <button onClick={handleAdd} disabled={p.stock === 0}
                  className="w-full btn-primary text-white py-3.5 rounded-xl font-bold text-lg disabled:opacity-40">
                  {p.stock === 0 ? "Out of Stock" : user ? `🛒 Add to Cart — ৳${(p.price * qty).toLocaleString()}` : "Login to Buy"}
                </button>
              )}
            </div>

            {/* Delivery */}
            <div className="glass rounded-2xl p-5">
              <h3 className="font-semibold text-sm mb-3">🚚 Delivery Charges</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/50">Inside Dhaka</span>
                  <span className="font-semibold">৳{p.dhakaDeliveryCharge}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Outside Dhaka</span>
                  <span className="font-semibold">৳{p.outsideDeliveryCharge}</span>
                </div>
              </div>
              <p className="text-[10px] text-white/30 mt-3">Cash on delivery available</p>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section>
            <div className="section-line mb-3" />
            <h2 className="text-xl font-bold mb-5">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {related.map(r => <ProductCard key={r.id} product={r} />)}
            </div>
          </section>
        )}
      </div>

      <Footer />
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}