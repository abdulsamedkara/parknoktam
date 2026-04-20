"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Icons 
const IconCar = () => <span className="material-symbols-outlined shrink-0" style={{fontSize:'32px', color:'#0f172a'}}>directions_car</span>;
const IconCalendar = () => <span className="material-symbols-outlined shrink-0" style={{fontSize:'32px', color:'#0f172a'}}>calendar_month</span>;
const IconPackage = () => <span className="material-symbols-outlined shrink-0" style={{fontSize:'32px', color:'#0f172a'}}>inventory_2</span>;

export default function AnaSayfa() {
  const [userName, setUserName] = useState("Kullanıcı");

  useEffect(() => {
    // Session fetching logic can go here. MVP fallback to "Ahmet"
    setUserName("Ahmet");
  }, []);

  return (
    <div className="bg-[#fcfcfc] min-h-screen pb-[120px]">
      
      {/* Top Header / Greeting */}
      <div className="pt-12 px-6 pb-4">
        {/* Mock Logo Space */}
        <div className="flex items-center gap-2 mb-6">
          <div className="bg-[#0A66C2] w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xl tracking-tighter">PN</div>
          <span className="font-extrabold text-2xl tracking-tighter text-slate-800">Park Noktam</span>
        </div>
        
        <h1 className="text-[22px] font-bold text-slate-900 leading-snug">
          Merhaba {userName},<br/>
          <span className="text-[17px] font-medium text-slate-600 mt-1 block">Seni tekrar görmek çok güzel!</span>
        </h1>
      </div>

      {/* Map Preview Widget */}
      <div className="px-5 mb-8">
        <Link href="/ara" className="block relative w-full h-[180px] bg-slate-200 rounded-[28px] overflow-hidden shadow-sm active:scale-95 transition-transform">
          {/* Static Map Image Placeholder -> representing the map widget */}
          <img 
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
            alt="Harita" 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent pointer-events-none"></div>
          
          {/* User Location Pin Mock */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-blue-500 border-[3px] border-white rounded-full flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-white" style={{fontSize:'24px'}}>person</span>
          </div>

          <div className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl py-3 px-4 shadow-lg flex items-center gap-3">
            <div className="bg-[#0A66C2] w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white">location_on</span>
            </div>
            <span className="text-[13px] font-bold text-slate-800">Haritada park yeri bul ve hemen ayır!</span>
          </div>
        </Link>
      </div>

      {/* Primary Actions Grid */}
      <div className="px-5 grid grid-cols-3 gap-3 mb-4">
        {/* Action Card 1 */}
        <Link href="/ara" className="bg-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 border border-slate-200/60 active:bg-slate-200">
          <IconCar />
          <span className="text-[12px] font-bold text-center text-slate-700 leading-tight">Saatlik<br/>Park</span>
        </Link>

        {/* Action Card 2 */}
        <Link href="/ara?tip=gunluk" className="bg-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 border border-slate-200/60 active:bg-slate-200 relative">
          <IconCalendar />
          <span className="text-[12px] font-bold text-center text-slate-700 leading-tight">Günlük<br/>Park</span>
        </Link>

        {/* Action Card 3 */}
        <Link href="/ara?tip=aylik" className="bg-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 border border-slate-200/60 active:bg-slate-200 relative">
          <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">Yeni!</div>
          <IconPackage />
          <span className="text-[12px] font-bold text-center text-slate-700 leading-tight">Aylık<br/>Kirala</span>
        </Link>
      </div>

      {/* Secondary Actions Row */}
      <div className="px-5 grid grid-cols-2 gap-3 mb-10">
        <div className="bg-slate-50/80 rounded-2xl p-4 flex items-center justify-center gap-2 border border-slate-200 active:bg-slate-100 cursor-pointer">
          <span className="material-symbols-outlined text-[#0A66C2]" style={{fontSize:'20px'}}>directions_car</span>
          <span className="text-[13px] font-bold text-slate-700">Vale Hizmeti</span>
        </div>
        <div className="bg-slate-50/80 rounded-2xl p-4 flex items-center justify-center gap-2 border border-slate-200 active:bg-slate-100 cursor-pointer">
          <span className="material-symbols-outlined text-[#0A66C2]" style={{fontSize:'20px'}}>local_car_wash</span>
          <span className="text-[13px] font-bold text-slate-700">Yıkama</span>
        </div>
      </div>

      {/* Campaigns Header */}
      <div className="px-6 flex justify-between items-end mb-4">
        <h2 className="text-[16px] font-bold text-slate-800">Kampanyalar ve Fırsatlar</h2>
        <span className="text-[13px] font-bold text-[#0A66C2] cursor-pointer">Tümünü gör</span>
      </div>

      {/* Campaign Banner */}
      <div className="px-5">
        <div className="w-full bg-gradient-to-r from-blue-100 to-cyan-100 rounded-[24px] p-5 relative overflow-hidden h-[160px] flex items-center">
          <div className="z-10 w-[60%]">
            <div className="bg-blue-600 text-white font-black text-xs inline-block px-3 py-1 rounded-full mb-2 shadow-sm">Sana Özel Fırsat</div>
            <h3 className="font-black text-[#0A66C2] text-[18px] leading-tight mb-1">İlk Rezervasyona %20 İndirim!</h3>
            <p className="text-[11px] font-bold text-slate-700 leading-snug">Park Noktam ile otopark sorunu yaşamadan rahatça park et.</p>
          </div>
          
          <button className="absolute bottom-4 right-4 bg-[#0A66C2] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md z-10 w-24">Kodu Al</button>
          
          {/* Decorative element serving as car representation */}
          <span className="material-symbols-outlined absolute -right-4 top-1/2 -translate-y-1/2 text-sky-200 opacity-60 z-0" style={{fontSize:'140px'}}>directions_car</span>
        </div>
      </div>

    </div>
  );
}
