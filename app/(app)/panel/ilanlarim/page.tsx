"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Spot {
  id: string;
  title: string;
  address: string;
  isActive: boolean;
  pricePerHour: number;
  photos: string;
  stats: {
    revenue: number;
    reservationCount: number;
  };
}

export default function IlanlarimPage() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchSpots = () => {
    fetch("/api/panel/spots")
      .then(res => {
        if(!res.ok) throw new Error("API hatası");
        return res.json();
      })
      .then(data => {
        setSpots(data);
      })
      .catch((err) => {
        toast.error("İlanlar yüklenirken hata oluştu.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSpots();
  }, []);

  const handleDelete = (id: string) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-slate-800">Bu ilanı tamamen silmek istediğinize emin misiniz?</p>
        <div className="flex gap-2">
          <button className="flex-1 bg-red-500 text-white py-1.5 rounded-lg text-xs font-bold" onClick={async () => {
             toast.dismiss(t.id);
             try {
                const res = await fetch(`/api/panel/spots/${id}`, { method: "DELETE" });
                if (!res.ok) throw new Error("Silme hatası");
                setSpots(spots.filter(s => s.id !== id));
                toast.success("İlan başarıyla silindi.");
              } catch(err) { toast.error("Silme işlemi başarısız."); }
          }}>Sil</button>
          <button className="flex-1 bg-slate-100 text-slate-600 py-1.5 rounded-lg text-xs font-bold" onClick={() => toast.dismiss(t.id)}>İptal</button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/panel/spots/${id}/toggle`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Durum güncellenemedi");
      setSpots(spots.map(s => s.id === id ? { ...s, isActive: !currentStatus } : s));
      toast.success(!currentStatus ? "İlan aktifleştirildi" : "İlan pasife alındı");
    } catch(err: any) {
      toast.error(err.message || "Durum güncellenemedi");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20 min-h-screen" style={{ background: "linear-gradient(160deg,#e8f0fe 0%,#f0f5ff 40%,#fafbff 100%)" }}>
        <span className="material-symbols-outlined text-[#0A66C2] animate-spin" style={{ fontSize: "40px" }}>refresh</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-[100px]" style={{ background: "linear-gradient(160deg,#e8f0fe 0%,#f0f5ff 40%,#fafbff 100%)" }}>
      
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-14 pb-2">
        <div>
          <h1 className="font-black text-slate-800 text-2xl">İlanlarım</h1>
          <p className="text-slate-500 text-sm mt-0.5">Yönetimdeki park alanlarınız ({spots.length})</p>
        </div>
        <Link href="/panel/ilan-ekle" className="w-10 h-10 bg-[#0A66C2] text-white rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform">
          <span className="material-symbols-outlined">add</span>
        </Link>
      </div>

      <div className="px-5 pt-4">

      {spots.length === 0 ? (
        <div className="bg-white rounded-[24px] border border-slate-100 p-8 text-center shadow-sm">
           <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[#0A66C2]" style={{ fontSize: "40px" }}>garage_home</span>
           </div>
           <h3 className="font-black text-slate-700 text-lg mb-2">Henüz ilanınız yok</h3>
           <p className="text-slate-400 text-sm mb-6 leading-relaxed">Yeni bir ilan oluşturarak garajınızı veya otoparkınızı sisteme ekleyebilir, gelir elde etmeye başlayabilirsiniz.</p>
           <Link href="/panel/ilan-ekle" className="inline-block px-6 py-3 bg-[#0A66C2] text-white rounded-xl font-bold shadow-lg shadow-blue-500/30">
            Hemen İlan Ekle
           </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {spots.map((spot) => {
            let photoUrl = "";
            try { photoUrl = JSON.parse(spot.photos)[0]; } catch {}

            return (
              <div key={spot.id} style={{
                background: "white",
                borderRadius: "20px",
                border: "1px solid #f1f5f9",
                boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                overflow: "hidden"
              }}>
                <div className="flex p-3 gap-3">
                  <div className="w-24 h-24 bg-slate-100 rounded-xl overflow-hidden shrink-0 relative">
                     {photoUrl ? (
                       <img src={photoUrl} alt={spot.title} className="w-full h-full object-cover" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-slate-300">image</span>
                       </div>
                     )}
                     {!spot.isActive && (
                       <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded-md">PASİF</span>
                       </div>
                     )}
                  </div>
                  
                  <div className="flex-1 min-w-0 py-1">
                    <div className="flex items-start justify-between">
                       <h3 className="font-bold text-slate-800 text-[14px] leading-tight mb-1 line-clamp-2">{spot.title}</h3>
                    </div>
                    <p className="text-slate-400 text-[11px] truncate mb-3">{spot.address}</p>
                    
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Gelİr</p>
                        <p className="font-black text-green-600 text-sm">₺{spot.stats.revenue}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">İŞlem</p>
                        <p className="font-bold text-slate-700 text-sm">{spot.stats.reservationCount}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 border-t border-slate-100 p-2 flex gap-2">
                   <button onClick={() => router.push(`/panel/ilan-duzenle/${spot.id}`)} className="flex-1 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">edit</span> Düzenle
                   </button>
                   <button onClick={() => handleToggle(spot.id, spot.isActive)} className="flex-1 py-2 text-xs font-bold text-orange-500 hover:bg-orange-50 rounded-lg transition-colors flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">power_settings_new</span> 
                      {spot.isActive ? "Pasife Al" : "Aktifleştir"}
                   </button>
                   <button onClick={() => handleDelete(spot.id)} className="w-10 flex shrink-0 items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors" title="İlanı Sil">
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                   </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
      </div>
    </div>
  );
}
