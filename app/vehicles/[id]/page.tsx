"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import LocationPicker from "@/components/ui/location-picker";
import Toast from "@/components/ui/toast";
import Loading from "@/components/ui/loading";
import { vehiclesAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/language-context";
import { useToast } from "@/lib/hooks";
import { Vehicle, VEHICLE_TYPES } from "@/lib/types";

export default function VehicleDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { lang } = useLang();
  const { toast, showToast } = useToast();

  const [v, setV] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);

  const [startDate, setStartDate] = useState("");
  const [days, setDays] = useState(1);
  const [district, setDistrict] = useState("");
  const [upazila, setUpazila] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    vehiclesAPI.getOne(id as string)
      .then(r => { setV(r.data); setDays(r.data.minDays || 1); })
      .catch(() => router.push("/vehicles"))
      .finally(() => setLoading(false));
  }, [id]);

  const surcharge = v?.districtCharges?.find(
    dc => dc.district.toLowerCase() === district.toLowerCase()
  )?.extraCharge || 0;
  const baseTotal = (v?.basePerDay || 0) * days;
  const estimate = baseTotal + surcharge;

  const onSubmit = async () => {
    if (!user) { router.push("/auth/login"); return; }
    if (!startDate) { showToast("Select a start date", "error"); return; }
    if (!district) { showToast("Select a district", "error"); return; }

    setSubmitting(true);
    try {
      await vehiclesAPI.createBooking({
        vehicleId: id,
        startDate,
        days: Number(days),
        district,
        upazila: upazila || undefined,
        pickupAddress: pickupAddress || undefined,
        message: message || undefined,
      });
      showToast("Booking submitted! We'll contact you shortly.");
      setTimeout(() => router.push("/vehicles"), 2500);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      showToast(Array.isArray(msg) ? msg[0] : (msg || "Booking failed"), "error");
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="min-h-screen bg-dark"><Navbar /><div className="pt-24"><Loading /></div></div>;
  if (!v) return null;

  const type = VEHICLE_TYPES.find(t => t.value === v.vehicleType);

  return (
    <div className="min-h-screen bg-dark text-white">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LEFT — Photos & Info */}
          <div className="space-y-4">
            {/* Photo gallery */}
            <div className="glass rounded-2xl overflow-hidden animate-[scaleIn_0.4s_ease-out]">
              <div className="relative h-64 sm:h-80 bg-gradient-to-br from-slate-800 to-dark">
                {v.photos?.length > 0 ? (
                  <img src={v.photos[activePhoto]?.url} alt={v.model} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">
                    {type?.icon || "🚗"}
                  </div>
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="bg-black/60 backdrop-blur text-white px-3 py-1.5 rounded-lg text-xs font-bold">
                    {type?.icon} {lang === "bn" ? type?.labelBn : type?.label}
                  </span>
                  {v.hasAc && (
                    <span className="bg-blue-600/80 backdrop-blur text-white px-3 py-1.5 rounded-lg text-xs font-bold">
                      ❄️ AC
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnails */}
              {v.photos?.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {v.photos.map((p, i) => (
                    <button key={i} onClick={() => setActivePhoto(i)}
                      className={`w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition ${
                        activePhoto === i ? "border-primary-500" : "border-transparent opacity-60"
                      }`}>
                      <img src={p.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="glass rounded-2xl p-5">
              <h1 className="text-2xl font-bold mb-2">{v.model}</h1>
              {v.description && <p className="text-white/50 text-sm mb-4 leading-relaxed">{v.description}</p>}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { l: "Seats", val: v.seats, i: "💺" },
                  { l: "AC", val: v.hasAc ? "Yes" : "No", i: "❄️" },
                  { l: "Min Days", val: v.minDays, i: "📅" },
                  { l: "Based In", val: v.baseDistrict || "Dhaka", i: "📍" },
                ].map((s, i) => (
                  <div key={i} className="bg-dark-card rounded-xl p-3 text-center border border-dark-border">
                    <div className="text-lg">{s.i}</div>
                    <div className="font-bold text-sm">{s.val}</div>
                    <div className="text-[10px] text-white/40">{s.l}</div>
                  </div>
                ))}
              </div>

              {v.registrationNo && (
                <p className="text-[11px] text-white/30 mt-3">Reg: {v.registrationNo}</p>
              )}
            </div>

            {/* District charges */}
            {v.districtCharges?.length > 0 && (
              <div className="glass rounded-2xl p-5">
                <h3 className="font-semibold text-sm mb-3">📍 District Surcharges</h3>
                <div className="space-y-1.5 max-h-52 overflow-y-auto">
                  {v.districtCharges.map((dc, i) => (
                    <div key={i} className="flex justify-between text-sm py-1.5 border-b border-dark-border last:border-0">
                      <span className="text-white/60">{dc.district}</span>
                      <span className="text-primary-400 font-semibold">+৳{dc.extraCharge.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-white/30 mt-2">Districts not listed have no extra charge</p>
              </div>
            )}
          </div>

          {/* RIGHT — Booking form */}
          <div className="space-y-4">
            {/* Price summary */}
            <div className="glass rounded-2xl p-5 animate-[slideUp_0.5s_ease-out]">
              <p className="text-white/40 text-xs mb-1">Base rate</p>
              <p className="text-3xl font-bold text-primary-400 mb-4">
                ৳{v.basePerDay.toLocaleString()}
                <span className="text-white/30 text-base font-normal">/day</span>
              </p>

              <div className="bg-dark-card rounded-xl p-4 border border-dark-border space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/40">{v.basePerDay.toLocaleString()} × {days} day{days > 1 ? "s" : ""}</span>
                  <span className="font-semibold">৳{baseTotal.toLocaleString()}</span>
                </div>
                {surcharge > 0 && (
                  <div className="flex justify-between">
                    <span className="text-white/40">{district} surcharge</span>
                    <span className="font-semibold text-yellow-400">+৳{surcharge.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-dark-border">
                  <span className="text-white/60 font-semibold">Estimated Total</span>
                  <span className="text-primary-400 font-bold text-lg">৳{estimate.toLocaleString()}</span>
                </div>
              </div>

              <p className="text-[10px] text-white/30 mt-2">
                Final price confirmed by our team after booking
              </p>
            </div>

            {/* Booking form */}
            <div className="glass rounded-2xl p-5">
              <h3 className="font-bold mb-4">📅 Book This Vehicle</h3>

              {!v.isAvailable ? (
                <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 text-center">
                  <p className="text-red-400 font-semibold text-sm">Currently Unavailable</p>
                  <p className="text-white/40 text-xs mt-1">Check back later or browse other vehicles</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-white/80">Start Date *</label>
                      <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                        min={new Date().toISOString().slice(0, 10)}
                        className="w-full px-3 py-2.5 rounded-lg bg-dark-card border border-dark-border text-white text-sm outline-none focus:border-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-white/80">Days *</label>
                      <input type="number" value={days} min={v.minDays} max={v.maxDays || 365}
                        onChange={e => setDays(Math.max(v.minDays, +e.target.value))}
                        className="w-full px-3 py-2.5 rounded-lg bg-dark-card border border-dark-border text-white text-sm outline-none focus:border-primary-500" />
                    </div>
                  </div>

                  <LocationPicker
                    district={district}
                    upazila={upazila}
                    onDistrictChange={setDistrict}
                    onUpazilaChange={setUpazila}
                    required
                    labelDistrict="Destination District"
                  />

                  <div>
                    <label className="block text-sm font-semibold mb-1 text-white/80">Pickup Address</label>
                    <input value={pickupAddress} onChange={e => setPickupAddress(e.target.value)}
                      placeholder="Where should we pick you up?"
                      className="w-full px-3 py-2.5 rounded-lg bg-dark-card border border-dark-border text-white text-sm outline-none focus:border-primary-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1 text-white/80">Message</label>
                    <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3}
                      placeholder="Trip details, timing, special requests..."
                      className="w-full px-3 py-2.5 rounded-lg bg-dark-card border border-dark-border text-white text-sm outline-none focus:border-primary-500" />
                  </div>

                  <button onClick={onSubmit} disabled={submitting}
                    className="w-full btn-primary text-white py-3.5 rounded-xl font-bold text-lg disabled:opacity-50">
                    {submitting ? "Submitting..." : user ? `🚗 Book — ৳${estimate.toLocaleString()}` : "Login to Book"}
                  </button>
                </div>
              )}
            </div>

            {/* Blocked dates */}
            {v.unavailableDates?.length > 0 && (
              <div className="glass rounded-2xl p-4">
                <h4 className="text-xs font-semibold text-red-400 mb-2">🚫 Already Booked Dates</h4>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                  {v.unavailableDates.map(d => (
                    <span key={d} className="bg-red-900/30 text-red-400 border border-red-900 px-2 py-0.5 rounded text-[10px]">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}