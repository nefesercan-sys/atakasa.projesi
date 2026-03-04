"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { TrendingUp, Sun, User, ArrowRight, Zap, ArrowLeftRight } from "lucide-react";

export default function Home() {
  const [sloganIdx, setSloganIdx] = useState(0);

  const sloganlar = [
    "SATAMIYOR MUSUN? BEKLEME, AT TAKASA!",
    "FAZLALIK MI VAR? YÜK ETME, AT TAKASA!",
    "ÇÖPE ATMA, EKONOMİYE KAT: AT TAKASA!",
    "ARADIĞIN GELSİN, İSTEMEDİĞİN GİTSİN: AT TAKASA!",
    "EŞYAN DEĞERİNİ BULSUN: AT TAKASA!"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setSloganIdx((prev) => (prev + 1) % sloganlar.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#030712] text-white selection:bg-[#00f260] selection:text-black font-sans antialiased">
      
      {/* 📊 1. ÜST BİLGİ VE FİNANS BAR */}
      <div className="w-full bg-[#0b0f19] border-b border-white/5 py-2 px-4 flex justify-between items-center text-[10px] md:text-xs font-black uppercase tracking-widest overflow-hidden">
        <div className="flex gap-6 animate-marquee whitespace-nowrap">
          <span className="flex items-center gap-1 text-slate-300"><TrendingUp size={14} className="text-[#00f260]" /> USD 42.15 ₺</span>
          <span className="flex items-center gap-1 text-slate-300"><TrendingUp size={14} className="text-[#00f260]" /> EUR 45.30 ₺</span>
          <span className="flex items-center gap-1 text-amber-400">🥇 GR ALTIN 3.120 ₺</span>
        </div>
        <div className="flex gap-6 items-center shrink-0 ml-4">
          <span className="flex items-center gap-2 text-sky-400"><Sun size={14} /> İZMİR 18°C</span>
          <Link href="/trades" className="hidden md:flex items-center gap-2 text-[#00f260] hover:text-white transition-colors bg-[#00f260]/10 px-3 py-1 rounded-full border border-[#00f260]/20">
            <User size={14} /> SİBER PANEL
          </Link>
        </div>
      </div>

      {/* 🚀 2. HİPNOTİK KAHRAMAN ALANI */}
      <div className="relative pt-16 pb-12 px-4 flex flex-col items-center justify-center text-center overflow-hidden border-b border-white/5 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#00f260]/5 via-[#030712] to-[#030712]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00f260]/10 blur-[120px] rounded-full pointer-events-none"></div>
        
        <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter mb-6 relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-300 to-slate-500">
          TAKAS <span className="text-[#00f260] drop-shadow-[0_0_20px_rgba(0,242,96,0.8)]">SEPETİ.</span>
        </h1>
        
        <div className="h-12 flex items-center justify-center relative z-10 mb-8">
          <p className="text-xl md:text-3xl font-black text-white italic tracking-wider uppercase" key={sloganIdx}>
            {sloganlar[sloganIdx]}
          </p>
        </div>

        {/* Ticker (Kayan Yazı) */}
        <div className="w-full max-w-5xl overflow-hidden border-y border-white/5 py-3 relative z-10 bg-[#0b0f19]/50 backdrop-blur-sm transform -rotate-1">
          <div className="flex space-x-12 animate-marquee-fast whitespace-nowrap text-[#00f260] font-black text-xs uppercase tracking-[0.3em]">
            <span>⚡ Hızlı Sat, At Takasa</span>
            <span>♻️ Çöpe Atma, Sokağa Atma, At Takasa</span>
            <span>💰 Eşyan Değer Görsün, At Takasa</span>
            <span>🎯 Aradığını Bul, At Takasa</span>
          </div>
        </div>
      </div>

      {/* 🧩 3. ANA İSKELET: VİTRİN VE CANLI AKIŞ */}
      <div className="max-w-[1400px] mx-auto px-4 py-12 grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 space-y-12">
          {/* Sektörler */}
          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-widest mb-6 border-l-4 border-[#00f260] pl-4">SİBER SEKTÖRLER</h2>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
              {['ELEKTRONİK', 'VASITA', 'EMLAK', 'GİYİM', 'BİLGİSAYAR', 'ANTİKA'].map((k, i) => (
                <Link href={`/kategori/${k.toLowerCase()}`} key={i} className="shrink-0 px-6 py-3 bg-[#0b0f19] border border-white/5 rounded-2xl font-bold text-xs uppercase tracking-widest hover:border-[#00f260] hover:text-[#00f260] transition-colors">
                  {k}
                </Link>
              ))}
            </div>
          </div>

          {/* Vitrin */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[#0b0f19] border border-white/5 rounded-[2rem] overflow-hidden group hover:border-[#00f260]/50 transition-all">
                <div className="aspect-square bg-[#030712] relative">
                  <div className="absolute inset-0 flex items-center justify-center text-[#00f260] font-black">VARLIK {i}</div>
                </div>
                <div className="p-5">
                  <h3 className="text-white font-bold text-sm uppercase mb-4">Siber İlan Örneği {i}</h3>
                  <div className="flex justify-between items-end">
                    <p className="text-[#00f260] font-black text-lg italic">{i * 1250} ₺</p>
                    <button className="w-10 h-10 bg-[#00f260]/10 rounded-full flex items-center justify-center text-[#00f260] hover:bg-[#00f260] hover:text-black transition-colors">
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SAĞ KOLON: Canlı Takas Akışı */}
        <div className="xl:col-span-1">
          <div className="bg-[#0b0f19] border border-white/5 rounded-[2.5rem] p-6 sticky top-24">
            <h2 className="text-lg font-black uppercase italic tracking-widest flex items-center gap-2 mb-6 pb-4 border-b border-white/5">
              <Zap className="text-amber-400" /> CANLI AKIŞ
            </h2>
            <div className="space-y-4">
              {[1, 2, 3].map((f) => (
                <div key={f} className="bg-[#030712] p-4 rounded-2xl border border-white/5 hover:border-amber-400/30 transition-colors">
                   <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-white/5 rounded-lg"></div>
                    <ArrowLeftRight size={12} className="text-slate-500" />
                    <div className="w-8 h-8 bg-[#00f260]/10 rounded-lg"></div>
                  </div>
                  <p className="text-slate-400 text-[10px] font-bold line-clamp-2">Teklif: iPhone 13 Pro {f} ➡️ Mac Studio</p>
                </div>
              ))}
            </div>
            <Link href="/takas-teklif" className="mt-6 w-full py-4 bg-[#00f260] text-black rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-all">
              DAHİL OL <Zap size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
