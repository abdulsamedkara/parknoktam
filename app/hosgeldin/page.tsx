"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const slides = [
  {
    id: "discover",
    blob1: "#BFDBFE", // blue-200
    blob2: "#C7D2FE", // indigo-200
    blob3: "#BAE6FD", // sky-200
    primary: "#0A66C2",
    icon: "map",
    step: "01",
    subtitle: "PARK NOKTAM",
    title: "Şehrin En Akıllı\nPark Uygulaması",
    desc: "Rize'deki tüm otoparkları ve şahıs garajlarını tek ekranda gör. Dakikalarca yer aramak yerine saniyeler içinde yerini bul.",
    chips: ["🗺️ Canlı Harita", "💰 Fiyat Karşılaştırma", "📍 6+ Park Noktası"],
  },
  {
    id: "reserve",
    blob1: "#C7D2FE", // indigo-200
    blob2: "#E9D5FF", // purple-200
    blob3: "#A7F3D0", // emerald-200
    primary: "#6D28D9",
    icon: "touch_app",
    step: "02",
    subtitle: "NASIL ÇALIŞIR?",
    title: "Gelmeden Önce\nYerini Garantile",
    desc: "Sadece 3 adım: Otoparkı seç, saatini belirle ve öde. QR kodlu dijital biletin hazır. Nakit derdi veya sıra bekleme yok.",
    chips: ["⚡ 30 Sn. İşlem", "📱 QR Bilet", "✅ Temassız Giriş"],
  },
  {
    id: "earn",
    blob1: "#A7F3D0", // emerald-200
    blob2: "#BAE6FD", // sky-200
    blob3: "#FEF08A", // yellow-200
    primary: "#059669",
    icon: "real_estate_agent",
    step: "03",
    subtitle: "GELİR KAPISI",
    title: "Garajını Kirala,\nKazanç Sağla",
    desc: "Kullanmadığınız garajınızı veya özel park yerinizi uygulamaya ekleyin. Siz evde dinlenirken park yeriniz size para kazandırsın.",
    chips: ["🏠 Ücretsiz İlan", "💸 Kendin Fiyatla", "💳 Güvenli Ödeme"],
  },
  {
    id: "rewards",
    blob1: "#FED7AA", // orange-200
    blob2: "#FECACA", // red-200
    blob3: "#FDE047", // yellow-300
    primary: "#EA580C",
    icon: "stars",
    step: "04",
    subtitle: "AVANTAJLAR",
    title: "Park Ettikçe\nKredi Kazan",
    desc: "Her rezervasyondan sonra anket doldurarak uygulama kredisi kazanın. Biriken kredilerle bir sonraki parkınızı bedavaya getirin!",
    chips: ["🎁 Anket Ödülü", "⭐ Sadakat Puanı", "🎉 İndirimler"],
  },
];

export default function HosgeldinPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const slide = slides[current];
  const isLast = current === slides.length - 1;

  const handleNext = () => {
    if (transitioning) return;
    if (isLast) {
      router.push("/ana-sayfa");
      return;
    }
    setTransitioning(true);
    setTimeout(() => {
      setCurrent((c) => c + 1);
      setTransitioning(false);
    }, 300); // 300ms fade transition
  };

  const handleSkip = () => router.push("/ana-sayfa");

  if (!mounted) return null;

  return (
    <>
      <style>{`
        @keyframes blobFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -30px) scale(1.1); }
        }
        @keyframes blobFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1.1); }
          50% { transform: translate(-30px, 20px) scale(0.95); }
        }
        @keyframes blobFloat3 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, 20px) scale(1.05); }
        }
        @keyframes floatIcon {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(2deg); }
        }
        @keyframes slideFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes chipPop {
          from { opacity: 0; transform: translateY(10px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-content {
          animation: slideFadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .chip-0 { animation: chipPop 0.4s ease 0.1s forwards; opacity: 0; }
        .chip-1 { animation: chipPop 0.4s ease 0.2s forwards; opacity: 0; }
        .chip-2 { animation: chipPop 0.4s ease 0.3s forwards; opacity: 0; }
      `}</style>

      {/* Ana kapsayıcı (Asla fade olmaz, beyaz ekranı engeller) */}
      <div style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "#F8FAFC", // Açık gri/beyaz, temanın rengi
        maxWidth: 430,
        margin: "0 auto",
        position: "relative",
        overflow: "hidden",
      }}>

        {/* --- HAREKETLİ RENKLİ ARKA PLAN (BLOBS) --- */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
          <div style={{
            position: "absolute", top: "-10%", left: "-20%", width: "70%", aspectRatio: "1",
            background: slide.blob1, borderRadius: "50%", filter: "blur(60px)", opacity: 0.8,
            animation: "blobFloat1 8s ease-in-out infinite", transition: "background 0.8s ease",
          }} />
          <div style={{
            position: "absolute", top: "30%", right: "-20%", width: "60%", aspectRatio: "1",
            background: slide.blob2, borderRadius: "50%", filter: "blur(70px)", opacity: 0.7,
            animation: "blobFloat2 10s ease-in-out infinite", transition: "background 0.8s ease",
          }} />
          <div style={{
            position: "absolute", bottom: "-10%", left: "10%", width: "80%", aspectRatio: "1",
            background: slide.blob3, borderRadius: "50%", filter: "blur(80px)", opacity: 0.6,
            animation: "blobFloat3 12s ease-in-out infinite", transition: "background 0.8s ease",
          }} />
          {/* Hafif noise efekti (doku) */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')",
            opacity: 0.15, mixBlendMode: "overlay"
          }} />
        </div>

        {/* --- ÜST BAR (PROGRESS & SKIP) --- */}
        <div style={{
          position: "relative", zIndex: 10,
          padding: "24px 24px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          {/* Progress Çizgileri */}
          <div style={{ display: "flex", gap: "6px" }}>
            {slides.map((_, idx) => (
              <div key={idx} style={{
                height: "4px", width: idx === current ? "28px" : "10px",
                borderRadius: "2px",
                background: idx <= current ? slide.primary : "rgba(15, 23, 42, 0.1)",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              }} />
            ))}
          </div>
          {/* Atla Butonu */}
          {!isLast && (
            <button onClick={handleSkip} style={{
              background: "rgba(255, 255, 255, 0.6)", border: "1px solid rgba(255,255,255,0.8)",
              color: "#475569", fontSize: "13px", fontWeight: 700,
              padding: "6px 14px", borderRadius: "20px", cursor: "pointer",
              backdropFilter: "blur(8px)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
            }}>
              Atla
            </button>
          )}
        </div>

        {/* --- İÇERİK (Sadece burası fade in/out olur) --- */}
        <div 
          style={{
            flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 24px", position: "relative", zIndex: 10,
            opacity: transitioning ? 0 : 1,
            transform: transitioning ? "scale(0.98) translateY(10px)" : "scale(1) translateY(0)",
            transition: "opacity 0.25s ease-out, transform 0.25s ease-out"
          }}
        >
          {/* Glassmorphism Kart */}
          <div style={{
            background: "rgba(255, 255, 255, 0.65)",
            backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255, 255, 255, 0.8)",
            borderRadius: "32px", padding: "40px 24px 32px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,1)",
            position: "relative", overflow: "hidden",
          }}>
            
            {/* 3D Havada Duran İkon */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "32px", perspective: "800px" }}>
              <div style={{ position: "relative", animation: "floatIcon 4s ease-in-out infinite" }}>
                {/* Arka Parlama (Glow) */}
                <div style={{
                  position: "absolute", inset: -15, background: slide.primary, borderRadius: "50%",
                  filter: "blur(20px)", opacity: 0.2
                }} />
                
                {/* İkon Kutusu */}
                <div style={{
                  width: "88px", height: "88px", borderRadius: "28px",
                  background: `linear-gradient(135deg, ${slide.primary}, ${slide.primary}DD)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 16px 32px ${slide.primary}40, inset 0 2px 0 rgba(255,255,255,0.3)`,
                  position: "relative", zIndex: 1
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "44px", color: "#ffffff", fontVariationSettings: "'FILL' 1" }}>
                    {slide.icon}
                  </span>
                </div>
              </div>
            </div>

            {/* Metinler */}
            <div className="animate-content" key={`text-${current}`}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", justifyContent: "center" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: slide.primary, letterSpacing: "0.1em", background: `${slide.primary}15`, padding: "4px 10px", borderRadius: "12px" }}>
                  {slide.step}
                </span>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", letterSpacing: "0.05em" }}>
                  {slide.subtitle}
                </span>
              </div>
              <h1 style={{ fontSize: "28px", fontWeight: 900, color: "#0f172a", lineHeight: 1.2, textAlign: "center", marginBottom: "12px", whiteSpace: "pre-line", letterSpacing: "-0.02em" }}>
                {slide.title}
              </h1>
              <p style={{ fontSize: "15px", color: "#475569", lineHeight: 1.6, textAlign: "center", fontWeight: 500, marginBottom: "28px" }}>
                {slide.desc}
              </p>

              {/* Özellik Chipleri (Sırayla belirme efekti) */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
                {slide.chips.map((chip, i) => (
                  <span key={`${current}-${chip}`} className={`chip-${i}`} style={{
                    background: "#ffffff", border: "1px solid rgba(0,0,0,0.04)",
                    color: "#334155", fontSize: "13px", fontWeight: 600,
                    padding: "8px 14px", borderRadius: "20px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.03)"
                  }}>
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* --- ALT BUTON --- */}
        <div style={{ position: "relative", zIndex: 10, padding: "0 24px 32px" }}>
          <button
            onClick={handleNext}
            className="active:scale-95 transition-transform"
            style={{
              width: "100%", padding: "20px", borderRadius: "24px",
              background: slide.primary, color: "#ffffff",
              fontSize: "17px", fontWeight: 800, border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
              boxShadow: `0 12px 30px ${slide.primary}40, inset 0 2px 0 rgba(255,255,255,0.2)`,
              transition: "all 0.3s ease"
            }}
          >
            {isLast ? "Uygulamaya Başla" : "Devam Et"}
            <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>
              {isLast ? "rocket_launch" : "arrow_forward"}
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
