"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function IlanDuzenlePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [spotId, setSpotId] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoLoading, setPhotoLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    address: "",
    price: "",
    type: "acik",
    description: "",
    hasCCTV: false,
    hasEVCharger: false,
    isHandicapped: false,
  });

  async function compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const MAX_SIZE = 800;
          let scale = 1;
          if (img.width > MAX_SIZE || img.height > MAX_SIZE) {
            scale = MAX_SIZE / Math.max(img.width, img.height);
          }
          const canvas = document.createElement("canvas");
          canvas.width  = img.width  * scale;
          canvas.height = img.height * scale;
          canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.82));
        };
        img.onerror = reject;
        img.src = e.target!.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handlePhotoAdd(files: FileList | null) {
    if (!files) return;
    setPhotoLoading(true);
    try {
      const newPhotos: string[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        if (photos.length + newPhotos.length >= 5) break;
        const b64 = await compressImage(file);
        newPhotos.push(b64);
      }
      setPhotos(prev => [...prev, ...newPhotos]);
    } finally {
      setPhotoLoading(false);
    }
  }

  useEffect(() => {
    params.then(p => {
      setSpotId(p.id);
      fetch(`/api/spots/${p.id}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.id) {
            setFormData({
              id: data.id,
              title: data.title || "",
              address: data.address || "",
              price: data.pricePerHour ? data.pricePerHour.toString() : "",
              type: data.spotType || "acik",
              description: data.description || "",
              hasCCTV: data.hasCCTV || false,
              hasEVCharger: data.hasEVCharger || false,
              isHandicapped: data.isHandicapped || false,
            });
            if (data.photos && data.photos !== "[]") {
              try {
                setPhotos(JSON.parse(data.photos));
              } catch(e) {}
            }
          }
          setLoading(false);
        })
        .catch(() => {
          toast.error("İlan yüklenirken hata oluştu.");
          setLoading(false);
        });
    });
  }, [params]);

  const handleSave = async () => {
    if(!formData.title || !formData.price || !formData.type) {
      return toast.error("Başlık, ücret ve tip zorunludur.");
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/panel/spots/${spotId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          price: formData.price,
          type: formData.type,
          description: formData.description,
          hasCCTV: formData.hasCCTV,
          hasEVCharger: formData.hasEVCharger,
          isHandicapped: formData.isHandicapped,
          photos: JSON.stringify(photos),
        })
      });
      if(res.ok) {
        toast.success("İlan başarıyla güncellendi.");
        router.push("/profil");
      } else {
        toast.error("Güncelleme başarısız.");
      }
    } catch(err) {
      toast.error("Hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20 min-h-screen" style={{ background: "linear-gradient(160deg,#e8f0fe 0%,#f0f5ff 40%,#fafbff 100%)" }}>
        <span className="material-symbols-outlined text-[#0A66C2] animate-spin" style={{ fontSize: "40px" }}>refresh</span>
      </div>
    );
  }

  if (!formData.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-5" style={{ background: "linear-gradient(160deg,#e8f0fe 0%,#f0f5ff 40%,#fafbff 100%)" }}>
         <span className="material-symbols-outlined text-slate-300 mb-3" style={{ fontSize: "64px" }}>search_off</span>
         <h2 className="font-black text-slate-700 text-xl mb-1">İlan Bulunamadı</h2>
         <p className="text-slate-500 text-sm text-center mb-6">Aradığınız ilan silinmiş veya erişiminiz kısıtlanmış olabilir.</p>
         <Link href="/profil" className="px-6 py-2.5 bg-[#0A66C2] text-white rounded-xl font-bold shadow-lg shadow-blue-500/30">
           İlanlarıma Dön
         </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-[120px]" style={{ background: "linear-gradient(160deg,#e8f0fe 0%,#f0f5ff 40%,#fafbff 100%)" }}>
      
      {/* Header */}
      <div className="px-5 pt-14 pb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/profil" className="w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-transform backdrop-blur-md">
            <span className="material-symbols-outlined text-slate-700">arrow_back</span>
          </Link>
          <h1 className="font-black text-slate-800 text-2xl">İlanı Düzenle</h1>
        </div>
      </div>

      <div className="px-5 animate-in fade-in duration-300">
        <div style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(16px)",
          borderRadius: "24px",
          border: "1px solid rgba(255,255,255,0.9)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.04)",
          padding: "24px",
        }}>

          <h2 className="text-lg font-black text-slate-800 mb-5">Temel Bilgiler</h2>

          <div className="mb-5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block pl-1">Otopark Fotoğrafları (Maks. 5)</span>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {photos.map((src, i) => (
                <div key={i} className="relative shrink-0">
                  <img src={src} alt={`foto-${i}`} className="w-20 h-20 object-cover rounded-xl border border-slate-200" />
                  <button type="button"
                    onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow"
                  >
                    <span className="material-symbols-outlined text-[12px] font-bold">close</span>
                  </button>
                </div>
              ))}
              {photos.length < 5 && (
                <label className="shrink-0 w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#0A66C2] hover:bg-blue-50 transition-all">
                  {photoLoading ? (
                    <span className="material-symbols-outlined text-[#0A66C2] animate-spin text-[24px]">refresh</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-slate-400 text-[24px]">add_photo_alternate</span>
                      <span className="text-[9px] font-bold text-slate-400 mt-0.5">EKLE</span>
                    </>
                  )}
                  <input type="file" accept="image/*" multiple className="hidden"
                    onChange={e => handlePhotoAdd(e.target.files)}
                  />
                </label>
              )}
            </div>
          </div>

          <label className="block mb-5">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block pl-1">İlan Başlığı</span>
             <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-700 focus:border-[#0A66C2] focus:ring-2 focus:ring-blue-100 transition-all outline-none" 
             />
          </label>

          <div className="grid grid-cols-2 gap-4 mb-5">
             <label className="block">
               <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block pl-1">Saatlik Ücret</span>
               <div className="relative">
                 <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 font-black text-lg text-slate-800 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all outline-none" 
                 />
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">₺</span>
               </div>
             </label>

             <label className="block">
               <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block pl-1">Otopark Tipi</span>
               <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-700 focus:border-[#0A66C2] focus:ring-2 focus:ring-blue-100 transition-all outline-none appearance-none">
                 <option value="acik">Açık Alan</option>
                 <option value="kapali">Kapalı Otopark</option>
               </select>
             </label>
          </div>

          <label className="block mb-6">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block pl-1">Açıklama</span>
             <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-sm text-slate-700 focus:border-[#0A66C2] focus:ring-2 focus:ring-blue-100 transition-all outline-none resize-none" 
             />
          </label>

          <h2 className="text-lg font-black text-slate-800 mb-4 pt-2 border-t border-slate-100">Özellikler (Olanaklar)</h2>
          
          <div className="space-y-3">
              <label className="flex items-center gap-3 p-3.5 border border-slate-100 rounded-xl bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                <input type="checkbox" checked={formData.hasCCTV} onChange={e => setFormData({...formData, hasCCTV: e.target.checked})} className="w-5 h-5 accent-[#0A66C2]" />
                <span className="font-bold text-sm text-slate-700 flex-1">Güvenlik Kamerası Var</span>
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                   <span className="material-symbols-outlined text-slate-400 text-[18px]">videocam</span>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3.5 border border-slate-100 rounded-xl bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                <input type="checkbox" checked={formData.hasEVCharger} onChange={e => setFormData({...formData, hasEVCharger: e.target.checked})} className="w-5 h-5 accent-[#0A66C2]" />
                <span className="font-bold text-sm text-slate-700 flex-1">Elektrikli Araç Şarjı Var</span>
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                   <span className="material-symbols-outlined text-slate-400 text-[18px]">ev_station</span>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3.5 border border-slate-100 rounded-xl bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                <input type="checkbox" checked={formData.isHandicapped} onChange={e => setFormData({...formData, isHandicapped: e.target.checked})} className="w-5 h-5 accent-[#0A66C2]" />
                <span className="font-bold text-sm text-slate-700 flex-1">Engelliye Uygun</span>
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                   <span className="material-symbols-outlined text-slate-400 text-[18px]">accessible</span>
                </div>
              </label>
          </div>
        </div>
      </div>

      <div className="px-5 mt-6 mb-10">
        <button onClick={handleSave} disabled={saving} 
           className="w-full py-4 rounded-xl font-black text-white text-lg transition-all active:scale-[0.98]"
           style={{
             background: saving ? "#cbd5e1" : "linear-gradient(135deg,#0A66C2,#1e88e5)",
             boxShadow: saving ? "none" : "0 8px 24px rgba(10,102,194,0.3)",
           }}>
          {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
        </button>
      </div>

    </div>
  );
}
