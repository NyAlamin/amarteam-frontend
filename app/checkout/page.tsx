//app/checkout/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import LocationPicker from "@/components/ui/location-picker";
import Toast from "@/components/ui/toast";
import { shopAPI } from "@/lib/api";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/hooks";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { shopItems, updateShopQty, removeFromShop, clearShop, shopSubtotal } = useCart();
  const { toast, showToast } = useToast();

  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    recipientName: user?.name || "",
    phone: user?.phone || "",
    district: "",
    upazila: "",
    address: "",
    note: "",
  });

  const upd = (k: string, v: string) => setForm({ ...form, [k]: v });

  const isDhaka = form.district.toLowerCase() === "dhaka";
  const deliveryCharge = shopItems.length > 0
    ? Math.max(...shopItems.map(i => isDhaka ? i.product.dhakaDeliveryCharge : i.product.outsideDeliveryCharge))
    : 0;
  const total = shopSubtotal + deliveryCharge;

  const onSubmit = async () => {
    if (!user) { router.push("/auth/login"); return; }
    if (shopItems.length === 0) { showToast("Your cart is empty", "error"); return; }
    if (!form.recipientName.trim()) { showToast("Enter recipient name", "error"); return; }
    if (!/^01\d{9}$/.test(form.phone)) { showToast("Enter a valid BD phone number", "error"); return; }
    if (!form.district) { showToast("Select your district", "error"); return; }
    if (!form.address.trim()) { showToast("Enter delivery address", "error"); return; }

    setSubmitting(true);
    try {
      const res = await shopAPI.createOrder({
        items: shopItems.map(i => ({
          productId: i.product.id,
          quantity: i.quantity,
          variant: i.variant,
        })),
        recipientName: form.recipientName.trim(),
        phone: form.phone,
        district: form.district,
        upazila: form.upazila || undefined,
        address: form.address.trim(),
        note: form.note || undefined,
        paymentMethod: "cashOnDelivery",
      });
      clearShop();
      showToast(`Order ${res.data.orderNo} placed successfully!`);
      setTimeout(() => router.push("/my-orders"), 2500);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      showToast(Array.isArray(msg) ? msg[0] : (msg || "Order failed"), "error");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-dark text-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 pt-24 pb-16">
        <div className="text-center mb-8">
          <span className="text-4xl block mb-2">🛒</span>
          <h1 className="text-3xl font-bold gradient-text">Checkout</h1>
        </div>

        {shopItems.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center">
            <span className="text-5xl block mb-4">🛍️</span>
            <h3 className="font-bold text-lg mb-2">Your cart is empty</h3>
            <Link href="/shop" className="btn-primary text-white px-6 py-3 rounded-xl font-bold inline-block mt-4">
              Browse Shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Items */}
            <div className="space-y-4">
              <div className="glass rounded-2xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold">Cart Items ({shopItems.length})</h3>
                  <button onClick={clearShop} className="text-red-400 text-xs font-semibold hover:underline">
                    Clear all
                  </button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {shopItems.map(item => (
                    <div key={`${item.product.id}-${item.variant}`}
                      className="flex gap-3 p-3 bg-dark-card rounded-xl border border-dark-border">
                      {item.product.photos?.[0] ? (
                        <img src={item.product.photos[0].url} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-white/5 flex items-center justify-center text-2xl shrink-0">🛍️</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm line-clamp-2">{item.product.name}</p>
                        {item.variant && <p className="text-[10px] text-white/30">{item.variant}</p>}
                        <p className="text-primary-400 font-bold text-sm mt-1">৳{item.product.price.toLocaleString()}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => updateShopQty(item.product.id, item.quantity - 1)}
                            className="w-7 h-7 rounded bg-dark border border-dark-border text-sm">−</button>
                          <span className="text-sm font-semibold w-8 text-center">{item.quantity}</span>
                          <button onClick={() => updateShopQty(item.product.id, item.quantity + 1)}
                            className="w-7 h-7 rounded bg-dark border border-dark-border text-sm">+</button>
                          <button onClick={() => removeFromShop(item.product.id)}
                            className="text-red-400 text-xs ml-auto">Remove</button>
                        </div>
                      </div>
                      <p className="font-bold text-sm shrink-0">
                        ৳{(item.product.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="glass rounded-2xl p-5">
                <h3 className="font-bold mb-3">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/50">Subtotal</span>
                    <span className="font-semibold">৳{shopSubtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">
                      Delivery {form.district && `(${isDhaka ? "Dhaka" : "Outside Dhaka"})`}
                    </span>
                    <span className="font-semibold">
                      {form.district ? `৳${deliveryCharge}` : "Select district"}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-dark-border">
                    <span className="font-bold">Total</span>
                    <span className="text-primary-400 font-bold text-xl">৳{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping form */}
            <div className="space-y-4">
              <div className="glass rounded-2xl p-5">
                <h3 className="font-bold mb-4">📦 Delivery Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-white/80">Recipient Name *</label>
                    <input value={form.recipientName} onChange={e => upd("recipientName", e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg bg-dark-card border border-dark-border text-white text-sm outline-none focus:border-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-white/80">Phone *</label>
                    <input value={form.phone} onChange={e => upd("phone", e.target.value)} placeholder="01XXXXXXXXX"
                      className="w-full px-3 py-2.5 rounded-lg bg-dark-card border border-dark-border text-white text-sm outline-none focus:border-primary-500" />
                  </div>

                  <LocationPicker
                    district={form.district}
                    upazila={form.upazila}
                    onDistrictChange={v => upd("district", v)}
                    onUpazilaChange={v => upd("upazila", v)}
                    required
                  />

                  <div>
                    <label className="block text-sm font-semibold mb-1 text-white/80">Full Address *</label>
                    <textarea value={form.address} onChange={e => upd("address", e.target.value)} rows={3}
                      placeholder="House, road, area..."
                      className="w-full px-3 py-2.5 rounded-lg bg-dark-card border border-dark-border text-white text-sm outline-none focus:border-primary-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1 text-white/80">Order Note</label>
                    <textarea value={form.note} onChange={e => upd("note", e.target.value)} rows={2}
                      placeholder="Any special instructions..."
                      className="w-full px-3 py-2.5 rounded-lg bg-dark-card border border-dark-border text-white text-sm outline-none focus:border-primary-500" />
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="glass rounded-2xl p-5">
                <h3 className="font-bold mb-3">💳 Payment</h3>
                <div className="bg-primary-900/20 border border-primary-800 rounded-xl p-4">
                  <p className="text-primary-400 font-semibold text-sm mb-1">💵 Cash on Delivery</p>
                  <p className="text-white/40 text-xs">Pay when your order arrives. Online payment coming soon.</p>
                </div>
              </div>

              <button onClick={onSubmit} disabled={submitting}
                className="w-full btn-primary text-white py-4 rounded-2xl font-bold text-lg disabled:opacity-50">
                {submitting ? "Placing order..." : `📦 Place Order — ৳${total.toLocaleString()}`}
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}