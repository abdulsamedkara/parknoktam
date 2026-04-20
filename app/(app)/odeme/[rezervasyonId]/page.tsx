"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface SavedCard {
  id: string;
  cardName: string;
  last4: string;
  expiry: string;
}

interface Rezervasyon {
  id: string;
  totalPrice: number;
  startDateTime: string;
  endDateTime: string;
  vehiclePlate: string;
  vehicleModel: string;
  spot: {
    title: string;
    address: string;
  };
}

function CardInput({ label, placeholder, value, onChange, maxLength, inputMode }: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
  inputMode?: "numeric" | "text";
}) {
  return (
    <div className="py-3 px-4">
      <p className="text-[10px] font-bold text-slate-400 mb-1">{label}</p>
      <input
        type="text"
        inputMode={inputMode ?? "text"}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        maxLength={maxLength}
        className="w-full bg-transparent text-slate-800 font-bold text-[15px] outline-none placeholder-slate-300"
      />
    </div>
  );
}

export default function OdemePage({ params }: { params: Promise<{ rezervasyonId: string }> }) {
  const router = useRouter();
  const [rezervasyonId, setRezervasyonId] = useState("");
  const [rezervasyon, setRezservasyon] = useState<Rezervasyon | null>(null);

  // Kart form state
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [saveCard, setSaveCard] = useState(false);

  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    params.then(p => {
      setRezervasyonId(p.rezervasyonId);
      fetch(`/api/rezervasyon/${p.rezervasyonId}`)
        .then(r => r.json())
        .then(d => setRezservasyon(d));
    });

    fetch("/api/user/cards")
      .then(r => r.json())
      .then(d => {
        if(Array.isArray(d) && d.length > 0) {
          setSavedCards(d);
          setSelectedCardId(d[0].id); // İlk kartı seçili yap
        }
      });
  }, [params]);

  // Kart numarası formatlama: her 4 hanede boşluk
  function formatCardNumber(val: string) {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.match(/.{1,4}/g)?.join(" ") ?? digits;
  }

  // Tarih formatlama: MM/YY
  function formatExpiry(val: string) {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    let finalCardLast4 = "";
    
    if (selectedCardId) {
      const c = savedCards.find(x => x.id === selectedCardId);
      if (!c) return toast.error("Seçili kart bulunamadı.");
      finalCardLast4 = c.last4;
    } else {
      if (!cardName || cardNumber.replace(/\s/g, "").length < 16 || !expiry || cvv.length < 3) {
        toast.error("Lütfen tüm kart bilgilerini eksiksiz girin.");
        return;
      }
      finalCardLast4 = cardNumber.replace(/\s/g, "").slice(-4);
    }

    setLoading(true);

    try {
      if (!selectedCardId && saveCard) {
        await fetch("/api/user/cards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cardName, last4: finalCardLast4, expiry, isDefault: false })
        });
      }

      const res = await fetch("/api/odeme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rezervasyonId,
          cardLast4: finalCardLast4,
          method: "CARD_CREDIT",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Ödeme başarısız.");
        setLoading(false);
        return;
      }

      setShowSuccess(true);
      setTimeout(() => {
        router.push(`/bilet/${rezervasyonId}`);
      }, 2500);
    } catch {
      toast.error("Sunucu hatası. Tekrar deneyin.");
      setLoading(false);
    }
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("tr-TR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

  if (showSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-5 animate-in fade-in duration-500" style={{ background: "linear-gradient(160deg,#e8f0fe 0%,#f0f5ff 40%,#fafbff 100%)" }}>
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-500/30 animate-bounce">
          <span className="material-symbols-outlined text-white" style={{ fontSize: "56px", fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </div>
        <h2 className="font-black text-slate-800 text-2xl mb-2 text-center">Ödeme İşlemi Başarılı!</h2>
        <p className="text-slate-500 text-sm font-semibold text-center mb-8">Dijital biletiniz oluşturuldu.</p>
        <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-full font-bold text-xs animate-pulse">
          <span className="material-symbols-outlined text-[16px]">hourglass_empty</span> Yönlendiriliyorsunuz...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-[120px]" style={{ background: "linear-gradient(160deg,#e8f0fe 0%,#f0f5ff 40%,#fafbff 100%)" }}>

      {/* Header */}
      <div className="px-5 pt-14 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-[#0A66C2]" style={{ fontSize: "22px" }}>payment</span>
          <h1 className="font-black text-slate-800 text-xl">Ödeme</h1>
        </div>
        <p className="text-slate-400 text-sm">Güvenli simülasyon ödeme ekranı</p>
      </div>

      {/* Reservation Summary */}
      {rezervasyon && (
        <div className="px-5 mb-5">
          <div style={{
            background: "rgba(255,255,255,0.82)",
            backdropFilter: "blur(16px)",
            borderRadius: "20px",
            border: "1px solid rgba(255,255,255,0.9)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)",
            padding: "18px",
          }}>
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 min-w-0 mr-3">
                <p className="font-bold text-slate-800 text-sm truncate">{rezervasyon.spot.title}</p>
                <p className="text-slate-400 text-xs mt-0.5">{formatDate(rezervasyon.startDateTime)} → {formatDate(rezervasyon.endDateTime)}</p>
              </div>
              <div style={{
                background: "linear-gradient(135deg,#0A66C2,#1e88e5)",
                borderRadius: "12px",
                padding: "8px 14px",
                textAlign: "center",
                flexShrink: 0,
              }}>
                <span className="text-white font-black text-xl">₺{rezervasyon.totalPrice}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
              <span className="material-symbols-outlined text-slate-400" style={{ fontSize: "16px" }}>directions_car</span>
              <span className="text-slate-600 text-xs font-semibold">
                {rezervasyon.vehiclePlate} · {rezervasyon.vehicleModel}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Card Form */}
      <form onSubmit={handlePay}>
        <div className="px-5 mb-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pl-1">💳 Ödeme Yöntemi</p>

          {savedCards.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-4 snap-x hide-scrollbar mb-2">
              <div 
                onClick={() => setSelectedCardId(null)}
                className={`snap-center shrink-0 border-2 rounded-2xl p-4 w-[160px] flex flex-col justify-center gap-2 items-center transition cursor-pointer ${selectedCardId === null ? "border-[#0A66C2] bg-blue-50" : "border-slate-100 bg-white"}`}
              >
                <span className="material-symbols-outlined text-[#0A66C2]">add_card</span>
                <span className="text-xs font-bold text-slate-700">Yeni Kart</span>
              </div>
              {savedCards.map(c => (
                <div 
                  key={c.id}
                  onClick={() => setSelectedCardId(c.id)}
                  className={`snap-center shrink-0 border-2 rounded-2xl p-4 w-[160px] transition cursor-pointer ${selectedCardId === c.id ? "border-[#0A66C2] bg-blue-50" : "border-slate-100 bg-white"}`}
                >
                  <p className="font-bold text-slate-800 text-sm mb-1">{c.cardName}</p>
                  <p className="text-xs text-slate-400 font-mono tracking-widest">•••• {c.last4}</p>
                  <p className="text-[10px] text-slate-400 mt-2 font-semibold">SKT: {c.expiry}</p>
                </div>
              ))}
            </div>
          )}

          {!selectedCardId && (
            <>

          {/* Card visual preview */}
          <div style={{
            background: "linear-gradient(135deg,#1a237e 0%,#0A66C2 60%,#1e88e5 100%)",
            borderRadius: "20px",
            padding: "24px",
            marginBottom: "12px",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 16px 40px rgba(10,102,194,0.35)",
          }}>
            <div className="flex justify-between items-start mb-8">
              <span className="text-white/60 text-xs font-bold tracking-widest">PARK NOKTAM</span>
              <div style={{ width: 40, height: 26, borderRadius: 6, background: "rgba(255,255,255,0.25)" }} />
            </div>
            <p className="text-white font-mono font-bold text-xl tracking-widest mb-6">
              {cardNumber || "•••• •••• •••• ••••"}
            </p>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-white/50 text-[9px] mb-0.5">KART SAHİBİ</p>
                <p className="text-white font-bold text-sm tracking-wide">{cardName || "AD SOYAD"}</p>
              </div>
              <div>
                <p className="text-white/50 text-[9px] mb-0.5">SON KUL.</p>
                <p className="text-white font-bold text-sm">{expiry || "MM/YY"}</p>
              </div>
            </div>
            {/* deco */}
            <div style={{
              position: "absolute", right: -30, top: -30,
              width: 140, height: 140, borderRadius: "50%",
              background: "rgba(255,255,255,0.07)",
            }} />
          </div>

          {/* Input fields */}
          <div style={{
            background: "rgba(255,255,255,0.82)",
            backdropFilter: "blur(16px)",
            borderRadius: "18px",
            border: "1px solid rgba(255,255,255,0.9)",
            boxShadow: "0 6px 20px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,1)",
            overflow: "hidden",
          }}>
            <CardInput label="KART SAHİBİ" placeholder="Ad Soyad" value={cardName} onChange={setCardName} />
            <div className="border-t border-slate-100">
              <CardInput
                label="KART NUMARASI"
                placeholder="0000 0000 0000 0000"
                value={cardNumber}
                inputMode="numeric"
                onChange={v => setCardNumber(formatCardNumber(v))}
              />
            </div>
            <div className="grid grid-cols-2 border-t border-slate-100">
              <div className="border-r border-slate-100">
                <CardInput
                  label="SON KULLANMA"
                  placeholder="MM/YY"
                  value={expiry}
                  inputMode="numeric"
                  onChange={v => setExpiry(formatExpiry(v))}
                  maxLength={5}
                />
              </div>
              <CardInput
                label="CVV"
                placeholder="•••"
                value={cvv}
                inputMode="numeric"
                onChange={v => setCvv(v.replace(/\D/g, "").slice(0, 4))}
                maxLength={4}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between p-4 border border-slate-100 bg-slate-50/50 rounded-xl cursor-pointer" onClick={() => setSaveCard(!saveCard)}>
             <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400 text-[18px]">verified_user</span>
                Kartımı sonraki alışverişlerim için kaydet
             </span>
             <input type="checkbox" checked={saveCard} readOnly className="w-5 h-5 accent-[#0A66C2] pointer-events-none" />
          </div>

          </>
          )}
        </div>

        {/* Pay button */}
        <div className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-4" style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.6)",
          zIndex: 1500,
        }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: loading ? "#cbd5e1" : "linear-gradient(135deg,#0A66C2,#1e88e5)",
              color: "white",
              border: "none",
              padding: "16px",
              borderRadius: "18px",
              fontWeight: 800,
              fontSize: "16px",
              boxShadow: loading ? "none" : "0 8px 24px rgba(10,102,194,0.35)",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>lock</span>
            {loading ? "İşleniyor..." : `Güvenli Öde  ₺${rezervasyon?.totalPrice ?? ""}`}
          </button>
          <p className="text-center text-slate-400 text-[10px] font-medium mt-2">🔒 Bu bir simülasyon ödemesidir. Gerçek ödeme alınmaz.</p>
        </div>
      </form>
    </div>
  );
}
