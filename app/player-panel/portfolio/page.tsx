"use client";

import { useEffect, useState, useRef } from "react";
import { playersAPI, uploadAPI } from "@/lib/api";
import Toast from "@/components/ui/toast";
import Loading from "@/components/ui/loading";
import ConfirmModal from "@/components/ui/confirm-modal";
import { useToast } from "@/lib/hooks";
import { PhotoEntry, VideoEntry } from "@/lib/types";

const MAX_PHOTOS = 30;
const MAX_VIDEOS = 5;
const MAX_VIDEO_SECONDS = 125; // 2 min + 5s grace

export default function CameramanPortfolioPage() {
  const { toast, showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [playerType, setPlayerType] = useState("player");

  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [videos, setVideos] = useState<VideoEntry[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ type: "photo" | "video"; index: number } | null>(null);

  const photoInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    playersAPI.getMyProfile().then(r => {
      setPlayerType(r.data.playerType || "player");
      setPhotos(r.data.portfolioPhotos || []);
      setVideos(r.data.portfolioVideos || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const persist = async (nextPhotos: PhotoEntry[], nextVideos: VideoEntry[]) => {
    setSaving(true);
    try {
      await playersAPI.selfUpdate({
        portfolioPhotos: nextPhotos,
        portfolioVideos: nextVideos,
      });
      showToast("Portfolio saved");
    } catch (err: any) {
      const msg = err.response?.data?.message;
      showToast(Array.isArray(msg) ? msg[0] : (msg || "Failed to save"), "error");
    } finally { setSaving(false); }
  };

  // ─── Photos ───
  const handlePhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (photos.length + files.length > MAX_PHOTOS) {
      showToast(`Maximum ${MAX_PHOTOS} photos. You can add ${MAX_PHOTOS - photos.length} more.`, "warning");
      return;
    }

    setUploadingPhoto(true);
    try {
      const results = await Promise.all(files.map(f => uploadAPI.image(f)));
      const next = [...photos, ...results.map(r => ({ url: r.data.url, publicId: r.data.publicId }))];
      setPhotos(next);
      await persist(next, videos);
    } catch { showToast("Photo upload failed", "error"); }
    finally { setUploadingPhoto(false); if (photoInput.current) photoInput.current.value = ""; }
  };

  // ─── Videos ───
  const getVideoDuration = (file: File): Promise<number> =>
    new Promise(resolve => {
      const vid = document.createElement("video");
      vid.preload = "metadata";
      vid.onloadedmetadata = () => { URL.revokeObjectURL(vid.src); resolve(vid.duration); };
      vid.onerror = () => resolve(0);
      vid.src = URL.createObjectURL(file);
    });

  const handleVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (videos.length >= MAX_VIDEOS) {
      showToast(`Maximum ${MAX_VIDEOS} videos. Remove one first.`, "warning");
      if (videoInput.current) videoInput.current.value = "";
      return;
    }

    // Check duration before uploading
    const duration = await getVideoDuration(file);
    if (duration > MAX_VIDEO_SECONDS) {
      const mins = Math.floor(duration / 60);
      const secs = Math.round(duration % 60);
      showToast(`Video is ${mins}:${String(secs).padStart(2, "0")} — maximum is 2:00`, "error");
      if (videoInput.current) videoInput.current.value = "";
      return;
    }

    setUploadingVideo(true);
    try {
      const r = await uploadAPI.video(file);
      const entry: VideoEntry = {
        url: r.data.url,
        publicId: r.data.publicId,
        thumbnailUrl: r.data.thumbnailUrl,
        title: videoTitle.trim() || `Clip ${videos.length + 1}`,
        duration: Math.round(duration),
      };
      const next = [...videos, entry];
      setVideos(next);
      setVideoTitle("");
      await persist(photos, next);
    } catch (err: any) {
      showToast(err.response?.data?.message || "Video upload failed", "error");
    } finally {
      setUploadingVideo(false);
      if (videoInput.current) videoInput.current.value = "";
    }
  };

  const doRemove = async () => {
    if (!confirm) return;
    if (confirm.type === "photo") {
      const next = photos.filter((_, i) => i !== confirm.index);
      setPhotos(next);
      await persist(next, videos);
    } else {
      const next = videos.filter((_, i) => i !== confirm.index);
      setVideos(next);
      await persist(photos, next);
    }
    setConfirm(null);
  };

  const fmtDuration = (s?: number) => {
    if (!s) return "";
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  };

  if (loading) return <Loading />;

  if (playerType !== "cameraman") {
    return (
      <div className="glass rounded-2xl p-10 text-center">
        <span className="text-5xl block mb-4">📷</span>
        <h3 className="font-bold text-lg mb-2">Portfolio is for cameramen</h3>
        <p className="text-white/40 text-sm">
          This section is only available for cameraman accounts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Info */}
      <div className="glass rounded-2xl p-4">
        <h2 className="font-bold text-white mb-1">📷 My Portfolio</h2>
        <p className="text-xs text-white/40">
          Show clients your work. Max {MAX_PHOTOS} photos and {MAX_VIDEOS} videos (2 min each).
        </p>
        {saving && <p className="text-[11px] text-primary-400 mt-2">Saving...</p>}
      </div>

      {/* ─── VIDEOS ─── */}
      <div className="glass rounded-2xl p-4 sm:p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-white text-sm">🎬 Videos</h3>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            videos.length >= MAX_VIDEOS ? "bg-red-900/30 text-red-400" : "bg-primary-900/30 text-primary-400"
          }`}>
            {videos.length} / {MAX_VIDEOS}
          </span>
        </div>

        {/* Upload */}
        {videos.length < MAX_VIDEOS && (
          <div className="mb-4 space-y-2">
            <input
              value={videoTitle}
              onChange={e => setVideoTitle(e.target.value)}
              placeholder="Clip title (optional)"
              className="w-full px-3 py-2.5 rounded-lg bg-dark-card border border-dark-border text-white text-sm outline-none focus:border-primary-500"
            />
            <button
              onClick={() => videoInput.current?.click()}
              disabled={uploadingVideo}
              className="w-full border-2 border-dashed border-dark-border rounded-xl py-6 text-center hover:border-primary-500 transition disabled:opacity-50"
            >
              {uploadingVideo ? (
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 border-2 border-primary-800 border-t-primary-500 rounded-full animate-spin" />
                  <p className="text-xs text-white/40 mt-2">Uploading video...</p>
                </div>
              ) : (
                <>
                  <p className="text-3xl mb-1">🎬</p>
                  <p className="text-primary-400 font-semibold text-sm">Upload video</p>
                  <p className="text-[10px] text-white/30 mt-1">MP4, WebM • max 2 minutes • max 100MB</p>
                </>
              )}
            </button>
            <input ref={videoInput} type="file" accept="video/*" onChange={handleVideo} className="hidden" />
          </div>
        )}

        {/* List */}
        {videos.length === 0 ? (
          <p className="text-center py-8 text-white/25 text-sm">No videos yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {videos.map((v, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-dark-border bg-dark-card">
                <div className="relative">
                  <video src={v.url} controls poster={v.thumbnailUrl}
                    className="w-full h-40 object-cover bg-black" />
                  {v.duration && (
                    <span className="absolute bottom-2 right-2 bg-black/80 text-white px-1.5 py-0.5 rounded text-[10px] font-bold pointer-events-none">
                      {fmtDuration(v.duration)}
                    </span>
                  )}
                </div>
                <div className="p-3 flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold truncate">{v.title}</p>
                  <button onClick={() => setConfirm({ type: "video", index: i })}
                    className="text-red-400 text-xs font-semibold shrink-0 px-2.5 py-1 rounded-lg bg-red-900/20 border border-red-900 hover:bg-red-900/40 transition">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── PHOTOS ─── */}
      <div className="glass rounded-2xl p-4 sm:p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-white text-sm">📸 Photos</h3>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            photos.length >= MAX_PHOTOS ? "bg-red-900/30 text-red-400" : "bg-primary-900/30 text-primary-400"
          }`}>
            {photos.length} / {MAX_PHOTOS}
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {photos.map((p, i) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
              <img src={p.url} alt="" className="w-full h-full object-cover cursor-pointer"
                onClick={() => setLightbox(p.url)} />
              <button onClick={() => setConfirm({ type: "photo", index: i })}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white text-xs opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                ✕
              </button>
            </div>
          ))}

          {photos.length < MAX_PHOTOS && (
            <button onClick={() => photoInput.current?.click()} disabled={uploadingPhoto}
              className="aspect-square rounded-lg border-2 border-dashed border-dark-border flex flex-col items-center justify-center hover:border-primary-500 transition disabled:opacity-50">
              {uploadingPhoto ? (
                <div className="w-6 h-6 border-2 border-primary-800 border-t-primary-500 rounded-full animate-spin" />
              ) : (
                <>
                  <span className="text-2xl">📷</span>
                  <span className="text-[9px] text-white/30 mt-1">Add</span>
                </>
              )}
            </button>
          )}
        </div>

        <input ref={photoInput} type="file" accept="image/*" multiple onChange={handlePhotos} className="hidden" />

        {photos.length === 0 && (
          <p className="text-center py-6 text-white/25 text-sm">
            Upload photos from matches you've covered.
          </p>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[9999] p-4"
          onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" className="max-w-full max-h-full rounded-xl" />
          <button className="absolute top-6 right-6 text-white text-3xl">✕</button>
        </div>
      )}

      {confirm && (
        <ConfirmModal
          message={`Remove this ${confirm.type}? It will be deleted permanently.`}
          onConfirm={doRemove}
          onCancel={() => setConfirm(null)}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
