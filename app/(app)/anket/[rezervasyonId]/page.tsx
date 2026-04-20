"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";

interface Rezervasyon {
  id: string;
  spot: {
    title: string;
  };
}

export default function AnketPage({ params }: { params: Promise<{ rezervasyonId: string }> }) {
  const router = useRouter();
  const [rezervasyonId, setRezervasyonId] = useState("");
  const [rezervasyon, setRezervasyon] = useState<Rezervasyon | null>(null);

  // Form State
  const [overallRating, setOverallRating] = useState<number>(0);
  const [hadSunExposure, setHadSunExposure] = useState<boolean | null>(null);
  const [hadDustIssue, setHadDustIssue] = useState<boolean | null>(null);
  const [hadMoistureIssue, setHadMoistureIssue] = useState<boolean | null>(null);
  const [easyAccess, setEasyAccess] = useState<boolean | null>(null);
  const [feltSafe, setFeltSafe] = useState<boolean | null>(null);
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    params.then(p => {
      setRezervasyonId(p.rezervasyonId);
      // Rezervasyon bilgisini al
      fetch(`/api/rezervasyon/${p.rezervasyonId}`)
        .then(r => r.json())
        .then(d => setRezervasyon(d))
        .catch(() => {});
    });
  }, [params]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (overallRating === 0) {
      setError("Lütfen en azından genel bir puan verin ⭐️");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/anket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservationId: rezervasyonId,
          overallRating,
          hadSunExposure,
          hadDustIssue,
          hadMoistureIssue,
          easyAccess,
          feltSafe,
          comment
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Bir hata oluştu");
        return;
      }

      setSuccess(true);
      triggerConfetti();
    } catch {
      setError("Sunucu hatası.");
    } finally {
      setLoading(false);
    }
  }

  function triggerConfetti() {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults, particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults, particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: "linear-gradient(160deg,#e8f0fe 0%,#f0f5ff 40%,#fafbff 100%)" }}>
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(10,102,194,0.3)] mb-6 animate-bounce">
          <span className="material-symbols-outlined text-[#0A66C2]" style={{ fontSize: "56px", fontVariationSettings: "'FILL' 1" }}>redeem</span>
        </div>
        <h1 className="text-3xl font-black text-slate-800 mb-2">Harika!</h1>
        <p className="text-slate-500 font-medium text-center mb-8 px-4">Geri bildirimin otoparklarımızı daha iyi yapmamıza yardımcı olacak.</p>
        
        <div style={{
          background: "linear-gradient(135deg,#0A66C2,#1e88e5)",
          borderRadius: "24px", padding: "24px", color: "white", textAlign: "center",
          boxShadow: "0 16px 40px rgba(10,102,194,0.30)", width: "100%", maxWidth: "340px",
          marginBottom: "30px",
        }}>
          <p className="text-blue-200 text-sm font-bold uppercase tracking-widest mb-1">KAZANILAN ÖDÜL</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-5xl font-black">+20</span>
            <span className="text-xl font-bold mt-2">Kredi</span>
          </div>
          <p className="text-white/70 text-[11px] mt-3">Sonraki park kiralama işleminde 20 TL indirim!</p>
        </div>

        <Link
          href="/rezervasyonlarim"
          style={{
            background: "white", color: "#0A66C2",
            borderRadius: "16px", padding: "16px 32px", fontSize: "16px", fontWeight: 800,
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          }}
        >
          Biletlerime Dön
        </Link>
      </div>
    );
  }

  // Soru Bloğu Componenti
  const OptionRow = ({ title, desc, val, setVal }: { title: string, desc: string, val: boolean | null, setVal: (v: boolean) => void }) => (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div className="pr-4">
        <p className="text-[13px] font-bold text-slate-700">{title}</p>
        <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{desc}</p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button type="button" onClick={() => setVal(true)} style={{
            background: val === true ? "rgba(16,185,129,0.15)" : "#f1f5f9",
            color: val === true ? "#10b981" : "#94a3b8",
            width: 40, height: 40, borderRadius: "12px", fontSize: "12px", fontWeight: 800,
            transition: "all 0.2s"
          }}>
          <span className="material-symbols-outlined absolute opacity-0" style={{ fontSize: "0px" }}>thumb_up</span>
          Evet
        </button>
        <button type="button" onClick={() => setVal(false)} style={{
            background: val === false ? "rgba(239,68,68,0.15)" : "#f1f5f9",
            color: val === false ? "#ef4444" : "#94a3b8",
            width: 40, height: 40, borderRadius: "12px", fontSize: "12px", fontWeight: 800,
            transition: "all 0.2s"
          }}>
          Hayır
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-[100px]" style={{ background: "linear-gradient(160deg,#e8f0fe 0%,#f0f5ff 40%,#fafbff 100%)" }}>

      {/* Header */}
      <div className="flex items-center px-5 pt-12 pb-4 gap-3">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-sm active:scale-90 transition-transform">
          <span className="material-symbols-outlined text-slate-700" style={{ fontSize: "22px" }}>close</span>
        </button>
        <div>
          <h1 className="font-black text-slate-800 text-lg">Deneyimini Puanla</h1>
          <p className="text-slate-400 text-xs">+{rezervasyon?.spot.title ?? "Yükleniyor..."}</p>
        </div>
      </div>

      {/* Intro Banner */}
      <div className="px-5 mb-5 relative">
        <div style={{
          background: "linear-gradient(135deg,#0A66C2,#1e88e5)",
          borderRadius: "20px", padding: "16px",
          display: "flex", alignItems: "center", gap: "16px",
          boxShadow: "0 12px 32px rgba(10,102,194,0.25)"
        }}>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-white" style={{ fontSize: "28px" }}>savings</span>
          </div>
          <div>
            <p className="text-white font-bold text-[14px]">20 Kredi kazan!</p>
            <p className="text-blue-100 text-[11px] leading-snug mt-0.5">Anketi doldurarak sonraki park işlemine 20 TL anında indirim kazan.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-5">
        
        {/* Rating Stars */}
        <section className="mb-6 flex flex-col items-center py-4">
          <p className="text-[13px] font-bold text-slate-500 mb-3 text-center">Genel olarak park yerinden memnun kaldın mı?</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setOverallRating(star)}
                style={{
                  color: overallRating >= star ? "#f59e0b" : "#cbd5e1",
                  transform: overallRating === star ? "scale(1.15)" : "scale(1)",
                  transition: "all 0.2s"
                }}
              >
                <span className="material-symbols-outlined" style={{
                  fontSize: "44px",
                  fontVariationSettings: overallRating >= star ? "'FILL' 1" : "'FILL' 0"
                }}>star</span>
              </button>
            ))}
          </div>
        </section>

        {/* Detailed Questions */}
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">📋 Detaylı Geri Bildirim</p>
        <div className="mb-5" style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(16px)",
          borderRadius: "20px",
          border: "1px solid rgba(255,255,255,0.9)",
          boxShadow: "0 6px 20px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,1)",
          padding: "8px 16px"
        }}>
          <OptionRow 
            title="Giriş / Çıkış" 
            desc="Otoparka giriş ve çıkış rahat mıydı?"
            val={easyAccess} setVal={setEasyAccess} 
          />
          <OptionRow 
            title="Güvenlik" 
            desc="Aracını burada güvende hissettin mi?"
            val={feltSafe} setVal={setFeltSafe} 
          />
          <OptionRow 
            title="Güneş Durumu" 
            desc="Aracın direkt olarak kavurucu güneşe maruz kaldı mı?"
            val={hadSunExposure} setVal={setHadSunExposure} 
          />
          <OptionRow 
            title="Toz Durumu" 
            desc="Park edildiği yerde aşırı tozlanma oldu mu?"
            val={hadDustIssue} setVal={setHadDustIssue} 
          />
          <OptionRow 
            title="Nem Durumu" 
            desc="Kapalı alandaysa nem, rutubet sorunu var mıydı?"
            val={hadMoistureIssue} setVal={setHadMoistureIssue} 
          />
        </div>

        {/* Comment */}
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">💬 Ek Notlar (Opsiyonel)</p>
        <div className="mb-4">
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Başkalarının bilmesi gereken bir şey var mı?"
            className="w-full resize-none outline-none font-medium text-slate-700 text-sm placeholder-slate-400 transition-all focus:border-blue-400 focus:bg-white"
            style={{
              background: "rgba(255,255,255,0.6)",
              backdropFilter: "blur(8px)",
              borderRadius: "16px",
              padding: "16px",
              border: "1px solid rgba(255,255,255,0.8)",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
            }}
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm font-semibold text-center mb-4">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || overallRating === 0}
          className="w-full shadow-lg flex items-center justify-center transition-all"
          style={{
            background: overallRating > 0 ? "#10b981" : "#cbd5e1",
            color: "white",
            padding: "18px",
            borderRadius: "18px",
            fontWeight: 800,
            fontSize: "16px",
            boxShadow: overallRating > 0 ? "0 8px 24px rgba(16,185,129,0.35)" : "none",
            cursor: overallRating > 0 ? "pointer" : "not-allowed",
          }}
        >
          {loading ? "Gönderiliyor..." : "Anketi Tamamla"}
        </button>

      </form>
    </div>
  );
}
