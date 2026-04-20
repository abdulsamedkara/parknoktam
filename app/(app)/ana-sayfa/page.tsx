"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";

const MiniMap = dynamic(() => import("@/components/MiniMap"), { ssr: false });

export default function AnaSayfa() {
  const { data: session } = useSession();
  const userName = session?.user?.name?.split(" ")[0] || "Kullanıcı";

  return (
    <div className="min-h-screen pb-[100px]" style={{
      background: "linear-gradient(160deg, #e8f0fe 0%, #f0f5ff 40%, #fafbff 100%)"
    }}>

      {/* Header */}
      <div className="px-5 pt-14 pb-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div style={{
              background: "linear-gradient(135deg, #0A66C2, #1e88e5)",
              boxShadow: "0 4px 14px rgba(10,102,194,0.35)"
            }} className="w-9 h-9 rounded-[10px] flex items-center justify-center text-white font-black text-base">
              P
            </div>
            <span className="font-black text-xl text-slate-800 tracking-tight">Park Noktam</span>
          </div>
          <p className="text-slate-500 text-sm font-medium pl-0.5">
            Merhaba, <span className="text-[#0A66C2] font-bold">{userName}</span> 👋
          </p>
        </div>
        <Link href="/profil" style={{
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
          border: "1px solid rgba(255,255,255,0.6)"
        }} className="w-11 h-11 rounded-full flex items-center justify-center transition-transform active:scale-95">
          <span className="material-symbols-outlined text-slate-600" style={{fontSize:'22px', fontVariationSettings:"'FILL' 1"}}>person</span>
        </Link>
      </div>

      {/* Map Widget */}
      <div className="px-4 mb-1">
        <Link href="/ara" className="block relative w-full h-[195px] rounded-[24px] overflow-hidden active:scale-[0.98] transition-transform" style={{
          boxShadow: "0 16px 48px -8px rgba(10,102,194,0.25), 0 4px 16px rgba(0,0,0,0.08)"
        }}>
          {/* Live Map */}
          <div className="absolute inset-0">
            <MiniMap />
          </div>

          {/* Subtle top vignette */}
          <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />

          {/* Bottom CTA glass pill */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2.5 pointer-events-none" style={{
            background: "rgba(255,255,255,0.88)",
            backdropFilter: "blur(16px)",
            borderRadius: "16px",
            padding: "10px 14px",
            border: "1px solid rgba(255,255,255,0.9)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,1)"
          }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{background: "linear-gradient(135deg, #0A66C2, #1e88e5)"}}>
              <span className="material-symbols-outlined text-white" style={{fontSize:'16px', fontVariationSettings:"'FILL' 1"}}>location_on</span>
            </div>
            <span className="text-[13px] font-bold text-slate-700 flex-1">En yakın park yerini keşfet</span>
            <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#0A66C2]" style={{fontSize:'16px'}}>chevron_right</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="px-4 pt-5">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pl-1">Hızlı Rezervasyon</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { href: "/ara?tip=saatlik", icon: "schedule", label: "Saatlik\nPark", color: "#0A66C2", bg: "rgba(10,102,194,0.08)" },
            { href: "/ara?tip=gunluk", icon: "calendar_month", label: "Günlük\nPark", color: "#7c3aed", bg: "rgba(124,58,237,0.08)" },
            { href: "/ara?tip=aylik", icon: "date_range", label: "Aylık\nKirala", color: "#059669", bg: "rgba(5,150,105,0.08)", isNew: true },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-2.5 active:scale-[0.96] transition-transform relative" style={{
              background: "rgba(255,255,255,0.75)",
              backdropFilter: "blur(16px)",
              borderRadius: "20px",
              padding: "16px 8px",
              border: "1px solid rgba(255,255,255,0.85)",
              boxShadow: "0 8px 24px -4px rgba(0,0,0,0.07), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,1)"
            }}>
              {item.isNew && (
                <span className="absolute -top-1.5 -right-1.5 text-[9px] font-black text-white px-1.5 py-0.5 rounded-full" style={{background: "linear-gradient(135deg, #f59e0b, #f97316)"}}>YENİ</span>
              )}
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{background: item.bg}}>
                <span className="material-symbols-outlined" style={{fontSize:'26px', color: item.color, fontVariationSettings:"'FILL' 1"}}>{item.icon}</span>
              </div>
              <span className="text-[11px] font-bold text-center text-slate-700 leading-snug whitespace-pre-line">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Extra Services */}
      <div className="px-4 pt-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: "ev_station", label: "Elektrikli Araç", sub: "Şarj istasyonları", color: "#7c3aed", bg: "rgba(124,58,237,0.08)" },
            { icon: "security", label: "Güvenli Park", sub: "Kameralı otoparklar", color: "#059669", bg: "rgba(5,150,105,0.08)" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 active:scale-[0.97] transition-transform cursor-pointer" style={{
              background: "rgba(255,255,255,0.75)",
              backdropFilter: "blur(16px)",
              borderRadius: "18px",
              padding: "14px",
              border: "1px solid rgba(255,255,255,0.85)",
              boxShadow: "0 8px 24px -4px rgba(0,0,0,0.07), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,1)"
            }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{background: item.bg}}>
                <span className="material-symbols-outlined" style={{fontSize:'22px', color: item.color, fontVariationSettings:"'FILL' 1"}}>{item.icon}</span>
              </div>
              <div>
                <p className="text-[12px] font-bold text-slate-800 leading-tight">{item.label}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Campaign Banner */}
      <div className="px-4 pt-5">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pl-1">Kampanyalar</p>
        <div className="relative overflow-hidden rounded-[24px] p-5" style={{
          background: "linear-gradient(135deg, #0A66C2 0%, #1565C0 50%, #0d47a1 100%)",
          boxShadow: "0 16px 48px -8px rgba(10,102,194,0.4), 0 4px 16px rgba(0,0,0,0.1)"
        }}>
          {/* Glass inner layer */}
          <div className="absolute inset-0 opacity-20" style={{
            background: "radial-gradient(ellipse at 70% 20%, rgba(255,255,255,0.3) 0%, transparent 60%)"
          }} />

          <div className="relative z-10">
            <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">🎉 Özel Fırsat</span>
            <h3 className="text-white font-black text-[22px] leading-tight mt-1 mb-1.5">
              İlk Rezervasyona<br/>%20 İndirim!
            </h3>
            <p className="text-blue-200 text-[11px] font-medium mb-4 leading-relaxed max-w-[65%]">
              İlk park rezervasyonunuzda geçerli. Hemen dene!
            </p>
            <button className="text-[#0A66C2] text-xs font-black px-5 py-2.5 rounded-2xl active:scale-95 transition-transform" style={{
              background: "rgba(255,255,255,0.95)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,1)"
            }}>
              Kodu Al →
            </button>
          </div>

          {/* Decorative circle */}
          <span className="material-symbols-outlined absolute -right-6 -bottom-6 text-white/10 pointer-events-none" style={{fontSize:'160px', fontVariationSettings:"'FILL' 1"}}>local_parking</span>
        </div>
      </div>

    </div>
  );
}
