"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function KazanclarPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    fetch("/api/panel/dashboard")
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleWithdraw = () => {
    setWithdrawing(true);
    setTimeout(() => {
      toast.success("Para çekme talebiniz başarıyla alındı! Hafta içi hesaba yansıtılacaktır.");
      setWithdrawing(false);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20 min-h-screen" style={{ background: "linear-gradient(160deg,#e8f0fe 0%,#f0f5ff 40%,#fafbff 100%)" }}>
        <span className="material-symbols-outlined text-[#0A66C2] animate-spin" style={{ fontSize: "40px" }}>refresh</span>
      </div>
    );
  }

  const balance = data?.metrics?.totalRevenue ?? 0;

  return (
    <div className="min-h-screen pb-[100px]" style={{ background: "linear-gradient(160deg,#e8f0fe 0%,#f0f5ff 40%,#fafbff 100%)" }}>
      
      {/* Header */}
      <div className="px-5 pt-14 pb-2 mb-4">
        <h1 className="font-black text-slate-800 text-2xl">Cüzdan ve Kazanç</h1>
        <p className="text-slate-400 text-sm mt-0.5">Bakiye kontrolu ve para çekme</p>
      </div>

      <div className="px-5 animate-in fade-in duration-300">

      {/* Main Balance */}
      <div className="mb-6 relative overflow-hidden" style={{
        background: "linear-gradient(135deg,#042f2e,#064e3b)",
        borderRadius: "24px",
        padding: "32px 24px",
        color: "white",
        boxShadow: "0 12px 32px rgba(6,78,59,0.3)"
      }}>
        <div className="relative z-10 text-center">
           <p className="text-emerald-200 text-xs font-bold mb-2 tracking-widest uppercase">ÇEKİLEBİLİR BAKİYE</p>
           <div className="flex justify-center items-end gap-1 mb-6">
              <span className="text-5xl font-black">₺{balance}</span>
           </div>
           
           <button 
             onClick={handleWithdraw}
             disabled={withdrawing || balance === 0}
             className="w-full py-4 rounded-xl font-black text-sm bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 hover:bg-emerald-400 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
           >
             {withdrawing ? (
               <><span className="material-symbols-outlined animate-spin">refresh</span> İşleniyor...</>
             ) : (
               <><span className="material-symbols-outlined">payments</span> Banka Hesabıma Çek</>
             )}
           </button>
        </div>
        <span className="material-symbols-outlined absolute -left-10 -top-10 text-white/5" style={{ fontSize: "200px", fontVariationSettings: "'FILL' 1" }}>account_balance</span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
         <div style={{
           background: "white", borderRadius: "20px", padding: "16px",
           border: "1px solid #f1f5f9"
         }}>
           <span className="material-symbols-outlined text-emerald-500 mb-2">today</span>
           <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Bu Ay</p>
           <p className="font-black text-slate-800 text-xl">₺{data?.metrics?.thisMonthRevenue ?? 0}</p>
         </div>
         <div style={{
           background: "white", borderRadius: "20px", padding: "16px",
           border: "1px solid #f1f5f9"
         }}>
           <span className="material-symbols-outlined text-emerald-500 mb-2">auto_graph</span>
           <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Tüm Zamanlar</p>
           <p className="font-black text-slate-800 text-xl">₺{data?.metrics?.totalRevenue ?? 0}</p>
         </div>
      </div>

      {/* Info Notice */}
      <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl flex gap-3 text-orange-800">
         <span className="material-symbols-outlined text-orange-500">info</span>
         <div>
            <p className="font-bold text-sm mb-1">Ödeme Takvimi</p>
            <p className="text-xs opacity-80 leading-relaxed">Para çekme talepleri her hafta Çarşamba günleri IBAN adresinize toplu olarak yatırılmaktadır. Tutar 50 ₺ altındaysa aktarım gerçekleşmez.</p>
         </div>
      </div>

    </div>
    </div>
  );
}
