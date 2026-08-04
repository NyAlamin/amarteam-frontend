"use client";

import { BD_DISTRICTS, getUpazilas } from "@/lib/bd-locations";
import { useLang } from "@/lib/language-context";

interface Props {
  district: string;
  upazila: string;
  onDistrictChange: (v: string) => void;
  onUpazilaChange: (v: string) => void;
  variant?: "dark" | "light";
  required?: boolean;
  showUpazila?: boolean;
  labelDistrict?: string;
  labelUpazila?: string;
}

export default function LocationPicker({
  district, upazila, onDistrictChange, onUpazilaChange,
  variant = "dark", required = false, showUpazila = true,
  labelDistrict, labelUpazila,
}: Props) {
  const { lang } = useLang();
  const upazilas = getUpazilas(district);

  const cls = variant === "dark"
    ? "w-full px-3 py-2.5 rounded-lg bg-dark-card border border-dark-border text-white text-sm outline-none focus:border-primary-500 cursor-pointer"
    : "w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-green-500 cursor-pointer";

  const labelCls = variant === "dark"
    ? "block text-sm font-semibold mb-1 text-white/80"
    : "block text-sm font-semibold mb-1 text-slate-700";

  // Group districts by division
  const grouped: Record<string, typeof BD_DISTRICTS> = {};
  BD_DISTRICTS.forEach(d => {
    if (!grouped[d.division]) grouped[d.division] = [];
    grouped[d.division].push(d);
  });

  const handleDistrict = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onDistrictChange(value);
    // Only clear upazila if the district actually changed
    if (value !== district) {
      onUpazilaChange("");
    }
  };

  return (
    <div className={showUpazila ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : ""}>
      {/* District */}
      <div>
        <label className={labelCls}>
          {labelDistrict || "District"} {required && <span className="text-red-400">*</span>}
        </label>
        <select
          value={district}
          onChange={handleDistrict}
          className={cls}
          style={variant === "dark" ? { colorScheme: "dark" } : undefined}
        >
          <option value="">— Select district —</option>
          {Object.keys(grouped).map(division => (
            <optgroup key={division} label={`${division} Division`}>
              {grouped[division].map(d => (
                <option key={d.id} value={d.name}>
                  {lang === "bn" ? `${d.nameBn}` : d.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Upazila */}
      {showUpazila && (
        <div>
          <label className={labelCls}>
            {labelUpazila || "Upazila / Thana"} {required && <span className="text-red-400">*</span>}
          </label>
          <select
            value={upazila}
            onChange={e => onUpazilaChange(e.target.value)}
            disabled={!district}
            className={`${cls} disabled:opacity-40 disabled:cursor-not-allowed`}
            style={variant === "dark" ? { colorScheme: "dark" } : undefined}
          >
            <option value="">
              {district ? "— Select upazila —" : "Select district first"}
            </option>
            {upazilas.map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}