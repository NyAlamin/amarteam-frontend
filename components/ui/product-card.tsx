"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";

export default function ProductCard({ product: p }: { product: Product }) {
  const { addToShop, isInShop, removeFromShop } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const photo = p.photos?.[0]?.url;
  const inCart = isInShop(p.id);
  const discount = p.oldPrice && p.oldPrice > p.price
    ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)
    : 0;

  const handleCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { router.push("/auth/login"); return; }
    if (inCart) removeFromShop(p.id);
    else addToShop(p, 1);
  };

  return (
    <Link href={`/shop/${p.id}`}>
      <div className="bg-dark-card border border-dark-border rounded-lg sm:rounded-2xl overflow-hidden cursor-pointer card-hover group h-full flex flex-col">

        {/* Photo */}
        <div className="relative aspect-square bg-white/5 overflow-hidden shrink-0">
          {photo ? (
            <img src={photo} alt={p.name} className="w-full h-full object-cover img-zoom" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl sm:text-4xl opacity-20">🛍️</div>
          )}

          {discount > 0 && (
            <span className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-red-500 text-white px-1 py-0.5 sm:px-2 sm:py-0.5 rounded text-[7px] sm:text-[11px] font-bold">
              -{discount}%
            </span>
          )}

          {p.isFeatured && (
            <span className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-yellow-500 text-white px-1 py-0.5 sm:px-2 sm:py-0.5 rounded text-[7px] sm:text-[10px] font-bold">
              ⭐<span className="hidden sm:inline"> Featured</span>
            </span>
          )}

          {p.stock === 0 && (
            <div className="absolute inset-0 bg-black/65 flex items-center justify-center">
              <span className="bg-red-600 text-white px-1.5 py-0.5 sm:px-3 sm:py-1 rounded text-[7px] sm:text-xs font-bold">
                SOLD OUT
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-1.5 sm:p-3 flex flex-col flex-1">
          {p.category && (
            <p className="hidden sm:block text-[10px] text-primary-400 font-semibold mb-1 truncate">
              {p.category.icon} {p.category.name}
            </p>
          )}

          <h3 className="font-semibold text-white text-[9px] sm:text-sm line-clamp-2 mb-1 sm:mb-2 leading-tight min-h-[1.8rem] sm:min-h-[2.5rem]">
            {p.name}
          </h3>

          <div className="flex items-baseline gap-1 sm:gap-2 mb-1.5 sm:mb-3 flex-wrap mt-auto">
            <span className="text-primary-400 font-bold text-[11px] sm:text-base">
              ৳{p.price.toLocaleString()}
            </span>
            {p.oldPrice && p.oldPrice > p.price && (
              <span className="text-white/25 line-through text-[8px] sm:text-xs">
                ৳{p.oldPrice.toLocaleString()}
              </span>
            )}
          </div>

          <div className="hidden sm:flex items-center justify-between mb-2 text-[10px]">
            <span className={p.stock > 0 ? "text-white/40" : "text-red-400"}>
              {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
            </span>
            {p.soldCount > 0 && <span className="text-white/25">{p.soldCount} sold</span>}
          </div>

          <button
            onClick={handleCart}
            disabled={p.stock === 0}
            className={`w-full py-1 sm:py-2 rounded sm:rounded-lg text-[8px] sm:text-xs font-bold transition disabled:opacity-30 ${
              inCart
                ? "bg-red-900/30 text-red-400 border border-red-800"
                : "bg-primary-900/30 text-primary-400 border border-primary-800 hover:bg-primary-900/50"
            }`}
          >
            {p.stock === 0 ? "Sold out" : inCart ? "✕ Remove" : "+ Cart"}
          </button>
        </div>
      </div>
    </Link>
  );
}