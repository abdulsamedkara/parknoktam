"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Rezervasyon {
  id: string;
  totalPrice: number;
  startDateTime: string;
  endDateTime: string;
  vehiclePlate: string;
  status: string;
  spot: {
    id: string;
    title: string;
    address: string;
    photos: string;
    pricePerHour?: number;
  };
  payment: { status: string } | null;
  surveys?: { id: string }[];
}

type Tab = "aktif" | "yaklaşan" | "geçmiş";

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  CONFIRMED: { label: "Onaylandı", color: "#059669", bg: "rgba(5,150,105,0.10)" },
  ACTIVE:    { label: "Aktif",     color: "#0A66C2", bg: "rgba(10,102,194,0.10)" },
  PENDING:   { label: "Bekliyor",  color: "#d97706", bg: "rgba(217,119,6,0.10)" },
  COMPLETED: { label: "Tamamlandı",color: "#64748b", bg: "rgba(100,116,139,0.10)" },
  CANCELLED: { label: "İptal",     color: "#ef4444", bg: "rgba(239,68,68,0.10)" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("tr-TR", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

function RezervasjonCard({ r, onRefresh }: { r: Rezervasyon; onRefresh: () => void }) {
  const router = useRouter();
  const st = statusConfig[r.status] ?? statusConfig.CONFIRMED;
  let photo = "";
  try { photo = JSON.parse(r.spot.photos)[0] ?? ""; } catch {}

  const now = new Date();
  const isActive = r.status === "CONFIRMED" && new Date(r.startDateTime) <= now && new Date(r.endDateTime) > now;
  const isUpcoming = r.status === "CONFIRMED" && new Date(r.startDateTime) > now;
  const isPast = r.status === "COMPLETED" || r.status === "CANCELLED" || new Date(r.endDateTime) <= now;
  const needsSurvey = isPast && r.status !== "CANCELLED" && (!r.surveys || r.surveys.length === 0);

  // Park uzatma state'i
  const [showExtend, setShowExtend] = useState(false);
  const [extraHours, setExtraHours] = useState(1);
  const [extending, setExtending] = useState(false);
  const [extendMsg, setExtendMsg] = useState("");

  async function handleExtend() {
    setExtending(true);
    setExtendMsg("");
    try {
      const res = await fetch(`/api/rezervasyon/${r.id}/uzat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extraHours }),
      });
      const data = await res.json();
      if (!res.ok) {
        setExtendMsg(data.error ?? "Bir hata oluştu.");
      } else {
        setExtendMsg(`✓ Süre uzatıldı! Yeni bitiş: ${formatDate(data.newEndDateTime)}`);
        setTimeout(() => { setShowExtend(false); setExtendMsg(""); onRefresh(); }, 2000);
      }
    } catch {
      setExtendMsg("Sunucu hatası.");
    }
    setExtending(false);
  }

  // spot fiyatı için pricePerHour gerekiyor — API'den gelmiyorsa 0
  const pricePerHour = (r.spot as any).pricePerHour ?? 0;

  return (
    <div className="relative">
      {/* Ana kart */}
      <div
        className="flex items-center gap-3"
        style={{
          background: "rgba(255,255,255,0.82)",
          backdropFilter: "blur(16px)",
          borderRadius: showExtend ? "20px 20px 0 0" : "20px",
          border: "1px solid rgba(255,255,255,0.9)",
          boxShadow: "0 6px 20px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)",
          padding: "14px",
        }}
      >
        {/* Thumbnail */}
        <div
          onClick={() => router.push(`/bilet/${r.id}`)}
          style={{ width: 64, height: 64, borderRadius: "14px", overflow: "hidden", background: "#e2e8f0", flexShrink: 0, cursor: "pointer" }}
        >
          {photo
            ? <img src={photo} alt={r.spot.title} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-300" style={{ fontSize: "32px", fontVariationSettings: "'FILL' 1" }}>local_parking</span>
              </div>
          }
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0" onClick={() => router.push(`/bilet/${r.id}`)} style={{ cursor: "pointer" }}>
          <p className="font-bold text-slate-800 text-[13px] truncate">{r.spot.title}</p>
          <p className="text-slate-400 text-[10px] mt-0.5">{formatDate(r.startDateTime)} → {formatDate(r.endDateTime)}</p>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <span style={{ background: st.bg, color: st.color, borderRadius: "8px", padding: "2px 7px", fontSize: "10px", fontWeight: 800 }}>{st.label}</span>
            <span className="text-slate-600 font-bold text-[11px]">₺{r.totalPrice}</span>
            {isActive && <span style={{ background: "rgba(10,102,194,0.10)", color: "#0A66C2", borderRadius: "8px", padding: "2px 7px", fontSize: "10px", fontWeight: 800 }}>⏱ Aktif</span>}
            {r.surveys && r.surveys.length > 0 && <span style={{ background: "rgba(16,185,129,0.10)", color: "#10b981", borderRadius: "8px", padding: "2px 7px", fontSize: "10px", fontWeight: 800 }}>⭐ Anketli</span>}
          </div>
        </div>

        {/* Uzat butonu (aktif veya yaklaşan rezervasyonlarda) */}
        {(isActive || isUpcoming) && (
          <button
            onClick={() => setShowExtend(v => !v)}
            className="shrink-0 active:scale-90 transition-transform"
            style={{
              background: showExtend ? "#0A66C2" : "rgba(10,102,194,0.10)",
              color: showExtend ? "white" : "#0A66C2",
              borderRadius: "12px",
              padding: "8px 10px",
              fontSize: "10px",
              fontWeight: 800,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "2px",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>more_time</span>
            <span>Uzat</span>
          </button>
        )}

        {/* Sadece detay oku için ok (uzat yoksa) */}
        {!isActive && !isUpcoming && (
          <span className="material-symbols-outlined text-slate-300 shrink-0" style={{ fontSize: "20px" }}>chevron_right</span>
        )}
      </div>

      {/* Park Uzatma Paneli */}
      {showExtend && (
        <div style={{
          background: "rgba(239,246,255,0.98)",
          backdropFilter: "blur(16px)",
          borderRadius: "0 0 20px 20px",
          border: "1px solid rgba(10,102,194,0.15)",
          borderTop: "none",
          padding: "14px 16px",
          boxShadow: "0 8px 20px rgba(10,102,194,0.10)",
        }}>
          <p className="text-[11px] font-bold text-[#0A66C2] mb-3">Kaç saat uzatmak istiyorsunuz?</p>
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => setExtraHours(h => Math.max(1, h - 1))}
              className="w-9 h-9 rounded-full bg-white text-slate-600 font-black text-lg flex items-center justify-center active:scale-90 transition-transform shadow-sm">−</button>
            <div className="flex-1 text-center">
              <span className="font-black text-slate-800 text-2xl">{extraHours}</span>
              <span className="text-slate-400 text-sm font-bold ml-1">saat</span>
              {pricePerHour > 0 && (
                <p className="text-[10px] text-slate-400 mt-0.5">≈ ₺{(extraHours * pricePerHour).toFixed(0)} ek ücret</p>
              )}
            </div>
            <button onClick={() => setExtraHours(h => Math.min(12, h + 1))}
              className="w-9 h-9 rounded-full bg-[#0A66C2] text-white font-black text-lg flex items-center justify-center active:scale-90 transition-transform shadow-sm">+</button>
          </div>
          {extendMsg && (
            <p className={`text-[11px] font-semibold text-center mb-2 ${extendMsg.startsWith("✓") ? "text-emerald-600" : "text-red-500"}`}>{extendMsg}</p>
          )}
          <button
            onClick={handleExtend}
            disabled={extending}
            className="w-full py-2.5 rounded-xl font-bold text-[13px] text-white active:scale-95 transition-transform disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#0A66C2,#1e88e5)" }}
          >
            {extending ? "İşleniyor..." : `${extraHours} Saat Uzat`}
          </button>
        </div>
      )}

      {/* Anket Butonu */}
      {needsSurvey && !showExtend && (
        <Link
          href={`/anket/${r.id}`}
          className="flex items-center justify-center gap-1 mx-2 p-2 active:scale-95 transition-transform"
          style={{
            background: "linear-gradient(135deg,#f59e0b,#d97706)",
            color: "white", borderRadius: "0 0 16px 16px",
            boxShadow: "0 4px 12px rgba(217,119,6,0.2)",
            marginTop: "-10px", zIndex: -1, position: "relative"
          }}
        >
          <span className="material-symbols-outlined text-[14px]">redeem</span>
          <span className="font-bold text-[11px]">Anketi Doldur, +20 Kredi Kazan! 🎁</span>
        </Link>
      )}
    </div>
  );
}

export default function RezervasyonlarimPage() {
  const [list, setList] = useState<Rezervasyon[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("aktif");

  const loadData = () => {
    setLoading(true);
    fetch("/api/rezervasyon")
      .then(r => r.json())
      .then(d => { setList(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const now = new Date();

  const tabData: Record<Tab, Rezervasyon[]> = {
    // Onaylı + başlamış + bitmemiş
    aktif: list.filter(r =>
      r.status === "CONFIRMED" &&
      new Date(r.startDateTime) <= now &&
      new Date(r.endDateTime) > now
    ),
    // Onaylı + henüz başlamamış (gelecek)
    "yaklaşan": list.filter(r =>
      r.status === "CONFIRMED" &&
      new Date(r.startDateTime) > now
    ),
    // Süresi dolmuş VEYA iptal/tamamlandı
    geçmiş: list.filter(r =>
      r.status === "COMPLETED" ||
      r.status === "CANCELLED" ||
      new Date(r.endDateTime) <= now
    ),
  };

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "aktif",    label: "Aktif",    icon: "timer" },
    { key: "yaklaşan", label: "Yaklaşan", icon: "upcoming" },
    { key: "geçmiş",   label: "Geçmiş",  icon: "history" },
  ];

  return (
    <div className="min-h-screen pb-[100px]" style={{ background: "linear-gradient(160deg,#e8f0fe 0%,#f0f5ff 40%,#fafbff 100%)" }}>

      {/* Header */}
      <div className="px-5 pt-14 pb-4">
        <h1 className="font-black text-slate-800 text-2xl mb-0.5">Biletlerim</h1>
        <p className="text-slate-400 text-sm">Tüm park rezervasyonların</p>
      </div>

      {/* Tabs */}
      <div className="px-5 mb-5">
        <div style={{
          background: "rgba(255,255,255,0.70)",
          backdropFilter: "blur(12px)",
          borderRadius: "18px",
          border: "1px solid rgba(255,255,255,0.85)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
          padding: "4px",
          display: "flex",
          gap: "2px",
        }}>
          {tabs.map(t => {
            const isActive = tab === t.key;
            const count = tabData[t.key].length;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-all duration-200 active:scale-95"
                style={{
                  background: isActive ? "linear-gradient(135deg,#0A66C2,#1e88e5)" : "transparent",
                  borderRadius: "14px",
                  boxShadow: isActive ? "0 4px 16px rgba(10,102,194,0.30)" : "none",
                }}
              >
                <span className="material-symbols-outlined" style={{
                  fontSize: "18px",
                  color: isActive ? "white" : "#94a3b8",
                  fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                }}>{t.icon}</span>
                <span style={{ fontSize: "10px", fontWeight: 800, color: isActive ? "white" : "#94a3b8" }}>
                  {t.label}
                  {count > 0 && ` (${count})`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 flex flex-col gap-3">
        {loading && (
          <div className="flex justify-center py-16">
            <span className="material-symbols-outlined text-[#0A66C2] animate-spin" style={{ fontSize: "36px" }}>refresh</span>
          </div>
        )}

        {!loading && tabData[tab].length === 0 && (
          <div className="flex flex-col items-center py-16 gap-4">
            <div style={{
              width: 80, height: 80, borderRadius: "24px",
              background: "rgba(10,102,194,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span className="material-symbols-outlined text-[#0A66C2]" style={{ fontSize: "40px", fontVariationSettings: "'FILL' 1" }}>confirmation_number</span>
            </div>
            <div className="text-center">
              <p className="font-bold text-slate-700 text-base">Rezervasyon bulunamadı</p>
              <p className="text-slate-400 text-sm mt-1">
                {tab === "aktif"
                  ? "Aktif rezervasyonun yok"
                  : tab === "yaklaşan"
                  ? "Bekleyen rezervasyon yok"
                  : "Geçmiş rezervasyon yok"}
              </p>
            </div>
            <Link href="/ara" style={{
              background: "linear-gradient(135deg,#0A66C2,#1e88e5)",
              color: "white", borderRadius: "16px",
              padding: "12px 24px",
              fontWeight: 800, fontSize: "14px",
              boxShadow: "0 6px 20px rgba(10,102,194,0.30)",
            }}>
              Park Yeri Bul
            </Link>
          </div>
        )}

        {!loading && tabData[tab].map(r => (
          <RezervasjonCard key={r.id} r={r} onRefresh={loadData} />
        ))}
      </div>
    </div>
  );
}
