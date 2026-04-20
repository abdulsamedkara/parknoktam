"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

interface FavoriteSpot {
  id: string;
  spot: {
    id: string;
    title: string;
    address: string;
    pricePerHour: number;
    photos: string;
    isActive: boolean;
    rating: number;
    reviewCount: number;
    hasCCTV: boolean;
    hasEVCharger: boolean;
    spotType: string;
  };
}

export default function FavorilerPage() {
  const [favorites, setFavorites] = useState<FavoriteSpot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/favorites")
      .then(r => r.json())
      .then(data => {
        setFavorites(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleRemoveFavorite = async (spotId: string) => {
    try {
      await fetch("/api/user/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spotId }),
      });
      setFavorites(favorites.filter(f => f.spot.id !== spotId));
      toast.success("Favorilerden çıkarıldı.");
    } catch {
      toast.error("Bir hata oluştu.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "linear-gradient(160deg,#e8f0fe 0%,#f0f5ff 40%,#fafbff 100%)" }}>
        <span className="material-symbols-outlined text-[#0A66C2] animate-spin" style={{ fontSize: "40px" }}>refresh</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-[100px]" style={{ background: "linear-gradient(160deg,#e8f0fe 0%,#f0f5ff 40%,#fafbff 100%)" }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-5">
        <div className="flex items-center gap-3 mb-1">
          <Link href="/ara" className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center shadow-sm active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-slate-700" style={{ fontSize: "20px" }}>arrow_back</span>
          </Link>
          <h1 className="font-black text-slate-800 text-2xl">Favorilerim</h1>
        </div>
        <p className="text-slate-400 text-sm pl-12">Beğendiğin park alanları</p>
      </div>

      <div className="px-5">
        {favorites.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-10 text-center shadow-sm">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-red-400" style={{ fontSize: "40px", fontVariationSettings: "'FILL' 1" }}>favorite</span>
            </div>
            <h3 className="font-black text-slate-700 text-lg mb-2">Henüz favori yok</h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">Park yeri detay sayfalarında ❤️ butonuna basarak beğendiklerini buraya ekleyebilirsin.</p>
            <Link href="/ara" className="inline-block px-6 py-3 bg-[#0A66C2] text-white rounded-xl font-bold shadow-lg shadow-blue-500/30">
              Park Yeri Keşfet
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {favorites.map(fav => {
              const s = fav.spot;
              let photo = "";
              try { photo = JSON.parse(s.photos)[0]; } catch {}

              return (
                <div key={fav.id} style={{
                  background: "white", borderRadius: "20px",
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                  overflow: "hidden",
                }}>
                  <Link href={`/otopark/${s.id}`} className="flex p-3 gap-3 active:bg-slate-50 transition-colors">
                    <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                      {photo ? (
                        <img src={photo} alt={s.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-slate-300">image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 py-1">
                      <h3 className="font-bold text-slate-800 text-[14px] leading-tight mb-0.5 truncate">{s.title}</h3>
                      <p className="text-slate-400 text-[11px] truncate mb-2">{s.address}</p>
                      <div className="flex items-center gap-3">
                        <span className="font-black text-[#0A66C2] text-sm">₺{s.pricePerHour}<span className="font-medium text-slate-400 text-xs">/saat</span></span>
                        {s.rating > 0 && (
                          <span className="text-xs text-amber-500 font-bold">⭐ {s.rating.toFixed(1)}</span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.isActive ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                          {s.isActive ? "Aktif" : "Pasif"}
                        </span>
                      </div>
                    </div>
                  </Link>
                  <div className="border-t border-slate-50 px-3 py-2 flex gap-2">
                    <Link href={`/rezervasyon/${s.id}`}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-colors ${s.isActive ? 'bg-[#0A66C2] text-white' : 'bg-slate-100 text-slate-400 pointer-events-none'}`}>
                      <span className="material-symbols-outlined text-[14px]">bookmark_added</span>
                      {s.isActive ? "Kirala" : "Pasif"}
                    </Link>
                    <button
                      onClick={() => handleRemoveFavorite(s.id)}
                      className="w-10 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-400 rounded-lg transition-colors"
                      title="Favorilerden Çıkar"
                    >
                      <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
