"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Rezervasyon {
  id: string;
  totalPrice: number;
  startDateTime: string;
  endDateTime: string;
  vehiclePlate: string;
  vehicleModel: string;
  status: string;
  qrCode: string;
  spot: {
    id: string;
    title: string;
    address: string;
    lat: number;
    lng: number;
  };
  user: { name: string };
  payment: { cardLast4: string; status: string } | null;
  surveys?: any[];
}

function formatDT(iso: string) {
  return new Date(iso).toLocaleString("tr-TR", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

type Phase = "waiting" | "active" | "done";
interface CountdownState { label: string; time: string; phase: Phase; remainingMs: number; }

function fmt(ms: number) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function useSmartCountdown(startISO: string, endISO: string): CountdownState {
  const [state, setState] = useState<CountdownState>({ label: "", time: "", phase: "waiting", remainingMs: 0 });

  useEffect(() => {
    // Rezervasyon henüz yüklenmediyse çalışma
    if (!startISO || !endISO) return;

    let timerId: ReturnType<typeof setInterval>;

    function tick() {
      const now = Date.now();
      const start = new Date(startISO).getTime();
      const end = new Date(endISO).getTime();

      if (now < start) {
        setState({ label: "Başlamasına", time: fmt(start - now), phase: "waiting", remainingMs: start - now });
      } else if (now < end) {
        setState({ label: "Kalan Süre", time: fmt(end - now), phase: "active", remainingMs: end - now });
      } else {
        clearInterval(timerId);
        setState({ label: "Tamamlandı", time: "00:00:00", phase: "done", remainingMs: 0 });
      }
    }

    tick();
    timerId = setInterval(tick, 1000);
    return () => clearInterval(timerId);
  }, [startISO, endISO]);

  return state;
}

export default function BiletPage({ params }: { params: Promise<{ rezervasyonId: string }> }) {
  const [rezervasyon, setRezservasyon] = useState<Rezervasyon | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showCancelPolicyModal, setShowCancelPolicyModal] = useState(false);
  const [extending, setExtending] = useState(false);

  const countdown = useSmartCountdown(
    rezervasyon?.startDateTime ?? "",
    rezervasyon?.endDateTime ?? "",
  );

  useEffect(() => {
    params.then(p => {
      fetch(`/api/rezervasyon/${p.rezervasyonId}`)
        .then(r => r.json())
        .then(async (d: Rezervasyon) => {
          setRezservasyon(d);
          const QRCode = (await import("qrcode")).default;
          const url = await QRCode.toDataURL(
            JSON.stringify({ id: d.id, plate: d.vehiclePlate, qr: d.qrCode }),
            { width: 220, margin: 1, color: { dark: "#0A66C2", light: "#ffffff" } }
          );
          setQrDataUrl(url);
        });
    });
  }, [params]);

  if (!rezervasyon) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <span className="material-symbols-outlined text-[#0A66C2] animate-spin" style={{ fontSize: "40px" }}>refresh</span>
          <p className="text-slate-400 mt-2 text-sm">Bilet yükleniyor...</p>
        </div>
      </div>
    );
  }

  const showTimer = rezervasyon.status === "CONFIRMED" && new Date(rezervasyon.endDateTime) > new Date();
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${rezervasyon.spot.lat},${rezervasyon.spot.lng}`;

  const handleCancel = () => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-slate-800">
          Rezervasyonunuz iptal edilecek. İptal koşullarına göre iade işlemi cüzdanınıza yansıtılacaktır. Emin misiniz?
        </p>
        <div className="flex gap-2">
          <button className="flex-1 bg-red-500 text-white py-1.5 rounded-lg text-xs font-bold" onClick={async () => {
             toast.dismiss(t.id);
             toast.loading("İptal ediliyor...", { id: "cancel-toast" });
             try {
                const res = await fetch(`/api/rezervasyon/${rezervasyon.id}/iptal`, { method: "POST" });
                if(res.ok) {
                  setRezservasyon({ ...rezervasyon, status: "CANCELLED" });
                  toast.success("Rezervasyon başarıyla iptal edildi.", { id: "cancel-toast" });
                } else {
                  const err = await res.json();
                  toast.error(err.error || "İptal işlemi başarısız.", { id: "cancel-toast" });
                }
              } catch {
                toast.error("Bağlantı hatası", { id: "cancel-toast" });
              }
          }}>İptal Et</button>
          <button className="flex-1 bg-slate-100 text-slate-600 py-1.5 rounded-lg text-xs font-bold" onClick={() => toast.dismiss(t.id)}>Vazgeç</button>
        </div>
      </div>
    ), { duration: 6000, id: "cancel-confirm" });
  };

  const handleExtend = async (extraHours: number) => {
    setExtending(true);
    try {
      const res = await fetch(`/api/rezervasyon/${rezervasyon!.id}/uzat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extraHours }),
      });
      const data = await res.json();
      if (res.ok) {
        setRezservasyon({ ...rezervasyon!, endDateTime: data.newEndDateTime });
        setShowExtendModal(false);
        toast.success(`+${extraHours} saat eklendi! Ek ücret: ₺${data.extraPrice}`);
      } else {
        toast.error(data.error || "Uzatma başarısız.");
      }
    } catch {
      toast.error("Bağlantı hatası.");
    } finally {
      setExtending(false);
    }
  };

  const handleEarlyCexit = () => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-slate-800">
          Park alanından erken çıkış yapıyorsunuz. Rezervasyon bitirilecek ve fiyat fiili süreye göre hesaplanacaktır.
        </p>
        <div className="flex gap-2">
          <button className="flex-1 bg-orange-500 text-white py-1.5 rounded-lg text-xs font-bold" onClick={async () => {
            toast.dismiss(t.id);
            toast.loading("İşleniyor...", { id: "early-exit" });
            try {
              const res = await fetch(`/api/rezervasyon/${rezervasyon!.id}/erken-cik`, { method: "POST" });
              const data = await res.json();
              if (res.ok) {
                setRezservasyon({ ...rezervasyon!, status: "COMPLETED", endDateTime: data.newEndDateTime });
                toast.success(`Erken çıkış yapıldı. Yeni tutar: ₺${data.newPrice}`, { id: "early-exit" });
              } else {
                toast.error(data.error || "İşlem başarısız.", { id: "early-exit" });
              }
            } catch {
              toast.error("Bağlantı hatası.", { id: "early-exit" });
            }
          }}>Evet, Erken Çık</button>
          <button className="flex-1 bg-slate-100 text-slate-600 py-1.5 rounded-lg text-xs font-bold" onClick={() => toast.dismiss(t.id)}>Vazgeç</button>
        </div>
      </div>
    ), { duration: 8000, id: "early-exit-confirm" });
  };

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    CONFIRMED: { label: "Onaylandı", color: "#059669", bg: "rgba(5,150,105,0.10)" },
    ACTIVE:    { label: "Aktif",     color: "#0A66C2", bg: "rgba(10,102,194,0.10)" },
    PENDING:   { label: "Bekliyor",  color: "#d97706", bg: "rgba(217,119,6,0.10)" },
    COMPLETED: { label: "Tamamlandı",color: "#64748b", bg: "rgba(100,116,139,0.10)" },
    CANCELLED: { label: "İptal",     color: "#ef4444", bg: "rgba(239,68,68,0.10)" },
  };
  const st = statusConfig[rezervasyon.status] ?? statusConfig.CONFIRMED;

  return (
    <div className="min-h-screen pb-[100px]" style={{ background: "linear-gradient(160deg,#e8f0fe 0%,#f0f5ff 40%,#fafbff 100%)" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/rezervasyonlarim" className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-sm active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-slate-700" style={{ fontSize: "22px" }}>arrow_back</span>
          </Link>
          <div>
            <h1 className="font-black text-slate-800 text-lg">Dijital Bilet</h1>
            <p className="text-slate-400 text-xs">{rezervasyon.id.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>
        <span style={{
          background: st.bg, color: st.color,
          borderRadius: "20px", padding: "5px 12px",
          fontSize: "12px", fontWeight: 800,
        }}>{st.label}</span>
      </div>

      {/* Ticket Card */}
      <div className="px-5 mb-4">
        <div style={{
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(20px)",
          borderRadius: "28px",
          border: "1px solid rgba(255,255,255,0.95)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,1)",
          overflow: "hidden",
        }}>
          {/* Top blue stripe */}
          <div style={{ background: "linear-gradient(135deg,#0A66C2,#1e88e5)", padding: "20px" }}>
            <p className="text-blue-200 text-xs font-bold mb-1">{rezervasyon.spot.title}</p>
            <p className="text-white/70 text-xs">{rezervasyon.spot.address}</p>
          </div>

          {/* Dashed separator */}
          <div className="flex items-center px-4">
            <div className="w-5 h-5 rounded-full bg-[#f0f5ff] -ml-7" />
            <div className="flex-1 border-t-2 border-dashed border-slate-200 mx-2" />
            <div className="w-5 h-5 rounded-full bg-[#f0f5ff] -mr-7" />
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center py-5">
            {qrDataUrl ? (
              <div style={{
                background: "white", borderRadius: "20px", padding: "12px",
                boxShadow: "0 4px 20px rgba(10,102,194,0.15)",
              }}>
                <img src={qrDataUrl} alt="QR Kod" width={180} height={180} />
              </div>
            ) : (
              <div className="w-44 h-44 rounded-2xl bg-slate-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-300" style={{ fontSize: "48px" }}>qr_code_2</span>
              </div>
            )}
            <p className="text-slate-400 text-xs mt-3 font-medium">Park girişinde QR&apos;ı gösterin</p>
          </div>

          {/* Dashed separator */}
          <div className="flex items-center px-4">
            <div className="w-5 h-5 rounded-full bg-[#f0f5ff] -ml-7" />
            <div className="flex-1 border-t-2 border-dashed border-slate-200 mx-2" />
            <div className="w-5 h-5 rounded-full bg-[#f0f5ff] -mr-7" />
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-px bg-slate-100 border-t border-slate-100">
            {[
              { icon: "calendar_today", label: "Başlangıç", val: formatDT(rezervasyon.startDateTime) },
              { icon: "flag",           label: "Bitiş",     val: formatDT(rezervasyon.endDateTime) },
              { icon: "directions_car", label: "Plaka",     val: rezervasyon.vehiclePlate },
              { icon: "payments",       label: "Ücret",     val: `₺${rezervasyon.totalPrice}` },
            ].map(item => (
              <div key={item.label} className="bg-white p-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="material-symbols-outlined text-[#0A66C2]" style={{ fontSize: "15px" }}>{item.icon}</span>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                </div>
                <p className="text-slate-800 font-bold text-[13px] leading-tight">{item.val}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Smart Countdown */}
      {showTimer && (
        <div className="px-5 mb-4 animate-in fade-in duration-300">
          <div style={{
            background: countdown.phase === "waiting"
              ? "linear-gradient(135deg,#d97706,#f59e0b)"
              : (countdown.phase === "active" && countdown.remainingMs <= 15 * 60 * 1000)
              ? "linear-gradient(135deg,#ef4444,#dc2626)"
              : "linear-gradient(135deg,#059669,#10b981)",
            borderRadius: "20px",
            padding: "18px 20px",
            boxShadow: countdown.phase === "waiting"
              ? "0 8px 24px rgba(217,119,6,0.28)"
              : (countdown.phase === "active" && countdown.remainingMs <= 15 * 60 * 1000)
              ? "0 8px 24px rgba(239,68,68,0.30)"
              : "0 8px 24px rgba(5,150,105,0.25)",
            position: "relative",
            overflow: "hidden"
          }}>
            <div className="flex justify-between items-center relative z-10">
              <div>
                <p className="text-white/70 text-xs font-bold mb-1">
                  {countdown.phase === "active" && countdown.remainingMs <= 15 * 60 * 1000 
                    ? "Zaman Daralıyor!" 
                    : countdown.label}
                </p>
                <p className="text-white font-black text-3xl tracking-widest font-mono">{countdown.time}</p>
                {countdown.phase === "waiting" && (
                  <p className="text-white/60 text-[10px] mt-1 font-medium">
                    Başlangıç: {new Date(rezervasyon.startDateTime).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                )}
                {countdown.phase === "active" && countdown.remainingMs <= 15 * 60 * 1000 && (
                  <p className="text-white/80 text-[10px] mt-1 font-medium bg-red-900/30 inline-block px-2 py-0.5 rounded">
                    Sürenizin bitmesine 15 dakikadan az kaldı
                  </p>
                )}
              </div>
              <span className="material-symbols-outlined text-white/30" style={{ fontSize: "56px", fontVariationSettings: "'FILL' 1" }}>
                {countdown.phase === "waiting" ? "schedule" 
                  : (countdown.remainingMs <= 15 * 60 * 1000 ? "alarm_on" : "timer")}
              </span>
            </div>
            
            {/* Background decoration for urgent timer */}
            {countdown.phase === "active" && countdown.remainingMs <= 15 * 60 * 1000 && (
              <span className="material-symbols-outlined absolute -right-4 -bottom-8 text-white/10 animate-pulse" style={{ fontSize: "120px", fontVariationSettings: "'FILL' 1" }}>warning</span>
            )}
          </div>
        </div>
      )}

      {/* Survey Banner if Past and no survey */}
      {(!showTimer && (rezervasyon.status === "COMPLETED" || new Date(rezervasyon.endDateTime) <= new Date())) &&
       (!rezervasyon.surveys || rezervasyon.surveys.length === 0) && (
        <div className="px-5 mb-4">
          <Link
            href={`/anket/${rezervasyon.id}`}
            className="flex items-center gap-3 p-4 bg-white/80 active:scale-[0.98] transition-transform"
            style={{
              background: "linear-gradient(135deg,#f59e0b,#d97706)",
              borderRadius: "20px",
              boxShadow: "0 8px 24px rgba(217,119,6,0.30)",
            }}
          >
            <span className="material-symbols-outlined text-white" style={{ fontSize: "32px", fontVariationSettings: "'FILL' 1" }}>redeem</span>
            <div>
              <p className="text-white font-black text-sm">Geri Bildirim Paylaş</p>
              <p className="text-amber-100 text-[11px] leading-tight mt-0.5">Anketi doldurarak hemen anında 20 Kredi kazanabilirsin! 🎁</p>
            </div>
            <span className="material-symbols-outlined text-white/50 ml-auto">arrow_forward</span>
          </Link>
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-5 flex flex-col gap-3">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 active:scale-[0.98] transition-transform"
          style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(16px)",
            borderRadius: "18px",
            border: "1px solid rgba(255,255,255,0.9)",
            boxShadow: "0 6px 20px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)",
            padding: "14px 20px",
          }}
        >
          <span className="material-symbols-outlined text-[#0A66C2]" style={{ fontSize: "22px", fontVariationSettings: "'FILL' 1" }}>map</span>
          <span className="font-bold text-slate-700 text-sm">Yol Tarifi Al</span>
          <span className="material-symbols-outlined text-slate-400 ml-auto" style={{ fontSize: "18px" }}>open_in_new</span>
        </a>

        <Link
          href="/rezervasyonlarim"
          className="flex items-center gap-2 active:scale-[0.98] transition-transform mb-2"
          style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(16px)",
            borderRadius: "18px",
            border: "1px solid rgba(255,255,255,0.9)",
            boxShadow: "0 6px 20px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)",
            padding: "14px 20px",
          }}
        >
          <span className="material-symbols-outlined text-slate-500" style={{ fontSize: "22px" }}>confirmation_number</span>
          <span className="font-bold text-slate-600 text-sm">Tüm Rezervasyonlarım</span>
        </Link>

        {/* Aktif rezervasyon butonları */}
        {rezervasyon.status === "CONFIRMED" && new Date(rezervasyon.endDateTime) > new Date() && new Date(rezervasyon.startDateTime) <= new Date() && (
          <>
            <button
              onClick={() => setShowExtendModal(true)}
              className="flex items-center justify-center gap-2 active:scale-[0.98] transition-transform w-full"
              style={{
                background: "rgba(219,234,254,0.8)",
                backdropFilter: "blur(16px)",
                borderRadius: "18px",
                border: "1px solid rgba(147,197,253,0.6)",
                padding: "14px 20px",
              }}
            >
              <span className="material-symbols-outlined text-blue-600" style={{ fontSize: "22px" }}>more_time</span>
              <span className="font-bold text-blue-700 text-sm">Süreyi Uzat</span>
            </button>
            <button
              onClick={handleEarlyCexit}
              className="flex items-center justify-center gap-2 active:scale-[0.98] transition-transform w-full"
              style={{
                background: "rgba(255,237,213,0.8)",
                backdropFilter: "blur(16px)",
                borderRadius: "18px",
                border: "1px solid rgba(253,186,116,0.6)",
                padding: "14px 20px",
              }}
            >
              <span className="material-symbols-outlined text-orange-500" style={{ fontSize: "22px" }}>directions_walk</span>
              <span className="font-bold text-orange-600 text-sm">Erken Çık</span>
            </button>
          </>
        )}

        {/* İptal butonu — sadece başlamadan önce */}
        {rezervasyon.status === "CONFIRMED" && new Date(rezervasyon.startDateTime) > new Date() && (
          <div className="flex flex-col gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center justify-center gap-2 active:scale-[0.98] transition-transform w-full"
              style={{
                background: "rgba(254,226,226,0.8)",
                backdropFilter: "blur(16px)",
                borderRadius: "18px",
                border: "1px solid rgba(254,202,202,0.9)",
                padding: "14px 20px",
              }}
            >
              <span className="material-symbols-outlined text-red-500" style={{ fontSize: "22px" }}>cancel</span>
              <span className="font-bold text-red-600 text-sm">Rezervasyonu İptal Et</span>
            </button>
            <button 
              onClick={() => setShowCancelPolicyModal(true)} 
              className="text-[#0A66C2] text-xs font-bold flex items-center justify-center gap-1 mt-1 mx-auto"
            >
              <span className="material-symbols-outlined text-[14px]">info</span> İptal ve İade Politikası
            </button>
          </div>
        )}
      </div>

      {/* Süreyi Uzat Modalı */}
      {showExtendModal && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center p-5 pb-10" style={{ background: "rgba(10,37,64,0.4)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-xl text-slate-800">Süreyi Uzat</h3>
              <button onClick={() => setShowExtendModal(false)} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-slate-500">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <p className="text-slate-500 text-sm mb-5">Kaç saat uzatmak istiyorsunuz? Ek süre ücreti şimdiki tarifeyle hesaplanacak.</p>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[1, 2, 4].map(h => (
                <button
                  key={h}
                  onClick={() => handleExtend(h)}
                  disabled={extending}
                  className="py-4 bg-blue-50 border border-blue-100 rounded-2xl font-black text-[#0A66C2] text-lg active:scale-95 transition-transform disabled:opacity-50"
                >
                  +{h}s
                </button>
              ))}
            </div>
            <p className="text-center text-slate-400 text-xs">{extending ? "İşleniyor..." : "Ücret rezerveye yansıtılacaktır."}</p>
          </div>
        </div>
      )}

      {/* İptal Politikası Modalı */}
      {showCancelPolicyModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-5" style={{ background: "rgba(10,37,64,0.4)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-xl text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-500">policy</span>
                İptal Politikası
              </h3>
              <button onClick={() => setShowCancelPolicyModal(false)} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-slate-500">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-emerald-500 text-[20px]">check_circle</span>
                <p>Başlangıca <strong>2 saatten fazla</strong> süre kala iptal ederseniz tam iade alırsınız.</p>
              </div>
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-orange-500 text-[20px]">timelapse</span>
                <p>Başlangıca <strong>30 dk. - 2 saat arasında</strong> kala iptal ederseniz %50 iade uygulandığını hatırlatırız.</p>
              </div>
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-red-500 text-[20px]">error</span>
                <p><strong>Son 30 dakika</strong> içerisinde iptal gerçekleştirilirse maalesef ücret iadesi yapılmamaktadır.</p>
              </div>
            </div>
            <button onClick={() => setShowCancelPolicyModal(false)} className="w-full mt-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold active:scale-95 transition-transform">
              Anladım
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
