"use client";

import { useEffect, useState } from "react";
import { playersAPI } from "@/lib/api";
import FileUpload from "@/components/ui/file-upload";
import Toast from "@/components/ui/toast";
import Loading from "@/components/ui/loading";
import { useToast } from "@/lib/hooks";
import { VideoEntry } from "@/lib/types";

export default function PlayerVideosPage() {
  const [videos, setVideos] = useState<VideoEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const { toast, showToast } = useToast();

  useEffect(() => {
    playersAPI.getMyProfile().then(r => { setVideos(r.data.videos || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const save = async (v: VideoEntry[]) => {
    try { await playersAPI.selfUpdate({ videos: v }); showToast("Videos updated!"); }
    catch { showToast("Failed to save", "error"); }
  };

  const addVideo = (data: any) => {
    const entry: VideoEntry = {
      url: data.url, publicId: data.publicId,
      thumbnailUrl: data.thumbnailUrl,
      title: newTitle || `Video ${videos.length + 1}`,
      duration: data.duration,
    };
    const updated = [...videos, entry];
    setVideos(updated); setNewTitle(""); save(updated);
  };

  const remove = (i: number) => {
    const u = videos.filter((_, idx) => idx !== i);
    setVideos(u); save(u);
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-4">
      {/* Upload Card */}
      <div className="glass rounded-2xl p-4 sm:p-6">
        <h2 className="font-bold mb-3 text-white">🎬 Upload New Video</h2>
        <div className="mb-3">
          <label className="block text-sm font-semibold mb-1 text-white/80">Video Title</label>
          <input value={newTitle} onChange={e => setNewTitle(e.target.value)}
            placeholder="e.g. BPL 2025 Highlights"
            className="w-full px-3 py-2.5 rounded-lg bg-dark-card border border-dark-border text-white text-sm" />
        </div>
        <FileUpload type="video" onUploaded={addVideo} />
      </div>

      {/* Video List */}
      <div className="glass rounded-2xl p-4 sm:p-6">
        <h2 className="font-bold mb-3 text-white">My Videos ({videos.length})</h2>

        {videos.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-4xl mb-3">🎬</p>
            <p className="text-white/30 text-sm">No videos yet. Upload your highlights!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {videos.map((v, i) => (
              <div key={i} className="bg-dark-card rounded-xl border border-dark-border overflow-hidden">
                {/* Thumbnail */}
                <a href={v.url} target="_blank" rel="noopener noreferrer"
                  className="h-36 bg-gradient-to-br from-primary-900 to-dark flex items-center justify-center relative group">
                  {v.thumbnailUrl ? (
                    <img src={v.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl">▶️</span>
                  )}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition flex items-center justify-center">
                    <span className="text-3xl opacity-80">▶️</span>
                  </div>
                </a>

                {/* Info */}
                <div className="p-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-white truncate">{v.title || `Video ${i + 1}`}</p>
                    <a href={v.url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-primary-400 hover:underline">Watch ↗</a>
                  </div>
                  <button onClick={() => remove(i)}
                    className="text-red-400 text-xs font-semibold shrink-0 px-3 py-1.5 rounded-lg bg-red-900/20 border border-red-900 hover:bg-red-900/40 transition">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}