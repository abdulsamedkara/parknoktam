"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface DashboardData {
  metrics: {
    totalRevenue: number;
    thisMonthRevenue: number;
    activeSpotsCount: number;
    pendingIncoming: number;
  };
  recentReservations: {
    id: string;
    spotTitle: string;
    vehiclePlate: string;
    totalPrice: number;
    status: string;
  }[];
}

export default function PanelDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/panel/dashboard")
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="flex justify-center py-20 flex-col items-center min-h-screen" style={{ background: "linear-gradient(160deg,#e8f0fe 0%,#f0f5ff 40%,#fafbff 100%)" }}>
        <span className="material-symbols-outlined text-[#0A66C2] animate-spin" style={{ fontSize: "40px" }}>refresh</span>
        <p className="text-slate-400 font-medium text-sm mt-3">Veriler Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-[100px]" style={{ background: "linear-gradient(160deg,#e8f0fe 0%,#f0f5ff 40%,#fafbff 100%)" }}>
      <div className="px-5 pt-14 pb-2">
        <h1 className="font-black text-slate-800 text-2xl mb-0.5">Yönetim Paneli 🏠</h1>
        <p className="text-slate-400 text-sm">İlanlarını yönet ve kazançlarını takip et</p>
      </div>

      <div className="px-5 pt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">

      {/* Main Income Card */}
      <div className="mb-4" style={{
        background: "linear-gradient(135deg,#0A66C2,#1e88e5)",
        borderRadius: "24px",
        padding: "24px",
        color: "white",
        boxShadow: "0 12px 32px rgba(10,102,194,0.3)",
        position: "relative",
        overflow: "hidden"
      }}>
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <p className="text-blue-200 text-[11px] font-bold mb-1 tracking-widest uppercase">BU AYKİ KAZANÇ</p>
            <div className="flex items-baseline gap-1">
               <span className="text-4xl font-black">₺{data.metrics.thisMonthRevenue}</span>
            </div>
            <p className="text-blue-100 text-xs mt-1">
              Tüm zamanlar: <span className="font-bold">₺{data.metrics.totalRevenue}</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-white" style={{ fontSize: "28px", fontVariationSettings: "'FILL' 1" }}>insights</span>
          </div>
        </div>
        <span className="material-symbols-outlined absolute -right-4 -bottom-8 text-white/10" style={{ fontSize: "140px", fontVariationSettings: "'FILL' 1" }}>trending_up</span>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div style={{
          background: "white", borderRadius: "20px", padding: "16px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.04)"
        }}>
          <span className="material-symbols-outlined text-[#0A66C2] mb-2" style={{ fontSize: "24px", fontVariationSettings: "'FILL' 1" }}>garage_home</span>
           <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-0.5">Aktif İlanlar</p>
          <p className="text-2xl font-black text-slate-800">{data.metrics.activeSpotsCount}</p>
        </div>
        <div style={{
          background: "white", borderRadius: "20px", padding: "16px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.04)"
        }}>
          <span className="material-symbols-outlined text-amber-500 mb-2" style={{ fontSize: "24px", fontVariationSettings: "'FILL' 1" }}>notifications_active</span>
           <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-0.5">Bekleyen İşlem</p>
          <p className="text-2xl font-black text-slate-800">{data.metrics.pendingIncoming}</p>
        </div>
      </div>

      {/* Hızlı Butonlar */}
      <div className="flex gap-3 mb-8">
        <Link href="/panel/ilan-ekle" className="flex-1 text-center py-3 bg-[#0A2540] text-white rounded-xl font-bold text-sm shadow-lg shadow-slate-300">
          + İlan Ekle
        </Link>
        <Link href="/panel/ilanlarim" className="flex-1 text-center py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors">
          Yönet
        </Link>
      </div>

      {/* Recent Reservations */}
      <div className="mb-4 flex items-center justify-between">
         <h2 className="font-bold text-slate-800">Son Rezervasyonlar</h2>
         <span className="text-xs text-blue-500 font-bold">Hepsini Gör</span>
      </div>

      <div className="flex flex-col gap-3">
        {data.recentReservations.length === 0 && (
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-slate-100">
             <p className="text-slate-400 text-sm font-medium">Henüz bir rezervasyon görünmüyor.</p>
          </div>
        )}
        {data.recentReservations.map(res => (
          <div key={res.id} className="flex items-center justify-between p-4 bg-white rounded-[16px] border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-3 w-3/5">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-slate-500" style={{ fontSize: "18px" }}>confirmation_number</span>
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-800 text-[13px] truncate">{res.spotTitle}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-slate-500 text-[11px] font-mono">{res.vehiclePlate}</span>
                  <div className="w-1 h-1 bg-slate-300 rounded-full"/>
                  <span className={
                    res.status === "COMPLETED" ? "text-slate-400 text-[10px]" : 
                    res.status === "CONFIRMED" ? "text-green-500 text-[10px] font-bold" : "text-amber-500 text-[10px] font-bold"
                  }>
                    {res.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="font-black text-slate-700 text-sm">₺{res.totalPrice}</p>
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}

