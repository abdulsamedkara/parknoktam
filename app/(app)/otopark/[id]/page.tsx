import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import "./otopark-detail.css";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import FavoriteButton from "./FavoriteButton";

const parsePhotos = (photosStr: string) => {
  try { return JSON.parse(photosStr); } catch { return []; }
};

export default async function OtoparkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const spot = await prisma.parkingSpot.findUnique({ where: { id } });
  if (!spot) return notFound();

  // Kullanıcı giriş yapmışsa favori durumunu kontrol et
  let isFavorited = false;
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (user) {
      const fav = await prisma.favorite.findUnique({
        where: { userId_spotId: { userId: user.id, spotId: id } },
      });
      isFavorited = !!fav;
    }
  }

  const photos = parsePhotos(spot.photos);
  const heroImage = photos[0] || "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&q=80&w=800";

  // Gerçek anket verilerinden hesaplanan skorlar
  const quality = {
    rating:       spot.rating,
    reviewCount:  spot.reviewCount,
    dustPct:      Math.round(spot.dustScore * 100),
    moisturePct:  Math.round(spot.moistureScore * 100),
    accessPct:    Math.round(spot.accessEaseScore * 100),
    sunPct:       Math.round(spot.sunExposureScore * 100),
  };

  const hasReviews = quality.reviewCount > 0;

  return (
    <div className="detail-page">
      {/* GALLERY */}
      <div className="detail-gallery">
        <div className="top-bar-overlay">
          <Link href="/ara" className="back-btn">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <FavoriteButton spotId={spot.id} initialFavorited={isFavorited} />
        </div>
        <img src={heroImage} alt={spot.title} />
      </div>

      {/* CONTENT */}
      <div className="detail-content">
        <div className="detail-header">
          <div>
            <h1 className="detail-title">{spot.title}</h1>
            <div className="detail-address">
              <span className="material-symbols-outlined" style={{fontSize:'16px'}}>location_on</span>
              {spot.address}
            </div>
          </div>
          <div className="detail-price-box">
            <span className="val">₺{spot.pricePerHour}</span>
            <span className="unit">Saatlik</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-6">
          <span className="text-amber-500">⭐ {spot.rating.toFixed(1)}</span>
          <span className="text-slate-400">({spot.reviewCount} Değerlendirme)</span>
        </div>

        {/* FEATURES */}
        <div className="features-list">
          {spot.hasCCTV && (
            <div className="f-badge">
              <span className="material-symbols-outlined" style={{fontSize:'18px'}}>videocam</span> Kameralı
            </div>
          )}
          <div className="f-badge text-primary">
            <span className="material-symbols-outlined" style={{fontSize:'18px'}}>storefront</span>
            {spot.spotType === "kapali" ? "Kapalı Alan" : "Açık Alan"}
          </div>
          {spot.hasEVCharger && (
            <div className="f-badge" style={{color:'#d97706'}}>
              <span className="material-symbols-outlined" style={{fontSize:'18px'}}>electric_car</span> EV Şarj
            </div>
          )}
          {spot.isHandicapped && (
            <div className="f-badge">
              <span className="material-symbols-outlined" style={{fontSize:'18px'}}>accessible</span> Engelli
            </div>
          )}
        </div>

        {/* QUALITY STATS (Anket Verisinden) */}
        <div className="quality-section">
          <div className="quality-title">
            <span className="material-symbols-outlined">analytics</span>
            Park Kalitesi
            {hasReviews ? (
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", marginLeft: "8px" }}>
                ({quality.reviewCount} kullanıcı verisi)
              </span>
            ) : (
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8", marginLeft: "8px" }}>Henüz değerlendirme yok</span>
            )}
          </div>
          <div className="quality-grid">
            <div className="q-card">
              <div className="q-card-header"><span>Güneş Riski</span></div>
              {hasReviews ? (
                <div className="q-card-val" style={{ color: quality.sunPct > 50 ? "#d97706" : "#059669" }}>
                  {quality.sunPct > 50 ? `%${quality.sunPct} Güneş Alır` : `%${100 - quality.sunPct} Gölge`}
                </div>
              ) : <div className="q-card-val text-slate-400">Bilgi Yok</div>}
            </div>

            <div className="q-card">
              <div className="q-card-header"><span>Toz Riski</span></div>
              {hasReviews ? (
                <div className="q-card-val" style={{ color: quality.dustPct > 50 ? "#ef4444" : "#059669" }}>
                  {quality.dustPct > 50 ? `Yüksek (%${quality.dustPct})` : `Düşük (%${quality.dustPct})`}
                </div>
              ) : <div className="q-card-val text-slate-400">Bilgi Yok</div>}
            </div>

            <div className="q-card">
              <div className="q-card-header"><span>Nem Riski</span></div>
              {hasReviews ? (
                <div className="q-card-val" style={{ color: quality.moisturePct > 50 ? "#3b82f6" : "#059669" }}>
                  {quality.moisturePct > 50 ? `Yüksek (%${quality.moisturePct})` : `Düşük (%${quality.moisturePct})`}
                </div>
              ) : <div className="q-card-val text-slate-400">Bilgi Yok</div>}
            </div>

            <div className="q-card">
              <div className="q-card-header"><span>Giriş Kolaylığı</span></div>
              {hasReviews ? (
                <div className="q-card-val" style={{ color: quality.accessPct > 70 ? "#059669" : "#d97706" }}>
                  {quality.accessPct > 70 ? `Kolay (%${quality.accessPct})` : `Orta (%${quality.accessPct})`}
                </div>
              ) : <div className="q-card-val text-slate-400">Bilgi Yok</div>}
            </div>
          </div>
        </div>

        {/* AVAILABILITY MOCK */}
        <div className="av-card mt-6">
          <div className="av-card-title">Bugün Uygunluk Durumu</div>
          <div className="av-hours-bar">
            {/* simple visual repr: 00 to 09 booked, 09 to 18 avail, 18 to 24 booked */}
            <div className="block booked" style={{width: '37.5%'}}></div>
            <div className="block avail" style={{width: '37.5%'}}></div>
            <div className="block booked" style={{width: '25%'}}></div>
          </div>
          <div className="av-labels">
            <span>00:00</span>
            <span>09:00</span>
            <span>18:00</span>
            <span>24:00</span>
          </div>
        </div>
        
        {/* Description */}
        {spot.description && (
          <div className="mt-8">
            <h3 className="font-extrabold text-slate-800 mb-2">Açıklama</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{spot.description}</p>
          </div>
        )}

      </div>

      <div className="action-footer">
        <Link href={`/rezervasyon/${spot.id}`} className="rent-btn">
          Hemen Kirala (₺{spot.pricePerHour}/saat)
        </Link>
      </div>
    </div>
  );
}
