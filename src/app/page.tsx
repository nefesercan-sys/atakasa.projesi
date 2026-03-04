"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { TrendingUp, Sun, Wind, User, ArrowRight, Zap, ArrowLeftRight } from "lucide-react";

export default function Home() {
  const [sloganIdx, setSloganIdx] = useState(0);

  // 🧠 BİLİNÇALTI SİBER SLOGANLAR (Her 4 saniyede bir değişir)
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
    <div className="min-h-screen bg-[#030712] text-white selection:bg-[#00f260] selection:text-black font-sans">
      
      {/* 📊 1. ÜST BİLGİ VE FİNANS BAR (Döviz, Altın, Hava Durumu) */}
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

      {/* 🚀 2. HİPNOTİK KAHRAMAN ALANI (Hero Section) */}
      <div className="relative pt-16 pb-12 px-4 flex flex-col items-center justify-center text-center overflow-hidden border-b border-white/5 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#00f260]/5 via-[#030712] to-[#030712]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00f260]/10 blur-[120px] rounded-full pointer-events-none"></div>
        
        {/* 🔥 YENİ MARKA: TAKAS SEPETİ */}
        <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter mb-6 relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-300 to-slate-500">
          TAKAS <span className="text-[#00f260] drop-shadow-[0_0_20px_rgba(0,242,96,0.8)]">SEPETİ.</span>
        </h1>
        
        <div className="h-12 flex items-center justify-center relative z-10 mb-8">
          <p className="text-xl md:text-3xl font-black text-white italic tracking-wider uppercase animate-in slide-in-from-bottom duration-500" key={sloganIdx}>
            {sloganlar[sloganIdx]}
          </p>
        </div>

        {/* CSS Ticker (Kayan Yazı) */}
        <div className="w-full max-w-5xl overflow-hidden border-y border-white/5 py-3 relative z-10 bg-[#0b0f19]/50 backdrop-blur-sm transform -rotate-1">
          <div className="flex space-x-12 animate-marquee-fast whitespace-nowrap text-[#00f260] font-black text-xs uppercase tracking-[0.3em]">
            <span>⚡ Hızlı Sat, At Takasa</span>
            <span>♻️ Çöpe Atma, Sokağa Atma, At Takasa</span>
            <span>💰 Eşyan Değer Görsün, At Takasa</span>
            <span>🎯 Aradığını Bul, At Takasa</span>
            <span>⚡ Hızlı Sat, At Takasa</span>
            <span>♻️ Çöpe Atma, Sokağa Atma, At Takasa</span>
          </div>
        </div>
      </div>

      {/* 🧩 3. ANA İSKELET: VİTRİN VE CANLI AKIŞ */}
      <div className="max-w-[1400px] mx-auto px-4 py-12 grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* SOL/ORTA KOLON: Sektörler ve Karışık Vitrin (3 Kolonluk Yer Kaplar) */}
        <div className="xl:col-span-3 space-y-12">
          
          {/* Hızlı Sektör Butonları */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black uppercase italic tracking-widest text-white border-l-4 border-[#00f260] pl-4">SİBER <span className="text-slate-500">SEKTÖRLER</span></h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
              {['ELEKTRONİK', 'VASITA', 'EMLAK', 'GİYİM', 'BİLGİSAYAR', 'ANTİKA', 'HİZMET', 'DİĞER'].map((kategori, i) => (
                <Link href={`/kategori/${kategori.toLowerCase()}`} key={i} className="shrink-0 px-6 py-3 bg-[#0b0f19] border border-white/5 rounded-2xl font-bold text-xs uppercase tracking-widest hover:border-[#00f260] hover:text-[#00f260] transition-colors whitespace-nowrap">
                  {kategori}
                </Link>
              ))}
            </div>
          </div>

          {/* SİBER VİTRİN (Karışık İlanlar) */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black uppercase italic tracking-widest text-[#00f260] border-l-4 border-white pl-4">ÖNE ÇIKAN <span className="text-white">VARLIKLAR</span></h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {/* Vitrin İlan Kartı Simülasyonu */}
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <div key={item} className="bg-[#0b0f19] border border-white/5 rounded-[2rem] overflow-hidden group hover:border-[#00f260]/50 hover:shadow-[0_0_30px_rgba(0,242,96,0.1)] transition-all flex flex-col">
                  <div className="aspect-square bg-[#030712] relative overflow-hidden">
                    <img src={`https://placehold.co/400x400/030712/00f260?text=Varlık+${item}`} alt="İlan" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-3 left-3 bg-[#00f260] text-black text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                      TAKAS & SATIŞ
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-grow justify-between">
                    <div>
                      <h3 className="text-white font-bold text-sm uppercase leading-tight mb-2 line-clamp-2 group-hover:text-[#00f260] transition-colors">Siber İlan Başlığı Örneği {item}</h3>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-end">
                      <div>
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">PİYASA DEĞERİ</p>
                        <p className="text-[#00f260] font-black text-lg italic">{item * 1250} ₺</p>
                      </div>
                      <button className="w-10 h-10 bg-[#00f260]/10 rounded-full flex items-center justify-center text-[#00f260] hover:bg-[#00f260] hover:text-black transition-colors">
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* SAĞ KOLON: Canlı Takas Akışı (Sidebar) */}
        <div className="xl:col-span-1">
          <div className="bg-[#0b0f19] border border-white/5 rounded-[2.5rem] p-6 sticky top-24">
            <h2 className="text-lg font-black uppercase italic tracking-widest text-white flex items-center gap-2 mb-6 pb-4 border-b border-white/5">
              <Zap className="text-amber-400" /> CANLI TAKAS AĞI
            </h2>
            
            <div className="space-y-4">
              {/* Canlı Akış Kartı Simülasyonu */}
              {[1, 2, 3, 4, 5].map((feed) => (
                <div key={feed} className="bg-[#030712] p-4 rounded-2xl border border-white/5 hover:border-amber-400/30 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[8px] bg-amber-400/10 text-amber-400 px-2 py-1 rounded font-black uppercase tracking-widest">YENİ TEKLİF</span>
                    <span className="text-[8px] text-slate-600 font-black">2 DK ÖNCE</span>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="w-10 h-10 bg-white/5 rounded-lg shrink-0 overflow-hidden"><img src={`https://placehold.co/100/030712/fff?text=A`} alt="A" /></div>
                    <ArrowLeftRight size={14} className="text-slate-500 shrink-0" />
                    <div className="w-10 h-10 bg-white/5 rounded-lg shrink-0 overflow-hidden"><img src={`https://placehold.co/100/030712/00f260?text=B`} alt="B" /></div>
                  </div>
                  <p className="text-slate-400 text-[10px] mt-3 font-bold leading-relaxed line-clamp-2 group-hover:text-white transition-colors">
                    iPhone 13 Pro ile Oyuncu Bilgisayarı takasa sunuldu. Üste 5000₺ nakit teklifi var.
                  </p>
                </div>
              ))}
            </div>
            
            <Link href="/takas-teklif" className="mt-6 w-full py-4 bg-[#00f260] text-black rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,242,96,0.4)] transition-all">
              SİSTEME DAHİL OL <Zap size={14} />
            </Link>
          </div>
        </div>

      </div>
      
    </div>
  );
}
