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
  user: {
    name: string;
  }
}

export default function SahipAnketPage({ params }: { params: Promise<{ rezervasyonId: string }> }) {
  const router = useRouter();
  const [rezervasyonId, setRezervasyonId] = useState("");
  const [rezervasyon, setRezervasyon] = useState<Rezervasyon | null>(null);

  // Form State
  const [tenantBehavior, setTenantBehavior] = useState<number>(0);
  const [leftClean, setLeftClean] = useState<boolean | null>(null);
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
    if (tenantBehavior === 0) {
      setError("Lütfen sürücü puanı verin ⭐️");
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
          filledBy: "owner",
          tenantBehavior,
          leftClean,
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
          <span className="material-symbols-outlined text-[#0A66C2]" style={{ fontSize: "56px", fontVariationSettings: "'FILL' 1" }}>verified</span>
        </div>
        <h1 className="text-3xl font-black text-slate-800 mb-2">Teşekkürler!</h1>
        <p className="text-slate-500 font-medium text-center mb-8 px-4">Değerlendirmeniz sisteme kaydedildi. Diğer ev sahiplerine yardımcı oldunuz.</p>
        
        <div style={{
          background: "linear-gradient(135deg,#0A66C2,#1e88e5)",
          borderRadius: "24px", padding: "24px", color: "white", textAlign: "center",
          boxShadow: "0 16px 40px rgba(10,102,194,0.30)", width: "100%", maxWidth: "340px",
          marginBottom: "30px",
        }}>
          <p className="text-blue-200 text-sm font-bold uppercase tracking-widest mb-1">KAZANILAN ÖDÜL</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-5xl font-black">+10</span>
            <span className="text-xl font-bold mt-2">Kredi</span>
          </div>
          <p className="text-white/70 text-[11px] mt-3">Anketi doldurduğunuz için teşekkür hediyesi!</p>
        </div>

        <Link
          href="/profil"
          style={{
            background: "white", color: "#0A66C2",
            borderRadius: "16px", padding: "16px 32px", fontSize: "16px", fontWeight: 800,
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          }}
        >
          İlanlarıma Dön
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
          <h1 className="font-black text-slate-800 text-lg">Müşteriyi Değerlendir</h1>
          <p className="text-slate-400 text-xs">Sürücü: {rezervasyon?.user?.name ?? "Yükleniyor..."}</p>
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
            <span className="material-symbols-outlined text-white" style={{ fontSize: "28px" }}>star</span>
          </div>
          <div>
            <h2 className="text-white font-extrabold text-[15px] mb-0.5">Sürücü Nasıldı?</h2>
            <p className="text-blue-100 text-[12px] font-medium leading-snug">Deneyiminizi paylaşarak puan kazanın ve topluluğa destek olun.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-5 space-y-4 relative z-10">
        
        {/* Rating */}
        <div className="bg-white/90 backdrop-blur-md rounded-[24px] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.04)] border border-white">
          <p className="text-center font-extrabold text-slate-800 text-[15px] mb-4">Genel Sürücü Puanı</p>
          <div className="flex justify-center gap-1">
            {[1,2,3,4,5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setTenantBehavior(star)}
                className="active:scale-90 transition-transform p-2"
              >
                <span className="material-symbols-outlined" style={{ 
                  fontSize: "36px", 
                  color: tenantBehavior >= star ? "#f59e0b" : "#e2e8f0",
                  fontVariationSettings: tenantBehavior >= star ? "'FILL' 1" : "'FILL' 0"
                }}>
                  star
                </span>
              </button>
            ))}
          </div>
          {tenantBehavior > 0 && (
            <p className="text-center text-amber-500 font-bold text-sm mt-2 animate-pulse">
              {["Çok Kötü","Kötü","İdare Eder","İyi","Harika"][tenantBehavior-1]}
            </p>
          )}
        </div>

        {/* Sorular */}
        <div className="bg-white/90 backdrop-blur-md rounded-[24px] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.04)] border border-white">
          <h3 className="font-extrabold text-slate-800 text-[14px] mb-3">Detaylı Değerlendirme</h3>
          <OptionRow 
            title="Temiz Bıraktı mı?" 
            desc="Garaj alanında herhangi bir çöp veya leke bıraktı mı?" 
            val={leftClean} setVal={setLeftClean} 
          />
        </div>

        {/* Yorum */}
        <div className="bg-white/90 backdrop-blur-md rounded-[24px] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.04)] border border-white">
          <h3 className="font-extrabold text-slate-800 text-[14px] mb-3">Eklemek İstedikleriniz (Opsiyonel)</h3>
          <textarea
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-[#0A66C2] focus:ring-4 focus:ring-blue-50 transition-all resize-none"
            rows={3}
            placeholder="Sürücü ile yaşadığınız sorun veya memnuniyetlerinizi yazabilirsiniz..."
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-sm font-bold border border-red-100 flex items-center gap-2">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full text-white font-extrabold text-[15px] py-4 rounded-2xl active:scale-[0.98] transition-transform flex items-center justify-center gap-2 mt-4"
          style={{
            background: "linear-gradient(135deg,#0A66C2,#1e88e5)",
            boxShadow: "0 8px 24px rgba(10,102,194,0.30)",
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? "Gönderiliyor..." : "Anketi Tamamla"}
          {!loading && <span className="material-symbols-outlined text-[20px]">send</span>}
        </button>
      </form>
    </div>
  );
}
