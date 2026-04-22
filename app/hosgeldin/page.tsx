"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const slides = [
  {
    id: "discover",
    bg: "linear-gradient(180deg, #F0F4FA 0%, #FFFFFF 100%)",
    primary: "#0A66C2",
    icon: "map",
    subtitle: "PARK NOKTAM NEDİR?",
    title: "Park Yeri Aramaya Son!",
    desc: "Şehirdeki boş otoparkları ve şahıslara ait özel garajları tek bir haritada gör. Boş yer arayarak zaman kaybetme.",
    features: ["Bireysel ve Ticari Otoparklar", "Anlık Doluluk Durumu", "Fiyat Karşılaştırma"],
  },
  {
    id: "reserve",
    bg: "linear-gradient(180deg, #F3F0FA 0%, #FFFFFF 100%)",
    primary: "#6D28D9",
    icon: "touch_app",
    subtitle: "NASIL KULLANILIR?",
    title: "Gelmeden Yerini Ayırt",
    desc: "Gideceğin yerdeki otoparkı seç, saatini belirle ve tek tıkla ödemeni yap. Oraya vardığında yerin seni bekliyor olacak.",
    features: ["Saniyeler İçinde Rezervasyon", "Temassız QR Bilet", "Sıra Beklemek Yok"],
  },
  {
    id: "host",
    bg: "linear-gradient(180deg, #EDF7F4 0%, #FFFFFF 100%)",
    primary: "#059669",
    icon: "real_estate_agent",
    subtitle: "EK GELİR FIRSATI",
    title: "Garajını Kirala, Para Kazan",
    desc: "Sadece park eden değil, otopark sahibi de olabilirsin! Kullanmadığın park yerini sisteme ekle, sen uyurken bile kazanç sağla.",
    features: ["Ücretsiz İlan Verme", "Kendin Fiyat Belirle", "Hızlı Kazanç Çekimi"],
  },
  {
    id: "rewards",
    bg: "linear-gradient(180deg, #FFF5EB 0%, #FFFFFF 100%)",
    primary: "#EA580C",
    icon: "celebration",
    subtitle: "SİSTEMİN AVANTAJLARI",
    title: "Anket Doldur, Bedava Park Et",
    desc: "Park deneyimini oyla ve bizim için anketleri doldur. Kazandığın kredilerle bir sonraki parkını tamamen bedavaya getir!",
    features: ["Her Ankette Kredi", "İndirim Kuponları", "Kullanıcı Sadakat Sistemi"],
  }
];

export default function HosgeldinPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
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
    }, 250);
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
      transition: "background 0.5s ease",
      maxWidth: 430,
      margin: "0 auto",
      position: "relative",
    }}>
      {/* Top Navigation */}
      <div style={{ padding: "24px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "6px" }}>
          {slides.map((_, idx) => (
            <div key={idx} style={{
              height: "4px",
              width: idx === current ? "24px" : "12px",
              borderRadius: "2px",
              background: idx === current ? slide.primary : "rgba(0,0,0,0.1)",
              transition: "all 0.3s ease"
            }} />
          ))}
        </div>
        {!isLast ? (
          <button onClick={handleSkip} style={{
            background: "none", border: "none", color: "#64748b", fontWeight: 700, fontSize: "14px", cursor: "pointer"
          }}>
            Atla
          </button>
        ) : <div style={{ width: 28 }} />}
      </div>

      {/* Content Area */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 24px 40px",
        opacity: animating ? 0 : 1,
        transform: animating ? "translateX(-20px)" : "translateX(0)",
        transition: "opacity 0.25s ease, transform 0.25s ease",
      }}>
        
        {/* Dynamic Icon/Visual Box */}
        <div style={{
          width: "100%",
          aspectRatio: "1",
          background: "#fff",
          borderRadius: "32px",
          marginBottom: "40px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.04)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.02)"
        }}>
          {/* Subtle colored glow behind icon */}
          <div style={{
            position: "absolute",
            width: "60%",
            height: "60%",
            background: slide.primary,
            filter: "blur(60px)",
            opacity: 0.15,
            borderRadius: "50%"
          }} />
          
          <div style={{
            width: "80px",
            height: "80px",
            borderRadius: "24px",
            background: slide.primary,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 12px 24px ${slide.primary}40`,
            marginBottom: "24px",
            zIndex: 1
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: "40px", fontVariationSettings: "'FILL' 1" }}>
              {slide.icon}
            </span>
          </div>

          <div style={{ zIndex: 1, textAlign: "center", width: "80%" }}>
            {slide.features.map((feat, i) => (
              <div key={i} style={{
                background: "#f8fafc",
                color: "#334155",
                fontSize: "13px",
                fontWeight: 600,
                padding: "8px 12px",
                borderRadius: "12px",
                marginBottom: "8px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: "16px", color: slide.primary, fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
                {feat}
              </div>
            ))}
          </div>
        </div>

        {/* Texts */}
        <div>
          <span style={{
            color: slide.primary,
            fontSize: "12px",
            fontWeight: 800,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: "12px",
            display: "block"
          }}>
            {slide.subtitle}
          </span>
          <h1 style={{
            fontSize: "32px",
            fontWeight: 900,
            color: "#0f172a",
            lineHeight: 1.2,
            letterSpacing: "-0.03em",
            marginBottom: "16px"
          }}>
            {slide.title}
          </h1>
          <p style={{
            fontSize: "15px",
            color: "#64748b",
            lineHeight: 1.6,
            fontWeight: 500
          }}>
            {slide.desc}
          </p>
        </div>
      </div>

      {/* Bottom Button */}
      <div style={{ padding: "0 24px 32px" }}>
        <button 
          onClick={handleNext}
          className="active:scale-95 transition-transform"
          style={{
            width: "100%",
            background: slide.primary,
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
            boxShadow: `0 10px 25px ${slide.primary}40`,
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
