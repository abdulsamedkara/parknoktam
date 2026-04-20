"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

const IconParking = () => (
  <svg viewBox="0 0 100 100" width="32" height="32">
    <path d="M30,35 L45,20 L55,30 Z" fill="#0A66C2" />
    <text x="50" y="68" textAnchor="middle" fontFamily="Manrope" fontWeight="900" fontSize="42" fill="#ffb703" letterSpacing="-1">Park</text>
    <text x="50" y="86" textAnchor="middle" fontFamily="Inter" fontWeight="700" fontSize="12" fill="#475569" letterSpacing="2">NOKTAM</text>
  </svg>
);
const IconPerson = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconPhone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
  </svg>
);
const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 8l10 6 10-6"/>
  </svg>
);
const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconBadge = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 3H8l-1 4h10z"/>
  </svg>
);
const IconArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Kayıt olurken bir hata oluştu.");
      } else {
        toast.success("Hesabınız oluşturuldu!");
        router.push("/giris");
      }
    } catch {
      toast.error("Sunucu ile iletişim kurulamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="grid-overlay" />
      </div>

      <div className="auth-logo">
        <div className="logo-icon"><IconParking /></div>
        <span className="logo-text">Park <span>Noktam</span></span>
      </div>

      <div className="auth-card auth-card--register">
        <div className="auth-card-inner">

          <div className="auth-header">
            <h1 className="auth-title">Hesap Oluştur</h1>
            <p className="auth-subtitle">Ücretsiz kayıt ol, park sorununu çöz</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-row">
              <div className="input-group">
                <label className="input-label">Ad Soyad</label>
                <div className="input-wrapper">
                  <span className="input-icon"><IconPerson /></span>
                  <input name="name" type="text" required placeholder="Adınız Soyadınız" className="auth-input" />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Telefon</label>
                <div className="input-wrapper">
                  <span className="input-icon"><IconPhone /></span>
                  <input name="phone" type="tel" required placeholder="+90 5XX" className="auth-input" />
                </div>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">E-Posta</label>
              <div className="input-wrapper">
                <span className="input-icon"><IconMail /></span>
                <input name="email" type="email" required placeholder="ornek@mail.com" className="auth-input" />
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label className="input-label">TC Kimlik No</label>
                <div className="input-wrapper">
                  <span className="input-icon"><IconBadge /></span>
                  <input name="tcKimlik" type="text" required pattern="\d{11}" minLength={11} maxLength={11} placeholder="11 hane" className="auth-input" />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Şifre</label>
                <div className="input-wrapper">
                  <span className="input-icon"><IconLock /></span>
                  <input name="password" type="password" required placeholder="••••••" className="auth-input" />
                </div>
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label className="input-label">Doğum Tarihi</label>
                <div className="input-wrapper input-wrapper--no-icon">
                  <input name="birthDate" type="date" required className="auth-input auth-input--no-pl" />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Cinsiyet</label>
                <div className="input-wrapper input-wrapper--no-icon">
                  <select name="gender" required className="auth-input auth-input--no-pl">
                    <option value="">Seç...</option>
                    <option value="kadin">Kadın</option>
                    <option value="erkek">Erkek</option>
                  </select>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="auth-btn">
              <span className="btn-shimmer" />
              {loading ? (
                <><span className="loading-dot" /><span className="loading-dot" /><span className="loading-dot" /></>
              ) : (
                <>Kayıt Ol <IconArrow /></>
              )}
            </button>
          </form>

          <p className="auth-switch">
            Zaten hesabınız var mı?{" "}
            <Link href="/giris" className="auth-link">Giriş Yap →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
