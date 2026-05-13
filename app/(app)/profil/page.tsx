"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";



interface UserProfile {
  name: string;
  email: string;
  creditBalance: number;
  eDevletVerified: boolean;
}

interface Vehicle {
  id: string;
  plate: string;
  model: string;
  brand?: string;
  color?: string;
  type?: string;
  isDefault: boolean;
}

interface Spot {
  id: string;
  title: string;
  address: string;
  isActive: boolean;
  pricePerHour: number;
  stats: {
    revenue: number;
    reservationCount: number;
  };
}

export default function ProfilPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);

  // Sekme state
  const [activeTab, setActiveTab] = useState("surucu"); // "surucu" veya "sahip"

  // Araç modal state
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [vehicleForm, setVehicleForm] = useState({ plate: "", model: "", brand: "", color: "", type: "Sedan", isDefault: false });
  const [savingVehicle, setSavingVehicle] = useState(false);

  // Spot detail modal state
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/giris");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/user/profile")
      .then(res => res.json())
      .then(({ profile: profileData, vehicles: vehiclesData, spots: spotsData }) => {
        setProfile(profileData);
        setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
        setSpots(Array.isArray(spotsData) ? spotsData : []);
        setLoading(false);
      }).catch(() => setLoading(false));
  }, [status]);

  const handleSaveVehicle = async () => {
    if (!vehicleForm.plate || !vehicleForm.model) return toast.error("Lütfen plaka ve model giriniz.");
    setSavingVehicle(true);
    try {
      const isEditing = !!editingVehicleId;
      const url = isEditing ? `/api/user/vehicles/${editingVehicleId}` : "/api/user/vehicles";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vehicleForm)
      });
      if (res.ok) {
        const result = await res.json();
        if (isEditing) {
          setVehicles(vehicles.map(v => v.id === editingVehicleId ? result.vehicle : v));
          toast.success("Araç başarıyla güncellendi.");
        } else {
          setVehicles([result.vehicle, ...vehicles]);
          toast.success("Araç başarıyla eklendi.");
        }
        setShowVehicleModal(false);
      } else {
        toast.error("Satır işleminde hata oluştu.");
      }
    } catch (err) {
      toast.error("Bağlantı hatası.");
    } finally {
      setSavingVehicle(false);
    }
  };

  const handleDeleteVehicle = (id: string) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-slate-800">Aracı silmek istediğinize emin misiniz?</p>
        <div className="flex gap-2">
          <button className="flex-1 bg-red-500 text-white py-1.5 rounded-lg text-xs font-bold" onClick={async () => {
            toast.dismiss(t.id);
            try {
              const res = await fetch(`/api/user/vehicles/${id}`, { method: "DELETE" });
              if (res.ok) {
                setVehicles(vehicles.filter(v => v.id !== id));
                toast.success("Araç başarıyla silindi.");
              } else toast.error("Silme işlemi başarısız.");
            } catch (err) { toast.error("Silme işlemi başarısız."); }
          }}>Sil</button>
          <button className="flex-1 bg-slate-100 text-slate-600 py-1.5 rounded-lg text-xs font-bold" onClick={() => toast.dismiss(t.id)}>İptal</button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  const openVehicleModal = (v?: Vehicle) => {
    if (v) {
      setEditingVehicleId(v.id);
      setVehicleForm({ 
        plate: v.plate, 
        model: v.model, 
        brand: v.brand || "", 
        color: v.color || "", 
        type: v.type || "Sedan", 
        isDefault: v.isDefault 
      });
    } else {
      setEditingVehicleId(null);
      setVehicleForm({ plate: "", model: "", brand: "", color: "", type: "Sedan", isDefault: false });
    }
    setShowVehicleModal(true);
  };

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen pb-[100px]" style={{ background: "linear-gradient(160deg,#e8f0fe 0%,#f0f5ff 40%,#fafbff 100%)" }}>
        <span className="material-symbols-outlined text-[#0A66C2] animate-spin" style={{ fontSize: "40px" }}>refresh</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-[100px]" style={{ background: "linear-gradient(160deg,#e8f0fe 0%,#f0f5ff 40%,#fafbff 100%)" }}>

      {/* Header & Profil Info */}
      <div className="px-5 pt-14 pb-4 flex items-start justify-between">
        <div>
          <h1 className="font-black text-slate-800 text-2xl mb-0.5">Profil Bilgilerim</h1>
          <p className="text-slate-400 text-sm">Hesabını ve varlıklarını yönet</p>
        </div>
        <button onClick={() => signOut({ callbackUrl: '/giris' })} className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center active:scale-95 transition-transform" title="Sistemden Çıkış Yap">
          <span className="material-symbols-outlined text-[20px] font-bold">logout</span>
        </button>
      </div>

      <div className="px-5 mb-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div style={{
          background: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)",
          borderRadius: "24px", border: "1px solid rgba(255,255,255,0.9)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.06)", padding: "20px", display: "flex", alignItems: "center", gap: "16px",
        }}>
          <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-slate-400" style={{ fontSize: "32px", fontVariationSettings: "'FILL' 1" }}>person</span>
          </div>
          <div className="flex-1">
            <h2 className="font-black text-slate-800 text-lg flex items-center gap-1">
              {profile.name || "Kullanıcı"}
              {profile.eDevletVerified && (
                <div title="E-Devlet Onaylı Kullanıcı" className="flex items-center justify-center text-blue-500 ml-1">
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                </div>
              )}
            </h2>
            <p className="text-slate-500 text-[13px] mb-2">{profile.email}</p>
            
            {!profile.eDevletVerified && (
              <button 
                onClick={async () => {
                  toast.loading("E-Devlet sistemine bağlanılıyor...", { id: "edevlet" });
                  setTimeout(async () => {
                    const res = await fetch("/api/user/edevlet", { method: "POST" });
                    if(res.ok) {
                      setProfile({ ...profile, eDevletVerified: true });
                      toast.success("E-Devlet doğrulaması başarılı!", { id: "edevlet" });
                    } else {
                      toast.error("Doğrulama başarısız.", { id: "edevlet" });
                    }
                  }, 2000);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold border border-red-100 active:scale-95 transition-transform">
                <span className="material-symbols-outlined text-[14px]">gpp_maybe</span>
                E-Devlet ile Doğrula
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 mb-6">
        <p className="text-slate-500 text-xs mb-3 font-medium">Lütfen birini seçiniz</p>
        <div className="flex bg-slate-200/50 p-1 rounded-2xl relative">
          <div className="absolute inset-y-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-sm transition-all duration-300 ease-out" style={{ left: activeTab === "surucu" ? '4px' : 'calc(50%)' }} />
          <button onClick={() => setActiveTab("surucu")} className={`flex-1 relative z-10 py-2.5 text-sm font-black transition-colors ${activeTab === "surucu" ? 'text-slate-800' : 'text-slate-400'}`}>Sürücü</button>
          <button onClick={() => setActiveTab("sahip")} className={`flex-1 relative z-10 py-2.5 text-sm font-black transition-colors ${activeTab === "sahip" ? 'text-slate-800' : 'text-slate-400'}`}>Otopark Sahibi</button>
        </div>
      </div>

      {/* İçerik */}
      {activeTab === "surucu" && (
        <div className="animate-in fade-in slide-in-from-right-2 duration-300">
          {/* Araçlarım Bölümü */}
          <div className="px-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0A66C2]">directions_car</span>
                Araçlarım
              </h2>
              <button onClick={() => openVehicleModal()} className="text-[#0A66C2] text-sm font-bold bg-blue-50 px-3 py-1 rounded-full flex items-center gap-1 active:scale-95 transition-transform">
                <span className="material-symbols-outlined text-[16px]">add</span> Ekle
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {vehicles.length === 0 ? (
                <div className="bg-white/60 border border-slate-200 border-dashed rounded-xl p-5 text-center">
                  <p className="text-slate-400 text-sm">Henüz kayıtlı bir aracın yok.</p>
                </div>
              ) : (
                vehicles.map(v => (
                  <div key={v.id} className="bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3 w-3/5">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-slate-500">directions_car</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-slate-800 text-[14px] uppercase tracking-wide truncate">{v.plate}</p>
                        <div className="flex items-center gap-1">
                          <p className="text-slate-500 text-[12px] truncate">
                            {v.brand ? `${v.brand} ` : ""}{v.model} {v.color ? `(${v.color})` : ""} {v.type ? `- ${v.type}` : ""}
                          </p>
                          {v.isDefault && (
                            <span className="text-[9px] font-bold bg-blue-100 text-[#0A66C2] px-1 py-0.5 rounded">VARSAYILAN</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => openVehicleModal(v)} className="w-8 h-8 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center active:bg-slate-200">
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button onClick={() => handleDeleteVehicle(v.id)} className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center active:bg-red-200">
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Ödeme Bilgilerim Butonu */}
          <div className="px-5 mb-6">
            <Link 
              href="/profil/cuzdan"
              className="w-full bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between active:scale-[0.98] transition-transform block"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#0A66C2]" style={{ fontSize: "24px" }}>account_balance_wallet</span>
                </div>
                <div className="text-left">
                  <p className="font-black text-slate-800 text-[15px]">Ödeme Bilgilerim</p>
                  <p className="text-slate-500 text-[12px] font-medium">Cüzdan, kartlar ve geçmiş işlemler</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-300">chevron_right</span>
            </Link>
          </div>

        </div>
      )}

      {activeTab === "sahip" && (
        <div className="animate-in fade-in slide-in-from-left-2 duration-300">
          {/* Park Yerlerim Bölümü */}
          <div className="px-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0A66C2]">garage_home</span>
                Park Yerlerim
              </h2>
              <Link href="/panel/ilan-ekle" className="text-[#0A66C2] text-[13px] font-bold bg-blue-50 px-3 py-1.5 rounded-full flex items-center gap-1 active:scale-95 transition-transform">
                <span className="material-symbols-outlined text-[16px]">add</span> Yeni İlan
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              {spots.length === 0 ? (
                <div className="bg-white/60 border border-slate-200 border-dashed rounded-xl p-5 text-center">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="material-symbols-outlined text-[#0A66C2]">add_location_alt</span>
                  </div>
                  <p className="text-slate-500 text-sm font-medium mb-1">Boş duran park yerini kirala!</p>
                  <p className="text-slate-400 text-[11px] leading-tight">Yılda 25.000 TL'ye kadar kazanç sağlayabilirsin.</p>
                </div>
              ) : (
                <>
                  {spots.map(spot => (
                    <div key={spot.id} className="bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm cursor-pointer active:scale-[0.98] transition-transform" onClick={() => setSelectedSpot(spot)}>
                      <div className="flex items-center gap-3 w-3/5">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-slate-500">garage_home</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-slate-800 text-[14px] truncate">{spot.title}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Link href={`/panel/ilan-duzenle/${spot.id}`} onClick={e => e.stopPropagation()} className="w-8 h-8 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center active:bg-slate-200">
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </Link>
                        <button onClick={e => e.stopPropagation()} className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center active:bg-red-200">
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Ödeme Bilgilerim Butonu */}
          <div className="px-5 mb-6">
            <Link 
              href="/profil/cuzdan"
              className="w-full bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between active:scale-[0.98] transition-transform block"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#0A66C2]" style={{ fontSize: "24px" }}>account_balance_wallet</span>
                </div>
                <div className="text-left">
                  <p className="font-black text-slate-800 text-[15px]">Ödeme Bilgilerim</p>
                  <p className="text-slate-500 text-[12px] font-medium">Cüzdan, kartlar ve geçmiş işlemler</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-300">chevron_right</span>
            </Link>
          </div>

        </div>
      )}

      {/* Araç Ekle Modal */}
      {showVehicleModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-5" style={{ background: "rgba(10,37,64,0.4)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-xl text-slate-800">{editingVehicleId ? "Aracı Düzenle" : "Yeni Araç Ekle"}</h3>
              <button onClick={() => setShowVehicleModal(false)} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-slate-500">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <label className="block mb-4">
              <span className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Araç Plakası</span>
              <input type="text" placeholder="Örn: 34 ABC 123" value={vehicleForm.plate} onChange={e => setVehicleForm({ ...vehicleForm, plate: e.target.value.toUpperCase() })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0A66C2] font-black text-slate-700 uppercase" />
            </label>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <label className="block">
                <span className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Marka</span>
                <input type="text" placeholder="Örn: BMW" value={vehicleForm.brand} onChange={e => setVehicleForm({ ...vehicleForm, brand: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0A66C2] font-semibold text-sm text-slate-700" />
              </label>
              <label className="block">
                <span className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Model</span>
                <input type="text" placeholder="Örn: 320i" value={vehicleForm.model} onChange={e => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0A66C2] font-semibold text-sm text-slate-700" />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <label className="block">
                <span className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Renk</span>
                <input type="text" placeholder="Örn: Siyah" value={vehicleForm.color} onChange={e => setVehicleForm({ ...vehicleForm, color: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0A66C2] font-semibold text-sm text-slate-700" />
              </label>
              <label className="block">
                <span className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Tip</span>
                <select value={vehicleForm.type} onChange={e => setVehicleForm({ ...vehicleForm, type: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0A66C2] font-semibold text-sm text-slate-700 appearance-none">
                  <option value="Sedan">Sedan</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="SUV">SUV</option>
                  <option value="Motosiklet">Motosiklet</option>
                  <option value="Ticari">Ticari</option>
                </select>
              </label>
            </div>

            <label className="flex items-center gap-3 mb-6 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <input type="checkbox" checked={vehicleForm.isDefault} onChange={e => setVehicleForm({ ...vehicleForm, isDefault: e.target.checked })} className="w-5 h-5 accent-[#0A66C2]" />
              <span className="text-sm font-semibold text-slate-700">Varsayılan Aracım Yap</span>
            </label>

            <button onClick={handleSaveVehicle} disabled={savingVehicle} className="w-full py-4 bg-[#0A66C2] text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 disabled:opacity-50">
              {savingVehicle ? "Kaydediliyor..." : "Aracı Kaydet"}
            </button>
          </div>
        </div>
      )}



      {/* Spot Detail Modal */}
      {selectedSpot && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-5" style={{ background: "rgba(10,37,64,0.4)", backdropFilter: "blur(4px)" }} onClick={() => setSelectedSpot(null)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-xl text-slate-800">İlan Detayı</h3>
              <button onClick={() => setSelectedSpot(null)} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-slate-500">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
               {selectedSpot.photos && JSON.parse(selectedSpot.photos).length > 0 ? (
                 <img src={JSON.parse(selectedSpot.photos)[0]} alt={selectedSpot.title} className="w-16 h-16 rounded-2xl object-cover shrink-0" />
               ) : (
                 <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
                   <span className="material-symbols-outlined text-[#0A66C2] text-3xl">garage_home</span>
                 </div>
               )}
               <div className="min-w-0">
                 <h4 className="font-black text-slate-800 text-lg leading-tight truncate">{selectedSpot.title}</h4>
                 <p className="text-slate-500 text-xs mt-1 leading-snug truncate">{selectedSpot.address}</p>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
               <div className="bg-slate-50 rounded-2xl p-4">
                 <p className="text-slate-400 text-xs font-bold mb-1">KAZANÇ</p>
                 <p className="font-black text-slate-800 text-lg text-green-600">₺{selectedSpot.stats.revenue}</p>
               </div>
               <div className="bg-slate-50 rounded-2xl p-4">
                 <p className="text-slate-400 text-xs font-bold mb-1">REZERVASYON</p>
                 <p className="font-black text-slate-800 text-lg">{selectedSpot.stats.reservationCount}</p>
               </div>
               <div className="bg-slate-50 rounded-2xl p-4 col-span-2">
                 <p className="text-slate-400 text-xs font-bold mb-1">SAATLİK ÜCRET</p>
                 <p className="font-black text-slate-800 text-lg">₺{selectedSpot.pricePerHour}</p>
               </div>
            </div>

            <Link href={`/panel/ilan-duzenle/${selectedSpot.id}`} className="w-full py-4 bg-[#0A66C2] text-white rounded-xl font-bold flex justify-center items-center gap-2 shadow-lg shadow-blue-500/30">
              <span className="material-symbols-outlined text-[20px]">edit</span>
              İlanı Düzenle
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
