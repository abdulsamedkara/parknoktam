"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const slides = [
  {
    id: "map",
    bg: "radial-gradient(circle at 50% 0%, #e0c3fc 0%, #8ec5fc 100%)",
    icon: "location_on",
    iconBg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    title: "Akıllı Park\nAsistanınız",
    desc: "Şehirdeki tüm uygun park noktalarını anlık haritada görün. Rize'nin her köşesinde, saniyeler içinde yerinizi ayırtın.",
  },
  {
    id: "security",
    bg: "radial-gradient(circle at 50% 0%, #fbc2eb 0%, #a6c1ee 100%)",
    icon: "shield_locked",
    iconBg: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    title: "Üst Düzey\nGüvenlik",
    desc: "100% doğrulanmış ve 7/24 kamera ile izlenen noktalar. Aracınızı gönül rahatlığıyla bırakın, gözünüz arkada kalmasın.",
  },
  {
    id: "fast",
    bg: "radial-gradient(circle at 50% 0%, #84fab0 0%, #8fd3f4 100%)",
    icon: "bolt",
    iconBg: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    title: "Işık Hızında\nRezervasyon",
    desc: "Tek tıkla ödeyin, QR kodlu dijital biletiniz anında cebinize gelsin. Gişe beklemek, nakit aramak artık tarih oldu.",
  },
  {
    id: "earn",
    bg: "radial-gradient(circle at 50% 0%, #ffd194 0%, #70e1f5 100%)",
    icon: "stars",
    iconBg: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
    title: "Park Ettikçe\nKazan",
    desc: "Otopark deneyiminizi puanlayın, anketleri doldurun ve cüzdanınıza krediler dolsun. Bedava park etmenin tadını çıkarın.",
  }
];

export default function HosgeldinPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // TEST İÇİN LOCALSTORAGE KONTROLÜ KALDIRILDI!
    // Her girişte bu ekran görünecek.
    setMounted(true);
  }, []);

  const slide = slides[current];
  const isLast = current === slides.length - 1;

  const handleNext = () => {
    if (animating) return;
    if (isLast) {
      router.push("/ana-sayfa");
      return;
    }
    setAnimating(true);
    setTimeout(() => {
      setCurrent(c => c + 1);
      setAnimating(false);
    }, 300);
  };

  const handleSkip = () => {
    router.push("/ana-sayfa");
  };

  if (!mounted) return null;

  return (
    <div style={{
      minHeight: "100dvh",
      display: "flex",
      flexDirection: "column",
      background: slide.bg,
      transition: "background 0.8s ease-in-out",
      maxWidth: 430,
      margin: "0 auto",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Decorative Top Glow */}
      <div style={{
        position: "absolute", top: "-10%", left: "-10%", width: "120%", height: "50%",
        background: "radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%)",
        pointerEvents: "none"
      }} />

      {/* Header / Skip */}
      <div style={{ padding: "20px", display: "flex", justifyContent: "flex-end", zIndex: 10, position: "relative" }}>
        {!isLast ? (
          <button 
            onClick={handleSkip}
            style={{
              background: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.3)",
              padding: "8px 16px",
              borderRadius: "20px",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
            }}
          >
            Geç
          </button>
        ) : <div style={{ height: 38 }} />}
      </div>

      {/* Main Illustration Area */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        zIndex: 10,
        padding: "0 20px"
      }}>
        <div style={{
          width: 140,
          height: 140,
          background: slide.iconBg,
          borderRadius: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 20px 40px rgba(0,0,0,0.15), inset 0 2px 0 rgba(255,255,255,0.4)",
          transform: animating ? "scale(0.8) translateY(-20px)" : "scale(1) translateY(0)",
          opacity: animating ? 0 : 1,
          transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          position: "relative"
        }}>
          {/* Glowing background ring */}
          <div style={{
            position: "absolute", inset: -20, borderRadius: "50px",
            background: slide.iconBg, opacity: 0.3, filter: "blur(20px)", zIndex: -1
          }} />
          <span className="material-symbols-outlined" style={{ 
            fontSize: 72, color: "#fff", fontVariationSettings: "'FILL' 1" 
          }}>
            {slide.icon}
          </span>
        </div>
      </div>

      {/* Bottom Glass Card */}
      <div style={{
        background: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderTopLeftRadius: "32px",
        borderTopRightRadius: "32px",
        padding: "40px 32px",
        position: "relative",
        zIndex: 20,
        boxShadow: "0 -10px 40px rgba(0,0,0,0.08)",
        transform: animating ? "translateY(20px)" : "translateY(0)",
        opacity: animating ? 0 : 1,
        transition: "all 0.4s cubic-bezier(0.25, 1, 0.5, 1)",
      }}>
        {/* Progress Bar */}
        <div style={{ display: "flex", gap: 6, marginBottom: 32 }}>
          {slides.map((_, idx) => (
            <div key={idx} style={{
              flex: idx === current ? 2 : 1,
              height: 4,
              borderRadius: 2,
              background: idx === current ? "#0A66C2" : "rgba(10, 102, 194, 0.15)",
              transition: "all 0.3s ease"
            }} />
          ))}
        </div>

        {/* Text Content */}
        <h1 style={{
          fontSize: "32px",
          fontWeight: 900,
          color: "#0f172a",
          lineHeight: 1.15,
          letterSpacing: "-0.03em",
          marginBottom: "16px",
          whiteSpace: "pre-line"
        }}>
          {slide.title}
        </h1>
        <p style={{
          fontSize: "16px",
          color: "#475569",
          lineHeight: 1.6,
          marginBottom: "40px",
          fontWeight: 500
        }}>
          {slide.desc}
        </p>

        {/* Next Button */}
        <button 
          onClick={handleNext}
          className="active:scale-95 transition-transform"
          style={{
            width: "100%",
            background: "#0f172a",
            color: "#fff",
            border: "none",
            borderRadius: "20px",
            padding: "20px 0",
            fontSize: "17px",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            boxShadow: "0 10px 25px rgba(15, 23, 42, 0.2)",
          }}
        >
          {isLast ? "Uygulamaya Başla" : "Devam Et"}
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            {isLast ? "rocket_launch" : "arrow_forward"}
          </span>
        </button>
      </div>
    </div>
  );
}
