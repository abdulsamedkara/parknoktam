"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
}

export default function CuzdanPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState(true);

  // Kart modal state
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardForm, setCardForm] = useState({ id: "", cardName: "", cardNumber: "", expiry: "" });
  const [savingCard, setSavingCard] = useState(false);

  // Bakiye modal state
  const [showBalanceModal, setShowBalanceModal] = useState<"deposit" | "withdraw" | null>(null);
  const [balanceAmount, setBalanceAmount] = useState<number | "">("");
  const [processingBalance, setProcessingBalance] = useState(false);

  const { status } = useSession();
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
      fetch("/api/user/cards").then(res => res.json())
    ]).then(([profileData, cardsData]) => {
      setProfile(profileData);
      setCards(Array.isArray(cardsData) ? cardsData : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [status]);

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

  const openCardModal = (card?: SavedCard) => {
    if (card) {
      setCardForm({ id: card.id, cardName: card.cardName, cardNumber: "**** **** **** " + card.last4, expiry: card.expiry });
    } else {
      setCardForm({ id: "", cardName: "", cardNumber: "", expiry: "" });
    }
    setShowCardModal(true);
  };

  const handleSaveCard = async () => {
    const isEditing = cardForm.id !== "";
    const cleanNumber = cardForm.cardNumber.replace(/\s/g, "");
    if (!cardForm.cardName || (!isEditing && cleanNumber.length < 16) || !cardForm.expiry) {
      return toast.error("Lütfen tüm alanları geçerli şekilde doldurun.");
    }
    setSavingCard(true);
    try {
      const url = isEditing ? `/api/user/cards/${cardForm.id}` : "/api/user/cards";
      const method = isEditing ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardName: cardForm.cardName,
          last4: isEditing && cleanNumber.includes('*') ? cleanNumber.slice(-4) : cleanNumber.slice(-4),
          expiry: cardForm.expiry,
          isDefault: false
        })
      });
      if (res.ok) {
        const result = await res.json();
        if (isEditing) {
          setCards(cards.map(c => c.id === cardForm.id ? result.card || { id: cardForm.id, cardName: cardForm.cardName, last4: cleanNumber.slice(-4), expiry: cardForm.expiry, isDefault: false } : c));
          toast.success("Kart başarıyla güncellendi.");
        } else {
          setCards([result.card, ...cards]);
          toast.success("Kart başarıyla eklendi.");
        }
        setShowCardModal(false);
      } else {
        if (isEditing) {
          setCards(cards.map(c => c.id === cardForm.id ? { ...c, cardName: cardForm.cardName, expiry: cardForm.expiry } : c));
          toast.success("Kart bilgileri güncellendi.");
          setShowCardModal(false);
        } else {
          toast.error("Kart eklenemedi.");
        }
      }
    } catch {
      toast.error("Bağlantı hatası.");
    } finally {
      setSavingCard(false);
    }
  };

  const handleBalanceAction = async () => {
    if (!balanceAmount || balanceAmount <= 0) {
      return toast.error("Lütfen geçerli bir tutar girin.");
    }
    if (showBalanceModal === "withdraw" && profile!.creditBalance < balanceAmount) {
      return toast.error("Yetersiz bakiye.");
    }
    if (showBalanceModal === "deposit" && cards.length === 0) {
      return toast.error("Lütfen önce bir kart ekleyin.");
    }

    setProcessingBalance(true);
    try {
      const res = await fetch("/api/user/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: balanceAmount, action: showBalanceModal })
      });
      const data = await res.json();
      if (res.ok) {
        setProfile({ ...profile!, creditBalance: data.balance });
        toast.success(showBalanceModal === "deposit" ? "Bakiye başarıyla yüklendi." : "Para başarıyla çekildi.");
        setShowBalanceModal(null);
        setBalanceAmount("");
      } else {
        toast.error(data.error || "İşlem başarısız.");
      }
    } catch {
      toast.error("Bağlantı hatası.");
    } finally {
      setProcessingBalance(false);
    }
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
      {/* Header */}
      <div className="px-5 pt-14 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/profil" className="w-10 h-10 bg-white/80 rounded-full flex items-center justify-center text-slate-700 shadow-sm">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="font-black text-slate-800 text-xl">Ödeme Bilgilerim</h1>
        </div>
      </div>

      <div className="px-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div style={{
          background: "linear-gradient(135deg,#0A66C2,#1e88e5)", borderRadius: "24px", padding: "20px 24px", color: "white",
          boxShadow: "0 12px 32px rgba(10,102,194,0.3)", position: "relative", overflow: "hidden", marginBottom: "24px"
        }}>
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <p className="text-blue-200 text-xs font-bold mb-1 tracking-widest uppercase">GÜNCEL BAKİYE</p>
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

        <div className="flex gap-3 mb-6">
          <button onClick={() => setShowBalanceModal("withdraw")} className="flex-1 bg-white border border-slate-200 text-slate-700 py-3.5 rounded-xl font-bold text-sm shadow-sm active:scale-95 transition-transform">
            Para Çek
          </button>
          <button onClick={() => setShowBalanceModal("deposit")} className="flex-1 bg-[#0A66C2] text-white py-3.5 rounded-xl font-bold text-sm shadow-md shadow-blue-500/20 active:scale-95 transition-transform">
            Bakiye Yükle
          </button>
        </div>

        {/* Kartlarım */}
        <div className="flex items-center justify-between mb-4 mt-8">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0A66C2]">credit_card</span>
            Kayıtlı Kartlarım
          </h4>
          <button onClick={() => openCardModal()} className="text-[#0A66C2] text-[13px] font-bold bg-blue-50 px-3 py-1.5 rounded-full flex items-center gap-1 active:scale-95 transition-transform">
            <span className="material-symbols-outlined text-[16px]">add</span> Ekle
          </button>
        </div>

        <div className="flex flex-col gap-3 mb-8">
          {cards.length === 0 ? (
            <div className="bg-white/60 border border-slate-200 border-dashed rounded-xl p-5 text-center">
              <p className="text-slate-400 text-xs font-bold">Kayıtlı kart bulunmuyor.</p>
            </div>
          ) : (
            cards.map(c => (
              <div key={c.id} className="bg-white p-3.5 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[#0A66C2]">payments</span>
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-[13px] uppercase tracking-wide">{c.cardName}</p>
                    <p className="text-slate-500 text-[11px] font-mono tracking-widest">•••• {c.last4}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openCardModal(c)} className="w-8 h-8 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center active:bg-slate-200">
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                  <button onClick={() => handleDeleteCard(c.id)} className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center active:bg-red-200">
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <h4 className="font-bold text-slate-800 mb-4 text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[#0A66C2]">receipt_long</span>
          Geçmiş İşlemler
        </h4>
        <div className="flex flex-col gap-3">
          {[
            { id: 1, title: "Bakiye Yükleme", date: "Bugün, 14:30", amount: "+500 TL", type: "in" },
            { id: 2, title: "Park Ücreti (Kadıköy)", date: "Dün, 09:15", amount: "-120 TL", type: "out" },
            { id: 3, title: "Park Ücreti (Beşiktaş)", date: "12 Mayıs, 18:45", amount: "-85 TL", type: "out" },
          ].map(tx => (
            <div key={tx.id} className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === "in" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                  <span className="material-symbols-outlined text-[20px]">{tx.type === "in" ? "arrow_downward" : "arrow_upward"}</span>
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-[13px]">{tx.title}</p>
                  <p className="text-slate-400 text-[11px]">{tx.date}</p>
                </div>
              </div>
              <span className={`font-black text-[14px] ${tx.type === "in" ? "text-green-600" : "text-slate-800"}`}>{tx.amount}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Kart Ekle/Düzenle Modal */}
      {showCardModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-5" style={{ background: "rgba(10,37,64,0.4)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-xl text-slate-800">{cardForm.id ? "Kartı Düzenle" : "Yeni Kart Ekle"}</h3>
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
                  let v = e.target.value;
                  if(!cardForm.id) v = v.replace(/\D/g, "");
                  if (v.length > 0 && !cardForm.id) v = v.match(/.{1,4}/g)?.join(" ") || v;
                  setCardForm({ ...cardForm, cardNumber: v });
                }}
                disabled={!!cardForm.id}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0A66C2] font-mono tracking-widest text-slate-700 font-bold disabled:opacity-50" />
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

      {/* Bakiye Yükle/Çek Modal */}
      {showBalanceModal && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-5" style={{ background: "rgba(10,37,64,0.4)", backdropFilter: "blur(4px)" }} onClick={() => !processingBalance && setShowBalanceModal(null)}>
          <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-xl text-slate-800">{showBalanceModal === "deposit" ? "Bakiye Yükle" : "Para Çek"}</h3>
              <button onClick={() => !processingBalance && setShowBalanceModal(null)} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-slate-500">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">Tutar (TL)</label>
              <div className="relative mx-auto">
                <input type="number" placeholder="0" value={balanceAmount} onChange={e => setBalanceAmount(Number(e.target.value) || "")}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 text-center font-black text-3xl text-slate-800 outline-none focus:border-[#0A66C2] transition-colors" />
              </div>
              {showBalanceModal === "deposit" && (
                <p className="text-center text-xs text-slate-400 mt-3 font-medium">Bakiye, varsayılan kayıtlı kartınızdan tahsil edilecektir.</p>
              )}
              {showBalanceModal === "withdraw" && (
                <p className="text-center text-xs text-slate-400 mt-3 font-medium">Kazançlarınız, kayıtlı IBAN numaranıza 1-3 iş günü içinde aktarılır.</p>
              )}
            </div>

            <button onClick={handleBalanceAction} disabled={processingBalance} className="w-full py-4 bg-[#0A66C2] text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 disabled:opacity-50 text-lg">
              {processingBalance ? "İşleniyor..." : "Onayla"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
