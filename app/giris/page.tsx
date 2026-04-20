"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

// SVG Icons — No font dependency
const IconParking = () => (
  <svg viewBox="0 0 100 100" width="32" height="32">
    <path d="M30,35 L45,20 L55,30 Z" fill="#0A66C2" />
    <text x="50" y="68" textAnchor="middle" fontFamily="Manrope" fontWeight="900" fontSize="42" fill="#ffb703" letterSpacing="-1">Park</text>
    <text x="50" y="86" textAnchor="middle" fontFamily="Inter" fontWeight="700" fontSize="12" fill="#475569" letterSpacing="2">NOKTAM</text>
  </svg>
);
const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="M2 8l10 6 10-6"/>
  </svg>
);
const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconBolt = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9 12l2 2 4-4"/>
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await signIn("credentials", { redirect: false, email, password });
      if (res?.error) {
        toast.error("Geçersiz e-posta veya şifre.");
      } else {
        toast.success("Hoş geldiniz!");
        router.push("/ana-sayfa");
        router.refresh();
      }
    } catch {
      toast.error("Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page--with-splash">
      {/* Splash Screen */}
      <div className="splash-screen">
        <div className="splash-logo-box">
          <IconParking />
        </div>
        <h1 className="splash-title">Park <span>Noktam</span></h1>
        <div className="splash-line" />
        <p className="splash-subtitle">Güvenli ve Hızlı Park Yeri Çözümü</p>

        <div className="splash-dots">
          <div className="splash-dot active" />
          <div className="splash-dot" />
          <div className="splash-dot" />
        </div>

        <div className="splash-footer">RELIABLE • MODERN • URBAN</div>
      </div>

      {/* Animated Background */}
      <div className="auth-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="grid-overlay" />
      </div>

      {/* Logo */}
      <div className="auth-logo">
        <div className="logo-icon">
          <IconParking />
        </div>
        <span className="logo-text">Park <span>Noktam</span></span>
      </div>

      {/* Main Card */}
      <div className="auth-card">
        <div className="auth-card-inner">
          <div className="auth-header">
            <h1 className="auth-title">Tekrar Hoş Geldiniz</h1>
            <p className="auth-subtitle">Hesabınıza giriş yapın ve hemen park yeri bulun</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label className="input-label">E-Posta</label>
              <div className="input-wrapper">
                <span className="input-icon"><IconMail /></span>
                <input name="email" type="email" required placeholder="ornek@mail.com" className="auth-input" />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Şifre</label>
              <div className="input-wrapper">
                <span className="input-icon"><IconLock /></span>
                <input name="password" type="password" required placeholder="••••••••" className="auth-input" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="auth-btn">
              <span className="btn-shimmer" />
              {loading ? (
                <>
                  <span className="loading-dot" />
                  <span className="loading-dot" />
                  <span className="loading-dot" />
                </>
              ) : (
                <>
                  Giriş Yap
                  <IconArrow />
                </>
              )}
            </button>
          </form>

          <div className="auth-divider"><span>veya</span></div>

          <div className="auth-features">
            <div className="feature-chip"><IconShield /> Güvenli</div>
            <div className="feature-chip"><IconBolt /> Hızlı</div>
            <div className="feature-chip"><IconCheck /> Doğrulanmış</div>
          </div>

          <p className="auth-switch">
            Hesabınız yok mu?{" "}
            <Link href="/kayit" className="auth-link">Kayıt Ol →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
