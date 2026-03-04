"use client";
import React, { useState } from "react";
import Link from "next/link";
import { TrendingUp, TrendingDown, Activity, Search } from "lucide-react";

export default function SiberBorsa() {
  const [arama, setArama] = useState("");

  const borsaVerileri = [
    { id: 1, kod: "APP-IPH13", isim: "Apple iPhone 13 Pro Max", deger: "35.000 ₺", trend: "up", yuzde: "+5.2%", hacim: "124 Takas" },
    { id: 2, kod: "ASU-RTX3080", isim: "Asus ROG RTX 3080", deger: "18.500 ₺", trend: "down", yuzde: "-1.4%", hacim: "45 Takas" },
    { id: 3, kod: "AUD-A3", isim: "Audi A3 2016 S-Line", deger: "1.250.000 ₺", trend: "up", yuzde: "+2.1%", hacim: "8 Takas" },
    { id: 4, kod: "SON-PS5", isim: "Sony PlayStation 5", deger: "19.000 ₺", trend: "up", yuzde: "+8.7%", hacim: "210 Takas" },
    { id: 5, kod: "IKE-KLT", isim: "IKEA 3'lü Koltuk", deger: "4.500 ₺", trend: "down", yuzde: "-0.5%", hacim: "12 Takas" },
    { id: 6, kod: "MAC-M2", isim: "MacBook Air M2 16GB", deger: "42.000 ₺", trend: "up", yuzde: "+3.4%", hacim: "89 Takas" },
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-white pb-24 font-sans antialiased">
      
      {/* 🚀 ÜST PANEL (Sabit Arama Çubuğu) */}
      <div className="bg-[#0b0f19] border-b border-white/5 pt-8 pb-4 px-4 sticky top-0 z-40">
        <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-1 flex items-center gap-2">
          <Activity className="text-[#00f260]" /> TAKAS <span className="text-[#00f260]">TAHTASI</span>
        </h1>
        <p className="text-slate-400 font-bold tracking-widest text-[10px] uppercase mb-4">Canlı Varlık Piyasası</p>
        
        <div className="flex bg-[#030712] border border-white/10 rounded-xl overflow-hidden focus-within:border-[#00f260] transition-colors">
          <div className="p-3 flex items-center justify-center text-slate-500"><Search size={16} /></div>
          <input 
            type="text" 
            placeholder="Varlık kodu veya isim ara..." 
            className="w-full bg-transparent border-none text-white p-3 outline-none text-xs font-bold placeholder:text-slate-600"
            onChange={(e) => setArama(e.target.value)}
          />
        </div>
      </div>

      {/* 🚀 LİSTE BAŞLIKLARI */}
      <div className="flex justify-between px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
        <div className="flex-1">Varlık / Kod</div>
        <div className="w-24 text-right">Değer</div>
        <div className="w-20 text-right">Trend</div>
      </div>

      {/* 🚀 KRİPTO BORSASI LİSTE GÖRÜNÜMÜ */}
      <div className="px-2 pt-2">
        {borsaVerileri.filter(item => item.isim.toLowerCase().includes(arama.toLowerCase()) || item.kod.toLowerCase().includes(arama.toLowerCase())).map((item) => (
          <Link href={`/takas-teklif?urun=${item.kod}`} key={item.id} className="flex justify-between items-center p-4 bg-transparent hover:bg-white/5 rounded-2xl transition-colors border-b border-white/5 last:border-none group active:scale-[0.98]">
            
            {/* Sol: İsim ve Kod */}
            <div className="flex-1 min-w-0 pr-2">
              <h3 className="text-sm font-black text-white truncate group-hover:text-[#00f260] transition-colors">{item.isim}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-black text-slate-500 bg-white/5 px-2 py-0.5 rounded">{item.kod}</span>
                <span className="text-[9px] text-slate-600 truncate uppercase tracking-wider">{item.hacim}</span>
              </div>
            </div>

            {/* Orta: Değer */}
            <div className="w-24 text-right pr-4">
              <div className="text-sm font-black text-white italic">{item.deger}</div>
            </div>

            {/* Sağ: Trend Butonu */}
            <div className="w-20 text-right flex justify-end">
              <div className={`flex items-center justify-center gap-1 w-16 py-1.5 rounded-lg text-[10px] font-black shadow-sm ${item.trend === 'up' ? 'bg-[#00f260]/10 text-[#00f260] border border-[#00f260]/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                {item.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {item.yuzde}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
