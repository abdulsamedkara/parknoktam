"use client";

import { useEffect, useState } from "react";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  feltSafe: boolean | null;
  easyAccess: boolean | null;
  createdAt: string;
  userName: string;
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ fontSize: "13px", color: i <= rating ? "#f59e0b" : "#e2e8f0" }}>★</span>
      ))}
    </div>
  );
}

export default function ReviewsSection({ spotId }: { spotId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/spots/${spotId}/reviews`)
      .then(r => r.json())
      .then(d => { setReviews(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [spotId]);

  if (loading) return null;
  if (reviews.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="font-extrabold text-slate-800 mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-amber-500" style={{ fontSize: "20px", fontVariationSettings: "'FILL' 1" }}>reviews</span>
        Kullanıcı Yorumları
        <span style={{
          background: "rgba(10,102,194,0.10)",
          color: "#0A66C2",
          borderRadius: "99px",
          padding: "2px 10px",
          fontSize: "11px",
          fontWeight: 800,
        }}>{reviews.length}</span>
      </h3>

      <div className="flex flex-col gap-3">
        {reviews.map(r => (
          <div key={r.id} style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(12px)",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.9)",
            boxShadow: "0 4px 14px rgba(0,0,0,0.05)",
            padding: "14px",
          }}>
            {/* Üst satır: isim + yıldız + tarih */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "linear-gradient(135deg,#0A66C2,#1e88e5)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontWeight: 800, fontSize: "13px", flexShrink: 0,
                }}>
                  {r.userName[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-[12px]">{r.userName}</p>
                  <StarRow rating={r.rating} />
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-medium shrink-0">
                {new Date(r.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>

            {/* Yorum */}
            {r.comment && (
              <p className="text-slate-600 text-[13px] leading-relaxed">{r.comment}</p>
            )}

            {/* Etiketler */}
            {(r.feltSafe || r.easyAccess) && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {r.feltSafe && (
                  <span style={{ background: "rgba(5,150,105,0.10)", color: "#059669", borderRadius: "99px", padding: "2px 9px", fontSize: "10px", fontWeight: 700 }}>
                    ✓ Güvende Hissetti
                  </span>
                )}
                {r.easyAccess && (
                  <span style={{ background: "rgba(10,102,194,0.10)", color: "#0A66C2", borderRadius: "99px", padding: "2px 9px", fontSize: "10px", fontWeight: 700 }}>
                    ✓ Kolay Giriş
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
