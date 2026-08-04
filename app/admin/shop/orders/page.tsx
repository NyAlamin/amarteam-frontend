"use client";

import { useEffect, useState } from "react";
import { shopAPI } from "@/lib/api";
import Toast from "@/components/ui/toast";
import Loading from "@/components/ui/loading";
import { useToast } from "@/lib/hooks";
import { Order, ORDER_STATUS_INFO } from "@/lib/types";

const STATUS_LIGHT: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  onTheWay: "bg-purple-50 text-purple-700 border-purple-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const { toast, showToast } = useToast();

  const load = () => {
    setLoading(true);
    shopAPI.getAllOrders(filter ? { status: filter } : undefined)
      .then(r => setOrders(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const setStatus = async (id: string, status: string) => {
    try {
      await shopAPI.updateOrder(id, { status });
      showToast(`Order marked as ${ORDER_STATUS_INFO[status]?.label}`);
      load();
    } catch (err: any) { showToast(err.response?.data?.message || "Failed", "error"); }
  };

  const togglePaid = async (id: string, isPaid: boolean) => {
    await shopAPI.updateOrder(id, { isPaid: !isPaid });
    showToast(isPaid ? "Marked unpaid" : "Marked paid");
    load();
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto mb-5 pb-1">
        <button onClick={() => setFilter("")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${filter === "" ? "bg-green-600 text-white" : "bg-white text-slate-600"}`}>
          All ({orders.length})
        </button>
        {Object.entries(ORDER_STATUS_INFO).map(([k, i]) => (
          <button key={k} onClick={() => setFilter(k)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${filter === k ? "bg-green-600 text-white" : "bg-white text-slate-600"}`}>
            {i.icon} {i.label}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-16 text-center">
          <p className="text-4xl mb-3">📦</p>
          <p className="text-slate-400">No orders.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(o => {
            const info = ORDER_STATUS_INFO[o.status];
            const isOpen = expanded === o.id;
            return (
              <div key={o.id} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex justify-between items-start gap-3 mb-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-mono font-bold text-sm">#{o.orderNo}</p>
                      {o.isPaid && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold">PAID</span>}
                    </div>
                    <p className="text-sm font-semibold">{o.recipientName}</p>
                    <p className="text-xs text-slate-500">{o.phone} • {o.upazila ? `${o.upazila}, ` : ""}{o.district}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border block mb-1 ${STATUS_LIGHT[o.status]}`}>
                      {info?.icon} {info?.label}
                    </span>
                    <p className="font-bold text-green-600">৳{o.total.toLocaleString()}</p>
                  </div>
                </div>

                <button onClick={() => setExpanded(isOpen ? null : o.id)}
                  className="text-xs text-slate-500 hover:text-slate-700 mb-2">
                  {isOpen ? "▲ Hide details" : `▼ ${o.items.length} item(s) • View details`}
                </button>

                {isOpen && (
                  <div className="bg-slate-50 rounded-lg p-3 mb-3 space-y-2">
                    {o.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        {item.photo ? <img src={item.photo} className="w-10 h-10 rounded object-cover" alt="" /> :
                          <div className="w-10 h-10 rounded bg-slate-200 flex items-center justify-center">🛍️</div>}
                        <span className="flex-1 truncate">{item.productName}</span>
                        {item.variant && <span className="text-xs text-slate-400">{item.variant}</span>}
                        <span className="text-xs">×{item.quantity}</span>
                        <span className="font-semibold">৳{item.subtotal.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-slate-200 space-y-1 text-xs">
                      <div className="flex justify-between"><span className="text-slate-400">Subtotal</span><span>৳{o.subtotal.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Delivery</span><span>৳{o.deliveryCharge}</span></div>
                      <div className="flex justify-between font-bold"><span>Total</span><span className="text-green-600">৳{o.total.toLocaleString()}</span></div>
                    </div>
                    <div className="pt-2 border-t border-slate-200 text-xs">
                      <p className="text-slate-400">Address</p>
                      <p className="text-slate-600">{o.address}</p>
                      {o.note && <><p className="text-slate-400 mt-2">Note</p><p className="text-slate-600">{o.note}</p></>}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                  <div className="flex gap-2">
                    <a href={`tel:${o.phone}`} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold">📞 Call</a>
                    <button onClick={() => togglePaid(o.id, o.isPaid)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${o.isPaid ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                      {o.isPaid ? "✓ Paid" : "Mark Paid"}
                    </button>
                  </div>

                  <div className="flex gap-2">
                    {o.status === "pending" && (
                      <>
                        <button onClick={() => setStatus(o.id, "confirmed")} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold">✓ Confirm</button>
                        <button onClick={() => setStatus(o.id, "cancelled")} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold">✕ Cancel</button>
                      </>
                    )}
                    {o.status === "confirmed" && (
                      <button onClick={() => setStatus(o.id, "onTheWay")} className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold">🚚 On The Way</button>
                    )}
                    {o.status === "onTheWay" && (
                      <button onClick={() => setStatus(o.id, "delivered")} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold">📦 Delivered</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}