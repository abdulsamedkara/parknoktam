"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";

const LocationPickerMap = dynamic(() => import("@/components/LocationPickerMap"), { ssr: false });

export default function IlanEkleWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "bireysel",
    spotType: "acik",
    address: "",
    lat: "41.0151",
    lng: "28.9795",
    pricePerHour: "",
    hasCCTV: false,
    hasEVCharger: false,
    isHandicapped: false,
    totalCapacity: "1",
  });

  // Fotoğraf state — base64 URL dizisi
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoLoading, setPhotoLoading] = useState(false);

  const update = (key: string, value: any) => setFormData(prev => ({ ...prev, [key]: value }));

  const next = () => setStep(s => Math.min(s + 1, 4));
  const prev = () => setStep(s => Math.max(s - 1, 1));

  // Dosyayı canvas ile 800px genişliğe sıkıştır, base64 döndür
  function compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxW = 800;
          const scale = img.width > maxW ? maxW / img.width : 1;
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
        if (photos.length + newPhotos.length >= 5) break; // max 5 fotoğraf
        const b64 = await compressImage(file);
        newPhotos.push(b64);
      }
      setPhotos(prev => [...prev, ...newPhotos]);
    } finally {
      setPhotoLoading(false);
    }
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      const res = await fetch("/api/panel/spots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          photos: JSON.stringify(photos),  // base64 array → JSON string
        })
      });
      if (res.ok) {
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        toast.success("Tebrikler! İlanınız başarıyla yayınlandı.");
        setTimeout(() => router.push("/panel"), 2000);
      } else {
        toast.error("Bir hata oluştu.");
        setLoading(false);
      }
    } catch {
      toast.error("Bağlantı hatası.");
      setLoading(false);
    }
  }

  const totalSteps = 4;

  return (
    <div className="min-h-screen pb-[100px]" style={{ background: "linear-gradient(160deg,#e8f0fe 0%,#f0f5ff 40%,#fafbff 100%)" }}>
    <div className="px-5 pt-14 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-black text-slate-800 text-2xl">Yeni İlan Ekle</h1>
        <div className="text-slate-400 font-bold text-sm bg-slate-200 px-3 py-1 rounded-full">
          Adım {step}/{totalSteps}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-[#0A66C2]" : "bg-slate-200"}`} style={{ transition: "all 0.3s" }} />
        ))}
      </div>

      {/* Wizard Content */}
      <div style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(16px)",
        borderRadius: "24px",
        border: "1px solid rgba(255,255,255,0.9)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.04)",
        padding: "24px",
        minHeight: "360px",
      }}>

        {step === 1 && (
          <div className="animate-in slide-in-from-right-4 duration-300">
            <h2 className="text-lg font-black text-slate-800 mb-4">Temel Bilgiler</h2>
            
            <label className="block mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Otopark Başlığı</span>
              <input type="text" placeholder="Örn: Evimin Önü Uygun Alan" value={formData.title} onChange={e => update("title", e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0A66C2] focus:ring-2 focus:ring-blue-100 transition-all font-semibold text-sm text-slate-700" />
            </label>
            
            <label className="block mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Açıklama (Opsiyonel)</span>
              <textarea placeholder="Otopark alanı ile ilgili özellikler..." value={formData.description} onChange={e => update("description", e.target.value)} rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0A66C2] focus:ring-2 focus:ring-blue-100 transition-all font-semibold text-sm text-slate-700 resize-none" />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Kategori</span>
                <select value={formData.category} onChange={e => update("category", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0A66C2] focus:ring-2 focus:ring-blue-100 text-sm font-semibold text-slate-700">
                  <option value="bireysel">Bireysel</option>
                  <option value="isletme">İşletme</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Tip</span>
                <select value={formData.spotType} onChange={e => update("spotType", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0A66C2] focus:ring-2 focus:ring-blue-100 text-sm font-semibold text-slate-700">
                  <option value="acik">Açık Alan</option>
                  <option value="kapali">Kapalı Otopark</option>
                </select>
              </label>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in slide-in-from-right-4 duration-300">
            <h2 className="text-lg font-black text-slate-800 mb-4">Konum Belirleme</h2>

             <label className="block mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Açık Adres</span>
              <textarea placeholder="Sarıyer, İstanbul, Mahalle, Sokak detaylı yazın" value={formData.address} onChange={e => update("address", e.target.value)} rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0A66C2] focus:ring-2 focus:ring-blue-100 transition-all font-semibold text-sm text-slate-700 resize-none" />
            </label>

            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block mt-4">Haritadan Seç (İşaretçiyi Kaydır)</span>
            <div className="h-[200px] w-full rounded-xl overflow-hidden border border-slate-200 relative mb-4">
               <LocationPickerMap lat={parseFloat(formData.lat)} lng={parseFloat(formData.lng)} onChange={(lat, lng) => {
                  update("lat", lat.toFixed(6));
                  update("lng", lng.toFixed(6));
               }} />
            </div>
            
            <p className="text-xs text-center text-slate-400 bg-slate-50 border border-slate-100 p-2 rounded-lg font-mono">
              Konum: {formData.lat}, {formData.lng}
            </p>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in slide-in-from-right-4 duration-300">
            <h2 className="text-lg font-black text-slate-800 mb-4">Fotoğraf, Ücret ve Özellikler</h2>

            {/* Fotoğraf Yükleme */}
            <div className="mb-5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Otopark Fotoğrafları (Maks. 5)</span>
              
              <div className="flex gap-2 overflow-x-auto pb-1">
                {/* Mevcut fotoğraflar */}
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

                {/* Ekle butonu — max 5 değilse göster */}
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

              {photos.length === 0 && (
                <p className="text-[11px] text-slate-400 mt-2 font-medium">📸 En az 1 fotoğraf eklemek ilanınızın görünürlüğünü artırır.</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <label className="block">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Saatlik Ücret (₺)</span>
                <div className="relative">
                  <input type="number" placeholder="0" value={formData.pricePerHour} onChange={e => update("pricePerHour", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all font-black text-lg text-slate-800" />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">₺</span>
                </div>
              </label>

              <label className="block">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Kapasite (Araç)</span>
                <input type="number" placeholder="Örn: 15" value={formData.totalCapacity} onChange={e => update("totalCapacity", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0A66C2] focus:ring-2 focus:ring-blue-100 transition-all font-black text-lg text-slate-800" />
              </label>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl bg-slate-50">
                <input type="checkbox" checked={formData.hasCCTV} onChange={e => update("hasCCTV", e.target.checked)} className="w-5 h-5 accent-[#0A66C2]" />
                <span className="font-bold text-sm text-slate-700 flex-1">Güvenlik Kamerası Var</span>
                <span className="material-symbols-outlined text-slate-400">videocam</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl bg-slate-50">
                <input type="checkbox" checked={formData.hasEVCharger} onChange={e => update("hasEVCharger", e.target.checked)} className="w-5 h-5 accent-[#0A66C2]" />
                <span className="font-bold text-sm text-slate-700 flex-1">Elektrikli Araç Şarjı Var</span>
                <span className="material-symbols-outlined text-slate-400">ev_station</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl bg-slate-50">
                <input type="checkbox" checked={formData.isHandicapped} onChange={e => update("isHandicapped", e.target.checked)} className="w-5 h-5 accent-[#0A66C2]" />
                <span className="font-bold text-sm text-slate-700 flex-1">Engelliye Uygun</span>
                <span className="material-symbols-outlined text-slate-400">accessible</span>
              </label>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-in slide-in-from-right-4 duration-300">
            <h2 className="text-lg font-black text-slate-800 mb-4">Özet ve Yayınla</h2>

            {/* Fotoğraf Önizleme */}
            {photos.length > 0 && (
              <div className="mb-4">
                <div className="relative w-full h-36 rounded-xl overflow-hidden">
                  <img src={photos[0]} alt="Ana Fotoğraf" className="w-full h-full object-cover" />
                  {photos.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                      +{photos.length - 1} fotoğraf daha
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-6">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">KİMLİK</p>
              <p className="font-bold text-slate-800 text-sm mb-3">{formData.title || "Başlıksız İlan"}</p>
              
              <div className="h-px bg-slate-200 w-full mb-3"/>

              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">KONUM</p>
              <p className="font-semibold text-slate-600 text-sm mb-3">{formData.address || "Adres girilmedi"}</p>
              
              <div className="h-px bg-slate-200 w-full mb-3"/>

              <div className="flex justify-between items-center">
                <div>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">SAATLİK GETİRİ</p>
                   <p className="font-black text-green-600 text-xl">₺{formData.pricePerHour || "0"}</p>
                </div>
                <div className="text-right">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">KAPASİTE</p>
                   <p className="font-black text-slate-700 text-xl">{formData.totalCapacity} Araç</p>
                </div>
              </div>
            </div>

            {photos.length === 0 && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex gap-2 items-start mb-4">
                <span className="material-symbols-outlined text-amber-500 text-[18px] mt-0.5">photo_camera</span>
                <p className="text-[11px] text-amber-700 font-medium">Fotoğraf eklemediniz. İlanlar fotoğraflı olduğunda daha fazla ilgi çeker.</p>
              </div>
            )}

            <p className="text-xs text-center text-slate-500 font-medium">Bu ilanı yayınladığınızda kullanıcılar tarafından anında kiralanabilir hale gelecektir.</p>
          </div>
        )}

      </div>

      {/* Controls */}
      <div className="flex justify-between gap-4 mt-6">
        {step > 1 ? (
          <button onClick={prev} className="px-6 py-3 rounded-xl font-bold bg-white border border-slate-200 text-slate-600 shadow-sm transition hover:bg-slate-50">
            Geri
          </button>
        ) : (
          <div /> // placeholder for alignment
        )}

        {step < 4 ? (
          <button onClick={next} className="px-8 py-3 rounded-xl font-bold bg-[#0A2540] text-white shadow-lg shadow-slate-300/50 hover:opacity-90">
            İleri
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={loading} className="px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 hover:opacity-90">
            {loading ? "Yayınlanıyor..." : "İlanı Yayınla 🚀"}
          </button>
        )}
      </div>

    </div>
    </div>
  );
}
