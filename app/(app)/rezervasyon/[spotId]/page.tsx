"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Vehicle {
  id: string;
  plate: string;
  model: string;
  isDefault: boolean;
}

interface Spot {
  id: string;
  title: string;
  address: string;
  pricePerHour: number;
  openTime: string;
  closeTime: string;
  photos: string;
}

type RentalType = "saatlik" | "günlük" | "aylık";

// Saat dilimleri oluştur
function buildTimeSlots(openTime: string, closeTime: string): string[] {
  const slots: string[] = [];
  const [oh] = openTime.split(":").map(Number);
  const [ch] = closeTime.split(":").map(Number);
  for (let h = oh; h <= ch; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
  }
  return slots;
}

function calcHours(start: string, end: string): number {
  const [sh] = start.split(":").map(Number);
  const [eh] = end.split(":").map(Number);
  return Math.max(0, eh - sh);
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split("T")[0];
}

function hasProperty(obj: any, key: string) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

const RENTAL_TABS: { key: RentalType; label: string; icon: string }[] = [
  { key: "saatlik", label: "Saatlik", icon: "schedule" },
  { key: "günlük", label: "Günlük", icon: "today" },
  { key: "aylık",  label: "Aylık",   icon: "calendar_month" },
];

export default function RezervasjonPage({ params }: { params: Promise<{ spotId: string }> }) {
  const router = useRouter();
  const [spot, setSpot] = useState<Spot | null>(null);
  const [spotId, setSpotId] = useState("");

  const today = new Date().toISOString().split("T")[0];

  // Kiralama tipi
  const [rentalType, setRentalType] = useState<RentalType>("saatlik");

  // Saatlik
  const [selectedDate, setSelectedDate] = useState(today);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("11:00");

  // Günlük / Aylık
  const [startDate, setStartDate] = useState(today);
  const [duration, setDuration] = useState(1); // gün veya ay sayısı

  // Araç
  const [plate, setPlate] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [creditBalance, setCreditBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    params.then(p => {
      setSpotId(p.spotId);
      fetch(`/api/spots/${p.spotId}`)
        .then(r => r.json())
        .then(d => setSpot(d))
        .catch(() => {});
    });

    fetch(`/api/user/credits`)
      .then(r => r.json())
      .then(d => { if (d && hasProperty(d, "creditBalance")) setCreditBalance(d.creditBalance); })
      .catch(() => {});

    fetch(`/api/user/vehicles`)
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d)) {
          setVehicles(d);
          const def = d.find((v: Vehicle) => v.isDefault);
          if (def) { setPlate(def.plate); setVehicleModel(def.model); }
        }
      })
      .catch(() => {});
  }, [params]);

  // ── Fiyat hesaplama ─────────────────────────────────────────────────────────
  const pricePerHour = spot?.pricePerHour ?? 0;
  // Günlük: 20 saatlik kullanım eşdeğeri (hafif indirimli)
  const pricePerDay = Math.round(pricePerHour * 18 * 100) / 100;
  // Aylık: 25 günlük kullanım eşdeğeri (daha büyük indirim)
  const pricePerMonth = Math.round(pricePerDay * 22 * 100) / 100;

  let total = 0;
  let durationLabel = "";
  let startDateTime = "";
  let endDateTime = "";

  if (rentalType === "saatlik" && spot) {
    const hours = calcHours(startTime, endTime);
    total = Math.round(hours * pricePerHour * 100) / 100;
    durationLabel = `${hours} saat`;
    startDateTime = `${selectedDate}T${startTime}:00`;
    endDateTime   = `${selectedDate}T${endTime}:00`;
  } else if (rentalType === "günlük" && spot) {
    total = Math.round(duration * pricePerDay * 100) / 100;
    durationLabel = `${duration} gün`;
    startDateTime = `${startDate}T08:00:00`;
    endDateTime   = `${addDays(startDate, duration)}T08:00:00`;
  } else if (rentalType === "aylık" && spot) {
    total = Math.round(duration * pricePerMonth * 100) / 100;
    durationLabel = `${duration} ay`;
    startDateTime = `${startDate}T08:00:00`;
    endDateTime   = `${addMonths(startDate, duration)}T08:00:00`;
  }

  const isValid = total > 0 && plate.trim() && vehicleModel.trim();
  const discount = Math.min(total, creditBalance);
  const finalTotal = Math.max(0, total - discount);

  const timeSlots = spot ? buildTimeSlots(spot.openTime, spot.closeTime) : [];
  const hours = rentalType === "saatlik" ? calcHours(startTime, endTime) : 0;

  const heroImage = spot?.photos
    ? (() => { try { return JSON.parse(spot.photos)[0]; } catch { return ""; } })()
    : "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) { setError("Lütfen tüm alanları doldurun."); return; }
    if (!startDateTime || !endDateTime) { setError("Zaman aralığı geçersiz."); return; }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/rezervasyon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spotId,
          startDateTime,
          endDateTime,
          vehiclePlate: plate,
          vehicleModel,
          rentalType, // arka planda log için
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Bir hata oluştu.");
        return;
      }

      const rezervasyon = await res.json();
      router.push(`/odeme/${rezervasyon.id}`);
    } catch {
      setError("Sunucu hatası. Tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen pb-[100px]" style={{ background: "linear-gradient(160deg,#e8f0fe 0%,#f0f5ff 40%,#fafbff 100%)" }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <Link href={spotId ? `/otopark/${spotId}` : "/ara"} className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-sm active:scale-90 transition-transform">
          <span className="material-symbols-outlined text-slate-700" style={{ fontSize: "22px" }}>arrow_back</span>
        </Link>
        <div>
          <h1 className="font-black text-slate-800 text-lg">Rezervasyon Oluştur</h1>
          {spot && <p className="text-slate-500 text-xs truncate max-w-[240px]">{spot.title}</p>}
        </div>
      </div>

      {/* Spot Card */}
      {spot && (
        <div className="px-5 mb-5">
          <div style={{
            background: "rgba(255,255,255,0.80)", backdropFilter: "blur(16px)",
            borderRadius: "20px", border: "1px solid rgba(255,255,255,0.9)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)",
            overflow: "hidden",
          }}>
            {heroImage && <img src={heroImage} alt={spot.title} className="w-full h-28 object-cover" />}
            <div className="p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold text-slate-800 text-sm truncate">{spot.title}</p>
                <p className="text-slate-400 text-xs mt-0.5 truncate">{spot.address}</p>
              </div>
              {/* Fiyat bilgi kutusu */}
              <div className="flex gap-2 shrink-0">
                <div style={{ background: "rgba(10,102,194,0.08)", borderRadius: "12px", padding: "8px 10px", textAlign: "center" }}>
                  <span className="text-[#0A66C2] font-black text-sm">₺{pricePerHour}</span>
                  <span className="text-slate-400 text-[9px] font-bold block">/saat</span>
                </div>
                <div style={{ background: "rgba(5,150,105,0.08)", borderRadius: "12px", padding: "8px 10px", textAlign: "center" }}>
                  <span className="text-emerald-700 font-black text-sm">₺{pricePerDay}</span>
                  <span className="text-slate-400 text-[9px] font-bold block">/gün</span>
                </div>
                <div style={{ background: "rgba(124,58,237,0.08)", borderRadius: "12px", padding: "8px 10px", textAlign: "center" }}>
                  <span className="text-violet-700 font-black text-sm">₺{pricePerMonth}</span>
                  <span className="text-slate-400 text-[9px] font-bold block">/ay</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>

        {/* ── Kiralama Tipi Seçici ── */}
        <div className="px-5 mb-5">
          <div className="flex bg-slate-200/50 p-1 rounded-2xl relative">
            <div
              className="absolute inset-y-1 bg-white rounded-xl shadow-sm transition-all duration-300 ease-out"
              style={{
                width: "calc(33.333% - 2px)",
                left: rentalType === "saatlik" ? "4px" : rentalType === "günlük" ? "calc(33.333%)" : "calc(66.666%)",
              }}
            />
            {RENTAL_TABS.map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => { setRentalType(tab.key); setError(""); setDuration(1); }}
                className={`flex-1 relative z-10 py-2.5 flex items-center justify-center gap-1.5 text-xs font-black transition-colors ${rentalType === tab.key ? "text-slate-800" : "text-slate-400"}`}
              >
                <span className="material-symbols-outlined text-[15px]">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── SAATLIK FORM ── */}
        {rentalType === "saatlik" && (
          <>
            <section className="px-5 mb-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">📅 Tarih</p>
              <div style={{ background: "rgba(255,255,255,0.80)", backdropFilter: "blur(16px)", borderRadius: "18px", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 6px 20px rgba(0,0,0,0.05)", padding: "4px 8px" }}>
                <input type="date" min={today} value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                  className="w-full bg-transparent py-3 px-2 text-slate-700 font-semibold text-sm outline-none" />
              </div>
            </section>

            <section className="px-5 mb-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">⏰ Saat Aralığı</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Başlangıç", value: startTime, onChange: setStartTime },
                  { label: "Bitiş",     value: endTime,   onChange: setEndTime },
                ].map(field => (
                  <div key={field.label} style={{ background: "rgba(255,255,255,0.80)", backdropFilter: "blur(16px)", borderRadius: "18px", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 6px 20px rgba(0,0,0,0.05)", padding: "12px 14px" }}>
                    <p className="text-[10px] font-bold text-slate-400 mb-1">{field.label}</p>
                    <select value={field.value} onChange={e => field.onChange(e.target.value)}
                      className="w-full bg-transparent text-slate-800 font-black text-lg outline-none">
                      {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              {hours > 0 && (
                <div className="flex items-center justify-center mt-3 gap-2">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span style={{ background: "rgba(10,102,194,0.10)", color: "#0A66C2", borderRadius: "20px", padding: "4px 12px", fontSize: "12px", fontWeight: 800 }}>
                    {hours} saat
                  </span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
              )}
              {hours <= 0 && endTime <= startTime && (
                <p className="text-red-500 text-xs text-center mt-2 font-semibold">Bitiş saati başlangıçtan sonra olmalı</p>
              )}
            </section>
          </>
        )}

        {/* ── GÜNLÜK FORM ── */}
        {rentalType === "günlük" && (
          <>
            <section className="px-5 mb-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">📅 Başlangıç Tarihi</p>
              <div style={{ background: "rgba(255,255,255,0.80)", backdropFilter: "blur(16px)", borderRadius: "18px", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 6px 20px rgba(0,0,0,0.05)", padding: "4px 8px" }}>
                <input type="date" min={today} value={startDate} onChange={e => setStartDate(e.target.value)}
                  className="w-full bg-transparent py-3 px-2 text-slate-700 font-semibold text-sm outline-none" />
              </div>
            </section>

            <section className="px-5 mb-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">📆 Kaç Gün?</p>
              <div style={{ background: "rgba(255,255,255,0.80)", backdropFilter: "blur(16px)", borderRadius: "18px", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 6px 20px rgba(0,0,0,0.05)", padding: "16px" }}>
                <div className="flex items-center gap-4 mb-4">
                  <button type="button" onClick={() => setDuration(d => Math.max(1, d - 1))}
                    className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 font-black text-xl flex items-center justify-center active:scale-90 transition-transform">−</button>
                  <div className="flex-1 text-center">
                    <span className="font-black text-slate-800 text-4xl">{duration}</span>
                    <span className="text-slate-400 font-bold text-sm ml-2">gün</span>
                  </div>
                  <button type="button" onClick={() => setDuration(d => Math.min(30, d + 1))}
                    className="w-10 h-10 rounded-full bg-[#0A66C2] text-white font-black text-xl flex items-center justify-center active:scale-90 transition-transform">+</button>
                </div>
                {/* Hızlı seçim */}
                <div className="flex gap-2">
                  {[1, 3, 7, 14, 30].map(d => (
                    <button key={d} type="button" onClick={() => setDuration(d)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${duration === d ? 'bg-[#0A66C2] text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {d}g
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-center mt-2 gap-2">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                  {startDate} → {addDays(startDate, duration)}
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
            </section>

            {/* Günlük indirim bilgisi */}
            <div className="px-5 mb-4">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex gap-2 items-start">
                <span className="material-symbols-outlined text-emerald-500 text-[18px] mt-0.5">savings</span>
                <div>
                  <p className="text-xs font-bold text-emerald-800">Günlük kiralama indirimi</p>
                  <p className="text-[11px] text-emerald-600 mt-0.5">
                    Günlük tarife, saatlik fiyata göre <strong>%10 indirimli</strong>. (₺{pricePerHour}/saat yerine ₺{pricePerDay}/gün)
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── AYLIK FORM ── */}
        {rentalType === "aylık" && (
          <>
            <section className="px-5 mb-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">📅 Başlangıç Tarihi</p>
              <div style={{ background: "rgba(255,255,255,0.80)", backdropFilter: "blur(16px)", borderRadius: "18px", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 6px 20px rgba(0,0,0,0.05)", padding: "4px 8px" }}>
                <input type="date" min={today} value={startDate} onChange={e => setStartDate(e.target.value)}
                  className="w-full bg-transparent py-3 px-2 text-slate-700 font-semibold text-sm outline-none" />
              </div>
            </section>

            <section className="px-5 mb-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">🗓️ Kaç Ay?</p>
              <div style={{ background: "rgba(255,255,255,0.80)", backdropFilter: "blur(16px)", borderRadius: "18px", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 6px 20px rgba(0,0,0,0.05)", padding: "16px" }}>
                <div className="flex items-center gap-4 mb-4">
                  <button type="button" onClick={() => setDuration(d => Math.max(1, d - 1))}
                    className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 font-black text-xl flex items-center justify-center active:scale-90 transition-transform">−</button>
                  <div className="flex-1 text-center">
                    <span className="font-black text-slate-800 text-4xl">{duration}</span>
                    <span className="text-slate-400 font-bold text-sm ml-2">ay</span>
                  </div>
                  <button type="button" onClick={() => setDuration(d => Math.min(12, d + 1))}
                    className="w-10 h-10 rounded-full bg-violet-600 text-white font-black text-xl flex items-center justify-center active:scale-90 transition-transform">+</button>
                </div>
                {/* Hızlı seçim */}
                <div className="flex gap-2">
                  {[1, 2, 3, 6, 12].map(m => (
                    <button key={m} type="button" onClick={() => setDuration(m)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${duration === m ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {m}ay
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-center mt-2 gap-2">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-bold text-violet-600 bg-violet-50 px-3 py-1 rounded-full">
                  {startDate} → {addMonths(startDate, duration)}
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
            </section>

            {/* Aylık indirim bilgisi */}
            <div className="px-5 mb-4">
              <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 flex gap-2 items-start">
                <span className="material-symbols-outlined text-violet-500 text-[18px] mt-0.5">workspace_premium</span>
                <div>
                  <p className="text-xs font-bold text-violet-800">Aylık abonelik fırsatı</p>
                  <p className="text-[11px] text-violet-600 mt-0.5">
                    Aylık tarife, günlük kiralamaya göre <strong>%18 daha uygun</strong>. (22 günlük kullanım fiyatına 30 gün park imkânı)
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Araç Bilgileri */}
        <section className="px-5 mb-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">🚗 Araç Bilgileri</p>
          <div style={{ background: "rgba(255,255,255,0.80)", backdropFilter: "blur(16px)", borderRadius: "18px", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 6px 20px rgba(0,0,0,0.05)", overflow: "hidden" }}>
            {vehicles.length > 0 && (
              <div className="px-4 pt-3 pb-1 border-b border-slate-100 mb-2">
                <p className="text-[10px] font-bold text-slate-400 mb-2">KAYITLI ARAÇLARINDAN SEÇ</p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {vehicles.map(v => (
                    <button key={v.id} type="button"
                      onClick={() => { setPlate(v.plate); setVehicleModel(v.model); }}
                      className={`shrink-0 px-3 py-2 rounded-lg text-xs font-bold transition-all border ${plate === v.plate ? "bg-[#0A66C2] text-white border-[#0A66C2]" : "bg-white text-slate-600 border-slate-200"}`}>
                      {v.plate}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="px-4 pt-3 pb-2">
              <p className="text-[10px] font-bold text-slate-400 mb-1">{vehicles.length > 0 ? "VEYA MANUEL GİR (PLAKA)" : "PLAKA"}</p>
              <input type="text" placeholder="34 ABC 123" value={plate}
                onChange={e => setPlate(e.target.value.toUpperCase())} maxLength={9}
                className="w-full bg-transparent text-slate-800 font-black text-xl outline-none tracking-widest placeholder-slate-300" />
            </div>
            <div className="border-t border-slate-100 px-4 py-3">
              <p className="text-[10px] font-bold text-slate-400 mb-1">ARAÇ</p>
              <input type="text" placeholder="Toyota Corolla, BMW 3..." value={vehicleModel}
                onChange={e => setVehicleModel(e.target.value)}
                className="w-full bg-transparent text-slate-700 font-semibold text-sm outline-none placeholder-slate-300" />
            </div>
          </div>
        </section>

        {/* Fiyat Özeti */}
        {spot && total > 0 && (
          <section className="px-5 mb-6">
            <div style={{
              background: rentalType === "saatlik"
                ? "linear-gradient(135deg,#0A66C2,#1565C0)"
                : rentalType === "günlük"
                ? "linear-gradient(135deg,#059669,#047857)"
                : "linear-gradient(135deg,#7c3aed,#6d28d9)",
              borderRadius: "20px", padding: "18px 20px",
              boxShadow: "0 12px 32px rgba(10,102,194,0.25)",
              position: "relative", overflow: "hidden",
            }}>
              <div className="relative z-10">
                <p className="text-white/70 text-xs font-bold mb-3">Ücret Özeti</p>
                <div className="flex justify-between text-white/80 text-sm mb-1">
                  <span>
                    {rentalType === "saatlik"
                      ? `₺${pricePerHour} × ${durationLabel}`
                      : rentalType === "günlük"
                      ? `₺${pricePerDay} × ${durationLabel}`
                      : `₺${pricePerMonth} × ${durationLabel}`}
                  </span>
                  <span>₺{total}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-300 text-sm mb-1">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">savings</span> Kredi İndirimi</span>
                    <span>- ₺{discount}</span>
                  </div>
                )}
                <div className="border-t border-white/20 mt-2 pt-2 flex justify-between">
                  <span className="text-white font-black text-lg">Toplam</span>
                  <span className="text-white font-black text-2xl">₺{finalTotal}</span>
                </div>
              </div>
              <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-white/10" style={{ fontSize: "100px", fontVariationSettings: "'FILL' 1" }}>payments</span>
            </div>

            {/* İptal koşulları */}
            <div className="mt-4 bg-orange-50 border border-orange-100 rounded-xl p-3 flex gap-3">
              <span className="material-symbols-outlined text-orange-500 mt-0.5">info</span>
              <div>
                <p className="text-xs font-bold text-orange-800 mb-1">İptal ve İade Koşulları</p>
                <p className="text-[11px] text-orange-600 leading-relaxed">
                  {rentalType === "saatlik"
                    ? "Rezervasyonunuza 2 saatten fazla kala tam iade, 30 dk. - 2 saat arasında %50 iade. Son 30 dakika kala iade yok."
                    : rentalType === "günlük"
                    ? "Başlangıçtan 24 saat öncesine kadar tam iade. 24 saat içinde iptal %50 iade ile mümkündür."
                    : "Başlangıçtan 7 gün öncesine kadar tam iade. 7 gün içinde kalanı iade yoktur."}
                </p>
              </div>
            </div>
          </section>
        )}

        {error && (
          <div className="px-5 mb-4">
            <p className="text-red-500 text-sm font-semibold text-center bg-red-50 py-2 rounded-xl">{error}</p>
          </div>
        )}

        {/* Submit */}
        <div className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-4" style={{
          background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.6)", zIndex: 1500,
        }}>
          <button type="submit" disabled={loading || !isValid}
            style={{
              width: "100%",
              background: isValid
                ? rentalType === "saatlik"
                  ? "linear-gradient(135deg,#0A66C2,#1e88e5)"
                  : rentalType === "günlük"
                  ? "linear-gradient(135deg,#059669,#10b981)"
                  : "linear-gradient(135deg,#7c3aed,#8b5cf6)"
                : "#cbd5e1",
              color: "white", border: "none", padding: "16px",
              borderRadius: "18px", fontWeight: 800, fontSize: "16px",
              boxShadow: isValid ? "0 8px 24px rgba(10,102,194,0.30)" : "none",
              cursor: isValid ? "pointer" : "not-allowed",
              transition: "all 0.2s",
            }}>
            {loading ? "Oluşturuluyor..." : total > 0 ? `Ödemeye Geç  →  ₺${finalTotal}` : "Süre Seçin"}
          </button>
        </div>
      </form>
    </div>
  );
}
