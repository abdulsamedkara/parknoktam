"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface SavedCard {
  id: string;
  cardName: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
}

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
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState(true);

  // Sekme state
  const [activeTab, setActiveTab] = useState("bireysel"); // "bireysel" veya "isletme"

  // Araç modal state
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [vehicleForm, setVehicleForm] = useState({ plate: "", model: "", brand: "", color: "", type: "Sedan", isDefault: false });
  const [savingVehicle, setSavingVehicle] = useState(false);

  // Kart modal state
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardForm, setCardForm] = useState({ cardName: "", cardNumber: "", expiry: "" });
  const [savingCard, setSavingCard] = useState(false);


  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/giris");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    Promise.all([
      fetch("/api/user/credits").then(res => res.json()),
      fetch("/api/user/vehicles").then(res => res.json()),
      fetch("/api/panel/spots").then(res => res.json()),
      fetch("/api/user/cards").then(res => res.json())
    ]).then(([profileData, vehiclesData, spotsData, cardsData]) => {
      setProfile(profileData);
      setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
      setSpots(Array.isArray(spotsData) ? spotsData : []);
      setCards(Array.isArray(cardsData) ? cardsData : []);
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

  const handleDeleteCard = (id: string) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-slate-800">Bu kartı silmek istediğinize emin misiniz?</p>
        <div className="flex gap-2">
          <button className="flex-1 bg-red-500 text-white py-1.5 rounded-lg text-xs font-bold" onClick={async () => {
            toast.dismiss(t.id);
            try {
              const res = await fetch(`/api/user/cards/${id}`, { method: "DELETE" });
              if (res.ok) {
                setCards(cards.filter(c => c.id !== id));
                toast.success("Kart başarıyla silindi.");
              } else toast.error("Silme işlemi başarısız.");
            } catch (err) { toast.error("Bağlantı hatası."); }
          }}>Sil</button>
          <button className="flex-1 bg-slate-100 text-slate-600 py-1.5 rounded-lg text-xs font-bold" onClick={() => toast.dismiss(t.id)}>İptal</button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  const handleSaveCard = async () => {
    if (!cardForm.cardName || cardForm.cardNumber.replace(/\s/g, "").length < 16 || !cardForm.expiry) {
      return toast.error("Lütfen tüm alanları geçerli şekilde doldurun.");
    }
    setSavingCard(true);
    try {
      const res = await fetch("/api/user/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardName: cardForm.cardName,
          last4: cardForm.cardNumber.replace(/\s/g, "").slice(-4),
          expiry: cardForm.expiry,
          isDefault: false
        })
      });
      if (res.ok) {
        const result = await res.json();
        setCards([result.card, ...cards]);
        toast.success("Kart başarıyla eklendi.");
        setShowCardModal(false);
        setCardForm({ cardName: "", cardNumber: "", expiry: "" });
      } else {
        toast.error("Kart eklenemedi.");
      }
    } catch {
      toast.error("Bağlantı hatası.");
    } finally {
      setSavingCard(false);
    }
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
          <h1 className="font-black text-slate-800 text-2xl mb-0.5">Profil</h1>
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
        <div className="flex bg-slate-200/50 p-1 rounded-2xl relative">
          <div className="absolute inset-y-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-sm transition-all duration-300 ease-out" style={{ left: activeTab === "bireysel" ? '4px' : 'calc(50%)' }} />
          <button onClick={() => setActiveTab("bireysel")} className={`flex-1 relative z-10 py-2.5 text-sm font-black transition-colors ${activeTab === "bireysel" ? 'text-slate-800' : 'text-slate-400'}`}>Bireysel</button>
          <button onClick={() => setActiveTab("isletme")} className={`flex-1 relative z-10 py-2.5 text-sm font-black transition-colors ${activeTab === "isletme" ? 'text-slate-800' : 'text-slate-400'}`}>İşletme</button>
        </div>
      </div>

      {/* İçerik */}
      {activeTab === "bireysel" && (
        <div className="animate-in fade-in slide-in-from-right-2 duration-300">
          {/* Credit Box */}
          <div className="px-5 mb-6">
            <div style={{
              background: "linear-gradient(135deg,#0A66C2,#1e88e5)", borderRadius: "24px", padding: "20px 24px", color: "white",
              boxShadow: "0 12px 32px rgba(10,102,194,0.3)", position: "relative", overflow: "hidden"
            }}>
              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <p className="text-blue-200 text-xs font-bold mb-1 tracking-widest uppercase">GÜNCEL KREDİ BAKİYESİ</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black">{profile.creditBalance}</span>
                    <span className="text-lg font-bold opacity-80">TL</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white" style={{ fontSize: "24px", fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
                </div>
              </div>
              <span className="material-symbols-outlined absolute -right-6 -bottom-6 text-white/10" style={{ fontSize: "140px", fontVariationSettings: "'FILL' 1" }}>savings</span>
            </div>
          </div>

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

          {/* Kartlarım Bölümü */}
          <div className="px-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0A66C2]">credit_card</span>
                Ödeme Kartlarım
              </h2>
              <button onClick={() => setShowCardModal(true)} className="text-[#0A66C2] text-sm font-bold bg-blue-50 px-3 py-1 rounded-full flex items-center gap-1 active:scale-95 transition-transform">
                <span className="material-symbols-outlined text-[16px]">add</span> Ekle
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {cards.length === 0 ? (
                <div className="bg-white/60 border border-slate-200 border-dashed rounded-xl p-5 text-center">
                  <p className="text-slate-400 text-sm">Sistemde kayıtlı bir ödeme yönteminiz yok.</p>
                </div>
              ) : (
                cards.map(c => (
                  <div key={c.id} className="bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3 w-3/5">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[#0A66C2]">payments</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-slate-800 text-[14px] uppercase tracking-wide truncate">{c.cardName}</p>
                        <div className="flex items-center gap-1">
                          <p className="text-slate-500 text-[12px] font-mono tracking-widest truncate">•••• {c.last4}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => handleDeleteCard(c.id)} className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center active:bg-red-200">
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Hızlı Erişim Linkleri */}
          <div className="px-5 mb-6 flex flex-col gap-2.5">
            <Link href="/ara/favoriler" className="flex items-center gap-3 p-3.5 bg-white/80 rounded-2xl shadow-sm border border-white/90 active:scale-95 transition-transform">
              <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-400 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
              </div>
              <span className="font-bold text-slate-700 text-sm flex-1">Favorilerim</span>
              <span className="material-symbols-outlined text-slate-300 text-[18px]">chevron_right</span>
            </Link>

          </div>
        </div>
      )}

      {activeTab === "isletme" && (
        <div className="animate-in fade-in slide-in-from-left-2 duration-300">
          {/* Park Yerlerim Bölümü */}
          <div className="px-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0A66C2]">garage_home</span>
                Park İlanlarım
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
                  {spots.slice(0, 3).map(spot => (
                    <Link href="/panel/ilanlarim" key={spot.id} className="bg-white p-3.5 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm active:scale-95 transition-transform">
                      <div className="min-w-0 pr-2">
                        <p className="font-bold text-slate-800 text-[14px] truncate">{spot.title}</p>
                        <p className="text-slate-400 text-[11px] font-bold mt-0.5">TOPLAM KAZANÇ: <span className="text-green-600">₺{spot.stats.revenue}</span></p>
                      </div>
                      <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                    </Link>
                  ))}
                  {spots.length > 0 && (
                    <div className="flex gap-2">
                      <Link href="/panel/ilanlarim" className="flex-1 text-center py-2.5 bg-white border border-slate-200 font-bold text-slate-600 rounded-xl text-xs shadow-sm">
                        Tüm İlanlarım
                      </Link>
                      <Link href="/panel/kazanclar" className="flex-1 text-center py-2.5 bg-emerald-50 border border-emerald-100 font-bold text-emerald-600 rounded-xl text-xs shadow-sm flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">payments</span> Kazançlar
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
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

      {/* Kart Ekle Modal */}
      {showCardModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-5" style={{ background: "rgba(10,37,64,0.4)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-xl text-slate-800">Yeni Kart Ekle</h3>
              <button onClick={() => setShowCardModal(false)} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-slate-500">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <label className="block mb-4">
              <span className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Kart Üzerindeki İsim</span>
              <input type="text" placeholder="Örn: Samet Park" value={cardForm.cardName} onChange={e => setCardForm({ ...cardForm, cardName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0A66C2] font-semibold text-slate-700" />
            </label>

            <label className="block mb-4">
              <span className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Kart Numarası</span>
              <input type="text" placeholder="xxxx xxxx xxxx xxxx" maxLength={19}
                value={cardForm.cardNumber}
                onChange={e => {
                  let v = e.target.value.replace(/\D/g, "");
                  if (v.length > 0) v = v.match(/.{1,4}/g)?.join(" ") || v;
                  setCardForm({ ...cardForm, cardNumber: v });
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0A66C2] font-mono tracking-widest text-slate-700 font-bold" />
            </label>

            <div className="flex gap-4 mb-6">
              <label className="block flex-1">
                <span className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">SKT (AA/YY)</span>
                <input type="text" placeholder="12/28" maxLength={5}
                  value={cardForm.expiry}
                  onChange={e => {
                    let v = e.target.value.replace(/\D/g, "");
                    if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2, 4);
                    setCardForm({ ...cardForm, expiry: v });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0A66C2] font-mono font-bold text-slate-700" />
              </label>
              <label className="block w-24">
                <span className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">CVV</span>
                <input type="text" placeholder="123" maxLength={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0A66C2] font-mono font-bold text-slate-700" />
              </label>
            </div>

            <button onClick={handleSaveCard} disabled={savingCard} className="w-full py-4 bg-[#0A66C2] text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 disabled:opacity-50">
              {savingCard ? "Kaydediliyor..." : "Kartı Kaydet"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
