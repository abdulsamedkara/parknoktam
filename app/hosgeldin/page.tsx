"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const slides = [
  {
    emoji: "🅿️",
    gradient: "linear-gradient(135deg, #0A66C2 0%, #1565C0 100%)",
    badge: "Park Noktam'a Hoş Geldin!",
    title: "Artık Park Yeri Bulmak\nÇok Kolay",
    desc: "Şehirdeki yüzlerce boş park noktasını haritada anlık olarak gör, saniyeler içinde rezervasyon yap.",
    stat1: { val: "500+", label: "Park Noktası" },
    stat2: { val: "4.9★", label: "Kullanıcı Puanı" },
  },
  {
    emoji: "🔒",
    gradient: "linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)",
    badge: "Güvenli & Korumalı",
    title: "Emin Ellerdesin,\nAracın da Öyle",
    desc: "KKTC doğrulanmış ve kameralı park noktaları. Güvenlik skoru, kullanıcı yorumları ve anlık doluluk bilgisi tek ekranda.",
    stat1: { val: "%100", label: "Doğrulanmış İlanlar" },
    stat2: { val: "7/24", label: "Destek" },
  },
  {
    emoji: "⚡",
    gradient: "linear-gradient(135deg, #059669 0%, #047857 100%)",
    badge: "Anında Rezervasyon",
    title: "3 Adımda Rezervasyon,\nAnında Dijital Bilet",
    desc: "Otopark seç → Saati belirle → Ödemeyi yap. QR kodlu dijital biletin telefona saniyeler içinde düşer.",
    stat1: { val: "<30sn", label: "Ortalama İşlem Süresi" },
    stat2: { val: "₺20", label: "Anket Ödülü" },
  },
  {
    emoji: "🎉",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
    badge: "Kazanmaya Başla",
    title: "Park Et,\nKredi Kazan!",
    desc: "Her rezervasyondan sonra anket doldur, uygulama kredisi kazan. Biriktir, bir sonraki parkında kullan.",
    stat1: { val: "₺20", label: "İlk Anket Ödülü" },
    stat2: { val: "%0", label: "Komisyon" },
  },
];

export default function HosgeldinPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Sadece bir kez göster
    const seen = localStorage.getItem("parknoktam_onboarded");
    if (seen) {
      router.replace("/ana-sayfa");
      return;
    }
    setMounted(true);
  }, [router]);

  const slide = slides[current];
  const isLast = current === slides.length - 1;

  const goNext = () => {
    if (animating) return;
    if (isLast) {
      localStorage.setItem("parknoktam_onboarded", "1");
      router.push("/ana-sayfa");
      return;
    }
    setAnimating(true);
    setTimeout(() => {
      setCurrent(c => c + 1);
      setAnimating(false);
    }, 220);
  };

  const goTo = (i: number) => {
    if (animating || i === current) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(i);
      setAnimating(false);
    }, 220);
  };

  if (!mounted) return null;

  return (
    <div style={{
      minHeight: "100dvh",
      display: "flex",
      flexDirection: "column",
      background: "#f8faff",
      maxWidth: 430,
      margin: "0 auto",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Skip */}
      {!isLast && (
        <button
          onClick={() => {
            localStorage.setItem("parknoktam_onboarded", "1");
            router.push("/ana-sayfa");
          }}
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            zIndex: 10,
            background: "rgba(0,0,0,0.10)",
            border: "none",
            borderRadius: 20,
            padding: "6px 16px",
            fontSize: 13,
            fontWeight: 600,
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Geç →
        </button>
      )}

      {/* Hero Card */}
      <div style={{
        background: slide.gradient,
        borderRadius: "0 0 40px 40px",
        padding: "60px 28px 40px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        opacity: animating ? 0 : 1,
        transform: animating ? "translateY(-12px)" : "translateY(0)",
        transition: "opacity 0.22s ease, transform 0.22s ease",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative blobs */}
        <div style={{
          position: "absolute", top: -40, right: -40,
          width: 160, height: 160,
          background: "rgba(255,255,255,0.08)",
          borderRadius: "50%",
        }} />
        <div style={{
          position: "absolute", bottom: -30, left: -30,
          width: 120, height: 120,
          background: "rgba(255,255,255,0.06)",
          borderRadius: "50%",
        }} />

        {/* Emoji */}
        <div style={{
          width: 88, height: 88,
          background: "rgba(255,255,255,0.18)",
          borderRadius: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 44,
          backdropFilter: "blur(8px)",
          border: "2px solid rgba(255,255,255,0.3)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          position: "relative",
          zIndex: 1,
        }}>
          {slide.emoji}
        </div>

        {/* Badge */}
        <span style={{
          background: "rgba(255,255,255,0.22)",
          color: "#fff",
          fontSize: 11,
          fontWeight: 700,
          padding: "5px 14px",
          borderRadius: 20,
          letterSpacing: "0.06em",
          position: "relative",
          zIndex: 1,
        }}>
          {slide.badge}
        </span>

        {/* Stats */}
        <div style={{
          display: "flex",
          gap: 20,
          marginTop: 8,
          position: "relative",
          zIndex: 1,
        }}>
          {[slide.stat1, slide.stat2].map((s, i) => (
            <div key={i} style={{
              textAlign: "center",
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(8px)",
              borderRadius: 16,
              padding: "10px 20px",
              border: "1px solid rgba(255,255,255,0.25)",
            }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>{s.val}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", fontWeight: 600, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Text Content */}
      <div style={{
        padding: "32px 28px 16px",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        opacity: animating ? 0 : 1,
        transform: animating ? "translateY(12px)" : "translateY(0)",
        transition: "opacity 0.22s ease, transform 0.22s ease",
      }}>
        <h1 style={{
          fontSize: 28,
          fontWeight: 900,
          color: "#0f172a",
          lineHeight: 1.25,
          whiteSpace: "pre-line",
          margin: 0,
          fontFamily: "'Inter', 'Manrope', sans-serif",
        }}>
          {slide.title}
        </h1>
        <p style={{
          fontSize: 15,
          color: "#475569",
          lineHeight: 1.65,
          margin: 0,
          fontWeight: 450,
        }}>
          {slide.desc}
        </p>
      </div>

      {/* Dots + Button */}
      <div style={{
        padding: "16px 28px 40px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        alignItems: "center",
      }}>
        {/* Dots */}
        <div style={{ display: "flex", gap: 8 }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: i === current ? 28 : 8,
                height: 8,
                borderRadius: 4,
                background: i === current ? "#0A66C2" : "#cbd5e1",
                border: "none",
                padding: 0,
                cursor: "pointer",
                transition: "width 0.3s ease, background 0.3s ease",
              }}
            />
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={goNext}
          style={{
            width: "100%",
            padding: "18px 0",
            borderRadius: 20,
            background: slide.gradient,
            color: "#fff",
            fontSize: 16,
            fontWeight: 800,
            border: "none",
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(10,102,194,0.35)",
            transition: "transform 0.15s ease, box-shadow 0.15s ease",
            letterSpacing: "0.01em",
          }}
          onMouseDown={e => (e.currentTarget.style.transform = "scale(0.97)")}
          onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
        >
          {isLast ? "🚀  Hadi Başlayalım!" : "Devam Et →"}
        </button>
      </div>
    </div>
  );
}
