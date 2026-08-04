"use client";

import { useState, useRef } from "react";
import { uploadAPI } from "@/lib/api";

export default function FileUpload({ type, onUploaded, currentUrl, label }: {
  type: "image" | "video"; onUploaded: (data: any) => void; currentUrl?: string; label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl || "");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (type === "image") setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const res = type === "image" ? await uploadAPI.image(file) : await uploadAPI.video(file);
      onUploaded(res.data);
      if (type === "image") setPreview(res.data.url);
    } catch (err: any) { alert(err.response?.data?.message || "Upload failed"); setPreview(currentUrl || ""); }
    finally { setUploading(false); }
  };

  return (
    <div>
      {label && <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>}
      <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-green-400 transition">
        {uploading ? (
          <div className="py-4"><div className="w-8 h-8 border-3 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto" /><p className="mt-2 text-sm text-slate-500">Uploading...</p></div>
        ) : preview && type === "image" ? (
          <img src={preview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
        ) : (
          <div className="py-4">
            <p className="text-3xl mb-2">{type === "image" ? "📷" : "🎬"}</p>
            <p className="text-green-600 font-semibold">Click to upload {type}</p>
            <p className="text-xs text-slate-400 mt-1">{type === "image" ? "JPG, PNG, WebP (max 5MB)" : "MP4, WebM (max 100MB)"}</p>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept={type === "image" ? "image/*" : "video/*"} onChange={handleChange} className="hidden" />
    </div>
  );
}