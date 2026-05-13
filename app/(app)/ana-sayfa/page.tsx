"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const MiniMap = dynamic(() => import("@/components/MiniMap"), { ssr: false });

interface FavoriteSpot {
  id: string;
  parkingSpot: {
    id: string;
    title: string;
    address: string;
    pricePerHour: number;
    photos: string;
  };
}

export default function AnaSayfa() {
  const { data: session } = useSession();
  const userName = session?.user?.name?.split(" ")[0] || "Kullanıcı";
  const [favorites, setFavorites] = useState<FavoriteSpot[]>([]);

  useEffect(() => {
    if (session) {
      fetch("/api/user/favorites")
        .then(r => r.json())
        .then(data => setFavorites(Array.isArray(data) ? data : []))
        .catch(() => {});
    }
  }, [session]);

  return (
    <div className="min-h-screen pb-[100px]" style={{
      background: "linear-gradient(160deg, #e8f0fe 0%, #f0f5ff 40%, #fafbff 100%)"
    }}>

      {/* Header */}
      <div className="px-5 pt-14 pb-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div style={{
              background: "linear-gradient(135deg, #0A66C2, #1e88e5)",
              boxShadow: "0 4px 14px rgba(10,102,194,0.35)"
            }} className="w-9 h-9 rounded-[10px] flex items-center justify-center text-white font-black text-base">
              P
            </div>
            <span className="font-black text-xl text-slate-800 tracking-tight">Park Noktam</span>
          </div>
          <p className="text-slate-500 text-sm font-medium pl-0.5">
            Merhaba, <span className="text-[#0A66C2] font-bold">{userName}</span> 👋
          </p>
        </div>
        <Link href="/profil" style={{
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
          border: "1px solid rgba(255,255,255,0.6)"
        }} className="w-11 h-11 rounded-full flex items-center justify-center transition-transform active:scale-95">
          <span className="material-symbols-outlined text-slate-600" style={{fontSize:'22px', fontVariationSettings:"'FILL' 1"}}>person</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="px-4 mb-4">
        <Link href="/ara" className="flex items-center gap-3 active:scale-[0.98] transition-transform" style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(16px)",
          borderRadius: "18px",
          padding: "13px 16px",
          border: "1px solid rgba(255,255,255,0.9)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)"
        }}>
          <span className="material-symbols-outlined text-[#0A66C2]" style={{fontSize:'20px'}}>search</span>
          <span className="text-slate-400 text-sm font-medium flex-1">Park yeri ara...</span>
          <span className="material-symbols-outlined text-slate-300" style={{fontSize:'16px'}}>tune</span>
        </Link>
      </div>

      {/* Map Widget */}
      <div className="px-4 mb-2">
        <p className="text-xs text-slate-400 font-medium mb-2 pl-1">
          <span className="material-symbols-outlined text-[#0A66C2] align-middle" style={{fontSize:'14px'}}>info</span>
          {" "}Harita üzerinden konum ve otopark seçebilirsiniz
        </p>
        <Link href="/ara" className="block relative w-full h-[200px] rounded-[24px] overflow-hidden active:scale-[0.98] transition-transform" style={{
          boxShadow: "0 16px 48px -8px rgba(10,102,194,0.2), 0 4px 16px rgba(0,0,0,0.08)"
        }}>
          {/* Live Map */}
          <div className="absolute inset-0">
            <MiniMap />
          </div>

          {/* Top vignette */}
          <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

          {/* Bottom CTA glass pill */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2.5 pointer-events-none" style={{
            background: "rgba(255,255,255,0.88)",
            backdropFilter: "blur(16px)",
            borderRadius: "16px",
            padding: "10px 14px",
            border: "1px solid rgba(255,255,255,0.9)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,1)"
          }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{background: "linear-gradient(135deg, #0A66C2, #1e88e5)"}}>
              <span className="material-symbols-outlined text-white" style={{fontSize:'16px', fontVariationSettings:"'FILL' 1"}}>location_on</span>
            </div>
            <span className="text-[13px] font-bold text-slate-700 flex-1">En yakın park yerini keşfet</span>
            <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#0A66C2]" style={{fontSize:'16px'}}>chevron_right</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Favori Otoparklarım */}
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Favori Otoparklarım</p>
          {favorites.length > 0 && (
            <Link href="/ara" className="text-[#0A66C2] text-xs font-bold">Tümü →</Link>
          )}
        </div>

        {favorites.length === 0 ? (
          /* Compact empty state */
          <div className="flex items-center gap-3" style={{
            background: "rgba(255,255,255,0.6)",
            borderRadius: "16px",
            padding: "12px 14px",
            border: "1px dashed rgba(148,163,184,0.4)"
          }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{background: "rgba(10,102,194,0.08)"}}>
              <span className="material-symbols-outlined text-[#0A66C2]" style={{fontSize:'18px', fontVariationSettings:"'FILL' 1"}}>favorite</span>
            </div>
            <div>
              <p className="text-[13px] font-bold text-slate-600">Henüz favori eklenmedi</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Beğendiğin otoparklara ❤️ basarak buraya ekle</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {favorites.slice(0, 3).map((fav) => {
              let firstPhoto = "";
              try {
                const arr = JSON.parse(fav.parkingSpot.photos);
                firstPhoto = Array.isArray(arr) ? arr[0] : "";
              } catch {}
              return (
                <Link key={fav.id} href={`/otopark/${fav.parkingSpot.id}`}
                  className="flex items-center gap-3 active:scale-[0.98] transition-transform"
                  style={{
                    background: "rgba(255,255,255,0.8)",
                    backdropFilter: "blur(12px)",
                    borderRadius: "18px",
                    padding: "12px",
                    border: "1px solid rgba(255,255,255,0.9)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.05)"
                  }}>
                  <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 bg-slate-100">
                    {firstPhoto ? (
                      <img src={firstPhoto} alt={fav.parkingSpot.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-300" style={{fontSize:'24px', fontVariationSettings:"'FILL' 1"}}>local_parking</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-black text-slate-800 truncate">{fav.parkingSpot.title}</p>
                    <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">{fav.parkingSpot.address}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[13px] font-black text-[#0A66C2]">₺{fav.parkingSpot.pricePerHour}</p>
                    <p className="text-[10px] text-slate-400 font-medium">/saat</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
