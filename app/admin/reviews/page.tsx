"use client";

import { useEffect, useState } from "react";
import { reviewsAPI } from "@/lib/api";
import { Stars } from "@/components/ui/player-card";
import ConfirmModal from "@/components/ui/confirm-modal";
import Toast from "@/components/ui/toast";
import Loading from "@/components/ui/loading";
import { useToast } from "@/lib/hooks";
import { Review } from "@/lib/types";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState<string | null>(null);
  const { toast, showToast } = useToast();

  const fetch = () => { reviewsAPI.getAll().then(r => setReviews(r.data)).finally(() => setLoading(false)); };
  useEffect(() => { fetch(); }, []);
  const del = async () => { if (!confirm) return; await reviewsAPI.delete(confirm); showToast("Deleted", "error"); setConfirm(null); fetch(); };

  if (loading) return <Loading />;

  return (
    <div className="space-y-3">
      {reviews.length === 0 ? <p className="text-center py-16 text-slate-400">No reviews yet.</p> :
        reviews.map(r => (
          <div key={r.id} className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex justify-between items-start">
              <div className="min-w-0 flex-1">
                <p className="text-sm"><span className="text-green-600 font-semibold">{r.player?.user?.name}</span> — by {r.author?.name}</p>
                <Stars rating={r.rating} />
                <p className="text-sm text-slate-500 mt-1">{r.text}</p>
                <p className="text-xs text-slate-400 mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
              <button onClick={() => setConfirm(r.id)} className="text-red-500 text-sm font-semibold shrink-0 ml-3">Delete</button>
            </div>
          </div>
        ))
      }
      {confirm && <ConfirmModal message="Delete this review?" onConfirm={del} onCancel={() => setConfirm(null)} />}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}