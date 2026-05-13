"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// SVG Icons
const IconParking = () => (
  <svg viewBox="0 0 100 100" width="32" height="32">
    <path d="M30,35 L45,20 L55,30 Z" fill="#0A66C2" />
    <text x="50" y="68" textAnchor="middle" fontFamily="Manrope" fontWeight="900" fontSize="42" fill="#ffb703" letterSpacing="-1">Park</text>
    <text x="50" y="86" textAnchor="middle" fontFamily="Inter" fontWeight="700" fontSize="12" fill="#475569" letterSpacing="2">NOKTAM</text>
  </svg>
);

const SleekCar = () => (
  <svg width="56" height="116" viewBox="0 0 48 96" fill="none" style={{ filter: 'drop-shadow(0 12px 16px rgba(0,0,0,0.15))' }}>
    <rect x="4" y="4" width="40" height="88" rx="12" fill="#0A66C2" />
    <rect x="4" y="4" width="40" height="88" rx="12" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.3" />
    <path d="M 8 28 C 8 22, 40 22, 40 28 L 36 40 L 12 40 Z" fill="#0f172a" />
    <path d="M 8 72 C 8 78, 40 78, 40 72 L 36 60 L 12 60 Z" fill="#0f172a" />
    <rect x="12" y="42" width="24" height="16" rx="4" fill="#1e3a8a" opacity="0.3" />
    <rect x="8" y="2" width="10" height="4" rx="2" fill="#fde047" />
    <rect x="30" y="2" width="10" height="4" rx="2" fill="#fde047" />
    <rect x="6" y="90" width="12" height="4" rx="2" fill="#ef4444" style={{ animation: 'brakeLights 4.2s ease-out forwards' }} />
    <rect x="30" y="90" width="12" height="4" rx="2" fill="#ef4444" style={{ animation: 'brakeলাসs 4.2s ease-out forwards' }} />
  </svg>
);

const ParkingBay = () => (
  <svg width="120" height="160" viewBox="0 0 100 140" fill="none" style={{ position: 'absolute', top: 0, left: 0 }}>
    <path d="M 10 140 L 10 10 L 90 10 L 90 140" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" strokeDasharray="300" strokeDashoffset="300" style={{ animation: 'bayLines 1.5s ease-out forwards' }} />
  </svg>
);

const features = [
  {
    id: "surucu",
    icon: "directions_car",
    color: "#0A66C2",
    title: "Sürücüler İçin",
    short: "Hızlı bul, rezervasyon yap, kolayca park et",
    detail: "Haritadan en yakın otoparkı bul, önceden rezervasyon yap. Nakit ödeme ve sıra bekleme derdi olmadan QR kodunla hemen park et.",
  },
  {
    id: "sahip",
    icon: "storefront",
    color: "#7c3aed",
    title: "Otopark Sahipleri İçin",
    short: "Otoparkını listele, kolayca yönet",
    detail: "Park alanını sisteme ekle, çalışma saatlerini ve ücretlerini belirle. Tüm kazancını cüzdanından anlık takip et.",
  },
  {
    id: "guvenlik",
    icon: "shield_person",
    color: "#059669",
    title: "Güvenlik & Şeffaflık",
    short: "CCTV, güvenlik görevlisi ve net fiyatlar",
    detail: "Otoparkların güvenlik durumlarını gör, şeffaf fiyatlandırma sayesinde sürprizlerle karşılaşmadan aracını güvenle bırak.",
  },
  {
    id: "dijital",
    icon: "qr_code_scanner",
    color: "#d97706",
    title: "Tamamen Dijital",
    short: "Bilet veya fiş kaybetmeye son",
    detail: "Rezervasyonun, giriş-çıkış saatlerin ve ödemelerin tamamen dijital olarak telefonunda kayıtlı tutulur.",
  },
];

export default function HosgeldinPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [animationDone, setAnimationDone] = useState(false);
  const [isHiding, setIsHiding] = useState(false);

  useEffect(() => { 
    setMounted(true); 
    const timer = setTimeout(() => setAnimationDone(true), 3200);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  const handleSplashContinue = () => {
    setIsHiding(true);
    setTimeout(() => setShowSplash(false), 500);
  };

  const openFeature = features.find(f => f.id === activeFeature);

  return (
    <>
      <style>{`
        /* Animasyonlar */
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fadeUpIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes cardEntrance {
          from { opacity: 0; transform: scale(0.95) rotateX(10deg); }
          to { opacity: 1; transform: scale(1) rotateX(0deg); }
        }
        
        /* Premium Splash Animations */
        @keyframes splashFadeOut {
          0% { opacity: 1; visibility: visible; }
          100% { opacity: 0; visibility: hidden; }
        }
        @keyframes btnReveal {
          0% { opacity: 0; transform: translateY(10px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes premiumPark {
          0% { transform: translate(120px, 200px) rotate(40deg); opacity: 0; }
          15% { transform: translate(120px, 200px) rotate(40deg); opacity: 0; }
          25% { opacity: 1; }
          60% { transform: translate(0px, 80px) rotate(0deg); }
          90% { transform: translate(0px, 12px) rotate(0deg); }
          100% { transform: translate(0px, 12px) rotate(0deg); }
        }
        @keyframes brakeLights {
          0%, 86% { fill: #ef4444; filter: none; }
          89%, 96% { fill: #ff0000; filter: drop-shadow(0 0 12px rgba(255,0,0,0.9)); }
          100% { fill: #ef4444; filter: none; }
        }
        @keyframes bayLines {
          0% { stroke-dashoffset: 300; opacity: 0; }
          40% { stroke-dashoffset: 0; opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes textReveal {
          0% { opacity: 0; transform: translateY(15px); filter: blur(4px); }
          100% { opacity: 1; transform: translateY(0); filter: blur(0); }
        }

        .welcome-bg {
          position: fixed; inset: 0; z-index: 0;
          background: radial-gradient(ellipse at 50% 0%, #ffffff 0%, #f1f5f9 100%);
          pointer-events: none;
        }
        .welcome-orb-1 {
          position: absolute; width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(37, 142, 245, 0.15) 0%, transparent 70%);
          top: -10%; left: -10%; filter: blur(80px); animation: float 8s ease-in-out infinite;
        }
        .welcome-orb-2 {
          position: absolute; width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(124, 58, 237, 0.1) 0%, transparent 70%);
          bottom: -5%; right: -5%; filter: blur(80px); animation: float 10s ease-in-out infinite reverse;
        }

        /* Splash Styles */
        .premium-splash {
          position: fixed; inset: 0; z-index: 9999;
          background: radial-gradient(circle at center, #ffffff 0%, #f1f5f9 100%);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
        }
        .premium-splash.hiding {
          animation: splashFadeOut 0.5s ease-out forwards;
        }

        .animation-stage {
          position: relative;
          width: 120px; height: 160px;
          display: flex; justify-content: center; align-items: flex-start;
          margin-bottom: 24px;
        }

        .car-wrapper {
          position: absolute; top: 0; left: 32px;
          animation: premiumPark 4.2s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        
        .feature-btn:hover {
          background: rgba(255,255,255,0.9) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.06) !important;
        }
      `}</style>

      {/* --- PREMIUM SPLASH SCREEN --- */}
      {showSplash && (
        <div className={`premium-splash ${isHiding ? 'hiding' : ''}`}>
          <div className="animation-stage">
            <ParkingBay />
            <div className="car-wrapper">
              <SleekCar />
            </div>
          </div>
          <div style={{ textAlign: "center", opacity: 0, animation: "textReveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) 2.6s forwards", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h1 style={{ fontFamily: "Manrope", fontSize: 36, fontWeight: 900, color: "#0f172a", letterSpacing: "-1px" }}>
              Park <span style={{ color: "#0A66C2" }}>Noktam</span>
            </h1>
            <p style={{ fontSize: 15, color: "#64748b", marginTop: 4, fontWeight: 500, letterSpacing: "0.5px", marginBottom: 30 }}>
              Park Etmenin En Kolay Yolu
            </p>
            
            {animationDone && (
              <button 
                onClick={handleSplashContinue}
                style={{
                  background: "linear-gradient(135deg, #0f172a, #334155)",
                  color: "white", padding: "14px 32px", borderRadius: 30,
                  fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8,
                  boxShadow: "0 10px 25px rgba(15,23,42,0.2)",
                  animation: "btnReveal 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards"
                }}
              >
                Tanıtımı Gör
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* --- ANA EKRAN BÖLÜMÜ --- */}
      <div style={{ minHeight: "100dvh", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
        {/* Background */}
        <div className="welcome-bg">
          <div className="welcome-orb-1" />
          <div className="welcome-orb-2" />
        </div>

        {/* Merkezi 3D Glass Kart */}
        <div 
          style={{
            maxWidth: 420, width: "100%",
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(24px) saturate(120%)",
            border: "1px solid rgba(255,255,255,1)",
            borderRadius: 32,
            padding: "36px 24px",
            boxShadow: "0 24px 60px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,1) inset",
            animation: "cardEntrance 0.8s cubic-bezier(0.16, 1, 0.3, 1) both",
            animationDelay: showSplash ? "4.2s" : "0s",
            position: "relative", zIndex: 10
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ width: 56, height: 56, background: "linear-gradient(135deg, #0A66C2, #1e88e5)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 12px 24px rgba(10,102,194,0.3)" }}>
              <span className="material-symbols-outlined text-white" style={{ fontSize: 32, fontVariationSettings: "'FILL' 1" }}>local_parking</span>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", marginBottom: 8, letterSpacing: "-0.5px" }}>Şehri Keşfet,<br/>Kolayca Park Et</h2>
            <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6, fontWeight: 500, padding: "0 10px", marginBottom: 14 }}>
              <strong>Park Noktam</strong> ile tek hesapla hem park yeri arayabilir, hem de kendi otopark alanını yönetip kazanabilirsin.
            </p>
            {/* Dual role cards */}
            <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
              <div style={{
                flex: 1, borderRadius: 14, padding: "10px 12px",
                background: "linear-gradient(135deg, rgba(10,102,194,0.08), rgba(30,136,229,0.05))",
                border: "1px solid rgba(10,102,194,0.15)",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: "#0A66C2", fontVariationSettings: "'FILL' 1" }}>directions_car</span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#0A66C2" }}>Sürücü</div>
                  <div style={{ fontSize: 10, color: "#64748b", fontWeight: 500 }}>Park yeri bul &amp; rezervasyon yap</div>
                </div>
              </div>
              <div style={{
                flex: 1, borderRadius: 14, padding: "10px 12px",
                background: "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(147,51,234,0.05))",
                border: "1px solid rgba(124,58,237,0.15)",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: "#7c3aed", fontVariationSettings: "'FILL' 1" }}>storefront</span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#7c3aed" }}>Otopark Sahibi</div>
                  <div style={{ fontSize: 10, color: "#64748b", fontWeight: 500 }}>İlan ver &amp; kazanç yönet</div>
                </div>
              </div>
            </div>
          </div>

          {/* Özellikler Listesi */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
            {features.map((f, i) => (
              <button
                key={f.id}
                onClick={() => setActiveFeature(f.id)}
                className="feature-btn transition-all duration-300"
                style={{
                  background: "rgba(255,255,255,0.5)",
                  border: "1px solid rgba(0,0,0,0.04)",
                  borderRadius: 16, padding: "14px 16px",
                  display: "flex", alignItems: "center", gap: 14,
                  textAlign: "left", cursor: "pointer",
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                  background: `${f.color}15`, display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20, color: f.color, fontVariationSettings: "'FILL' 1" }}>{f.icon}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#1e293b" }}>{f.title}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginTop: 2 }}>{f.short}</div>
                </div>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#cbd5e1" }}>chevron_right</span>
              </button>
            ))}
          </div>

          {/* Bottom CTA */}
          <button
            onClick={() => router.push("/giris")}
            className="w-full active:scale-95 transition-transform"
            style={{
              background: "linear-gradient(135deg, #0A66C2, #1e88e5)",
              color: "white", borderRadius: 18, padding: "18px 0",
              fontWeight: 800, fontSize: 16, border: "none", cursor: "pointer",
              boxShadow: "0 12px 30px rgba(10,102,194,0.35), 0 1px 0 rgba(255,255,255,0.2) inset",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8
            }}
          >
            Hemen Başla
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>
          </button>
        </div>
      </div>

      {/* --- POPUP --- */}
      {openFeature && (
        <div 
          onClick={() => setActiveFeature(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              background: "rgba(255,255,255,0.95)", backdropFilter: "blur(30px)",
              width: "100%", maxWidth: 360, borderRadius: 28, padding: 30,
              boxShadow: "0 24px 60px rgba(0,0,0,0.15)",
              animation: "fadeUpIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: `${openFeature.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: openFeature.color }}>
                <span className="material-symbols-outlined" style={{ fontSize: 28, fontVariationSettings: "'FILL' 1" }}>{openFeature.icon}</span>
              </div>
              <button onClick={() => setActiveFeature(null)} style={{ background: "#f1f5f9", border: "none", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <span className="material-symbols-outlined text-slate-500" style={{ fontSize: 18 }}>close</span>
              </button>
            </div>
            
            <h3 style={{ fontSize: 20, fontWeight: 900, color: "#0f172a", marginBottom: 12 }}>{openFeature.title}</h3>
            <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6, fontWeight: 500, marginBottom: 8 }}>{openFeature.detail}</p>
          </div>
        </div>
      )}
    </>
  );
}
