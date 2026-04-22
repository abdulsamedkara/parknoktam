"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const slides = [
  {
    id: "discover",
    orb1: "#4F46E5",
    orb2: "#7C3AED",
    orb3: "#06B6D4",
    accent: "#818CF8",
    icon: "map",
    step: "01 / 04",
    label: "NEDİR?",
    title: "Şehrin En Akıllı\nPark Uygulaması",
    desc: "Rize'deki tüm otoparkları ve bireysel garajları tek ekranda görün. Dakikalarca araç sürmek yerine saniyede rezervasyon yapın.",
    chips: ["🗺️ Anlık Harita", "💰 Fiyat Karşılaştır", "🅿️ 6+ Park Noktası"],
  },
  {
    id: "reserve",
    orb1: "#0EA5E9",
    orb2: "#6D28D9",
    orb3: "#10B981",
    accent: "#38BDF8",
    icon: "touch_app",
    step: "02 / 04",
    label: "NASIL KULLANILIR?",
    title: "Gelmeden Önce\nYerini Garantile",
    desc: "3 adımda bitti: Otopark seç → Saati belirle → Öde. QR kodlu dijital biletin anında cebinde! Gişe, nakit, sıra yok.",
    chips: ["⚡ 30 Saniye", "📱 QR Bilet", "✅ Sırasız Giriş"],
  },
  {
    id: "earn",
    orb1: "#059669",
    orb2: "#0891B2",
    orb3: "#7C3AED",
    accent: "#34D399",
    icon: "real_estate_agent",
    step: "03 / 04",
    label: "EK GELİR",
    title: "Garajını Kiraya Ver,\nEvde Para Kazan",
    desc: "Sadece park etmekle kalmıyorsunuz. Boş duran garajınızı sisteme ekleyin, komşularınıza kiralayın. Siz uyurken bile.",
    chips: ["🏠 Ücretsiz İlan", "💎 Kendin Fiyatla", "💳 Hızlı Ödeme"],
  },
  {
    id: "rewards",
    orb1: "#F59E0B",
    orb2: "#EF4444",
    orb3: "#8B5CF6",
    accent: "#FCD34D",
    icon: "stars",
    step: "04 / 04",
    label: "AVANTAJ",
    title: "Park Ettikçe\nKredi Kazan!",
    desc: "Her parktan sonra anketimizi doldurun, hesabınıza kredi yükleyelim. Biriktirin, bir sonraki parkınızı bedavaya getirin!",
    chips: ["🎁 Anket Kredisi", "🏆 Sadakat Puanı", "🎉 İndirim Fırsatları"],
  },
];

export default function HosgeldinPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [autoProgress, setAutoProgress] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setAutoProgress(0);
    const interval = setInterval(() => {
      setAutoProgress(prev => {
        if (prev >= 100) return 100;
        return prev + 0.5;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [current]);

  const slide = slides[current];
  const isLast = current === slides.length - 1;

  const handleNext = () => {
    if (transitioning) return;
    if (isLast) { router.push("/ana-sayfa"); return; }
    setTransitioning(true);
    setTimeout(() => { setCurrent(c => c + 1); setTransitioning(false); }, 380);
  };

  const handleSkip = () => router.push("/ana-sayfa");

  if (!mounted) return null;

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-18px) rotate(3deg); }
          66% { transform: translateY(-8px) rotate(-2deg); }
        }
        @keyframes orbFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -40px) scale(1.15); }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1.1); }
          50% { transform: translate(-40px, 30px) scale(0.9); }
        }
        @keyframes orbFloat3 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, 20px) scale(1.1); }
        }
        @keyframes shimmer {
          0% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
          100% { opacity: 0.5; transform: scale(1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes chipEntry {
          from { opacity: 0; transform: translateY(12px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes ringPulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.15); opacity: 0.1; }
        }
        @keyframes progressBar {
          from { width: 0%; }
          to { width: 100%; }
        }
        .chip-0 { animation: chipEntry 0.4s ease 0.3s both; }
        .chip-1 { animation: chipEntry 0.4s ease 0.45s both; }
        .chip-2 { animation: chipEntry 0.4s ease 0.6s both; }
      `}</style>

      <div style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "#06060F",
        maxWidth: 430,
        margin: "0 auto",
        position: "relative",
        overflow: "hidden",
        opacity: transitioning ? 0 : 1,
        transform: transitioning ? "scale(0.97)" : "scale(1)",
        transition: "opacity 0.38s ease, transform 0.38s ease",
      }}>

        {/* --- ANIMATED ORB BACKGROUND --- */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          <div style={{
            position: "absolute", top: "-15%", left: "-20%",
            width: "65%", aspectRatio: "1",
            background: slide.orb1,
            borderRadius: "50%",
            filter: "blur(80px)",
            opacity: 0.6,
            animation: "orbFloat1 7s ease-in-out infinite",
            transition: "background 0.8s ease",
          }} />
          <div style={{
            position: "absolute", top: "20%", right: "-25%",
            width: "60%", aspectRatio: "1",
            background: slide.orb2,
            borderRadius: "50%",
            filter: "blur(90px)",
            opacity: 0.5,
            animation: "orbFloat2 9s ease-in-out infinite",
            transition: "background 0.8s ease",
          }} />
          <div style={{
            position: "absolute", bottom: "-10%", left: "20%",
            width: "50%", aspectRatio: "1",
            background: slide.orb3,
            borderRadius: "50%",
            filter: "blur(70px)",
            opacity: 0.4,
            animation: "orbFloat3 11s ease-in-out infinite",
            transition: "background 0.8s ease",
          }} />
          {/* Noise texture overlay */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
            opacity: 0.5,
          }} />
        </div>

        {/* --- TOP BAR --- */}
        <div style={{
          position: "relative", zIndex: 10,
          padding: "20px 24px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            {slides.map((_, idx) => (
              <div key={idx} style={{
                height: "3px",
                width: idx === current ? "28px" : "8px",
                borderRadius: "2px",
                background: idx <= current ? slide.accent : "rgba(255,255,255,0.15)",
                transition: "all 0.4s ease",
              }} />
            ))}
          </div>
          {!isLast && (
            <button onClick={handleSkip} style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.5)",
              fontSize: "13px", fontWeight: 600,
              padding: "7px 16px", borderRadius: "20px",
              cursor: "pointer", backdropFilter: "blur(10px)",
            }}>
              Atla
            </button>
          )}
        </div>

        {/* --- MAIN GLASS CARD --- */}
        <div style={{
          position: "relative", zIndex: 10,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 20px",
        }}>
          {/* Big floating 3D glass card */}
          <div style={{
            background: "rgba(255, 255, 255, 0.07)",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "32px",
            padding: "36px 28px",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.05) inset, 0 40px 80px rgba(0,0,0,0.4)",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Card inner glow */}
            <div style={{
              position: "absolute", top: 0, left: "20%", right: "20%", height: "1px",
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
            }} />

            {/* Step pill */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              background: `${slide.accent}20`,
              border: `1px solid ${slide.accent}40`,
              color: slide.accent,
              fontSize: "11px", fontWeight: 800, letterSpacing: "0.1em",
              padding: "5px 12px", borderRadius: "20px",
              marginBottom: "28px",
              transition: "all 0.4s ease"
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: slide.accent, display: "inline-block" }} />
              {slide.label}
            </div>

            {/* 3D Floating Icon */}
            <div style={{
              display: "flex", justifyContent: "center",
              marginBottom: "28px",
              perspective: "600px",
            }}>
              <div style={{
                position: "relative",
                animation: "float 4s ease-in-out infinite",
              }}>
                {/* Outer pulse rings */}
                <div style={{
                  position: "absolute", inset: -20,
                  borderRadius: "50%",
                  border: `2px solid ${slide.accent}30`,
                  animation: "ringPulse 3s ease-in-out infinite",
                }} />
                <div style={{
                  position: "absolute", inset: -8,
                  borderRadius: "36px",
                  border: `1px solid ${slide.accent}20`,
                  animation: "ringPulse 3s ease-in-out 0.5s infinite",
                }} />

                {/* Icon container */}
                <div style={{
                  width: "100px", height: "100px",
                  borderRadius: "28px",
                  background: `linear-gradient(145deg, ${slide.orb1}DD, ${slide.orb2}DD)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 20px 40px ${slide.orb1}60, 0 0 0 1px rgba(255,255,255,0.1) inset`,
                  position: "relative",
                }}>
                  {/* Shine overlay */}
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: "50%",
                    background: "linear-gradient(180deg, rgba(255,255,255,0.25), transparent)",
                    borderRadius: "28px 28px 50% 50%",
                  }} />
                  <span className="material-symbols-outlined" style={{
                    fontSize: "48px",
                    color: "#fff",
                    fontVariationSettings: "'FILL' 1",
                    textShadow: "0 4px 12px rgba(0,0,0,0.3)",
                    position: "relative",
                    zIndex: 1,
                  }}>
                    {slide.icon}
                  </span>
                </div>
              </div>
            </div>

            {/* Text */}
            <div style={{ animation: "slideUp 0.5s ease both" }}>
              <h1 style={{
                fontSize: "26px", fontWeight: 900,
                color: "#fff",
                lineHeight: 1.2, letterSpacing: "-0.02em",
                marginBottom: "12px", whiteSpace: "pre-line",
              }}>
                {slide.title}
              </h1>
              <p style={{
                fontSize: "14px", color: "rgba(255,255,255,0.55)",
                lineHeight: 1.65, fontWeight: 500,
                marginBottom: "24px",
              }}>
                {slide.desc}
              </p>
            </div>

            {/* Feature Chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {slide.chips.map((chip, i) => (
                <span key={chip} className={`chip-${i}`} style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.85)",
                  fontSize: "13px", fontWeight: 600,
                  padding: "8px 14px", borderRadius: "14px",
                  backdropFilter: "blur(10px)",
                  display: "inline-flex", alignItems: "center", gap: "4px",
                }}>
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* --- BOTTOM CTA --- */}
        <div style={{ position: "relative", zIndex: 10, padding: "24px 20px 40px" }}>
          {/* Step counter */}
          <p style={{
            textAlign: "center", color: "rgba(255,255,255,0.3)",
            fontSize: "12px", fontWeight: 700,
            letterSpacing: "0.08em", marginBottom: "16px",
          }}>
            {slide.step}
          </p>

          <button
            onClick={handleNext}
            style={{
              width: "100%",
              padding: "20px",
              borderRadius: "20px",
              background: `linear-gradient(135deg, ${slide.orb1}, ${slide.orb2})`,
              color: "#fff",
              fontSize: "17px", fontWeight: 800,
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
              boxShadow: `0 12px 30px ${slide.orb1}60`,
              transition: "box-shadow 0.3s ease, transform 0.15s ease",
              position: "relative", overflow: "hidden",
            }}
            onMouseDown={e => (e.currentTarget.style.transform = "scale(0.97)")}
            onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            {/* Shimmer overlay on button */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "50%",
              background: "linear-gradient(180deg, rgba(255,255,255,0.2), transparent)",
              borderRadius: "20px 20px 50% 50%",
              pointerEvents: "none"
            }} />
            <span style={{ position: "relative", zIndex: 1 }}>
              {isLast ? "Uygulamaya Başla" : "Devam Et"}
            </span>
            <span className="material-symbols-outlined" style={{ fontSize: 20, position: "relative", zIndex: 1 }}>
              {isLast ? "rocket_launch" : "arrow_forward"}
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
