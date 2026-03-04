"use client";
import React from "react";
import Link from "next/link";
import { Search, Sparkles, ArrowRight, ShieldCheck, Zap, LayoutGrid, ArrowLeftRight, User } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans selection:bg-[#00f260] selection:text-black pb-28 relative overflow-hidden">
      
      {/* 🌌 ARKAPLAN SİBER PARLAMALARI (Derinlik Katar) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#00f260]/10 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[150px] rounded-full pointer-events-none"></div>

      {/* 🚀 ÜST BAR: Akıllı Arama ve Karşılama (Glassmorphism) */}
      <div className="sticky top-0 z-50 bg-[#000000]/60 backdrop-blur-2xl border-b border-white/5 pt-6 pb-4 px-5">
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-2xl font-black uppercase tracking-tighter text-white">
            ATA<span className="text-[#00f260]">KASA.</span>
          </h1>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00f260] to-blue-500 p-[2px]">
            <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
              <span className="text-xs font-bold">NEX</span>
            </div>
          </div>
        </div>
        
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-500 group-focus-within:text-[#00f260] transition-colors" />
          </div>
          <input 
            type="text" 
            placeholder="Ne arıyorsun? (Örn: iPhone 13 Pro)" 
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-[#00f260]/50 focus:bg-white/10 transition-all placeholder:text-slate-500 font-medium shadow-inner"
          />
        </div>
      </div>

      {/* 🚀 HERO BÖLÜMÜ: Premium Vizyon Kartı */}
      <div className="px-5 mt-6 relative z-10">
        <div className="bg-gradient-to-br from-[#0a0f18] to-[#050505] border border-white/10 rounded-[2rem] p-6 relative overflow-hidden shadow-2xl">
          <Sparkles className="absolute top-4 right-4 text-[#00f260]/30 w-24 h-24 blur-md" />
          <div className="inline-flex items-center gap-1.5 bg-[#00f260]/10 text-[#00f260] px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-[#00f260]/20">
            <ShieldCheck size={12} /> Siber Güvenli Ticaret
          </div>
          <h2 className="text-3xl font-black leading-tight mb-3">
            Geleceğin <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f260] to-teal-400">Takas Ağına</span><br />
            Hoş Geldin.
          </h2>
          <p className="text-slate-400 text-xs font-medium w-4/5 leading-relaxed mb-6">
            Eski eşyalarını çöpe atma. Premium siber borsada değerinde takasla veya anında nakde çevir.
          </p>
          <Link href="/urun-ekle" className="inline-flex items-center gap-2 bg-[#00f260] text-black px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,242,96,0.3)]">
            Hemen Varlık Ekle <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* 🚀 LÜKS KATEGORİLER (Pill Design) */}
      <div className="mt-8 relative z-10">
        <div className="flex justify-between items-center px-5 mb-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-white">Siber Sektörler</h3>
          <span className="text-[10px] text-[#00f260] font-bold uppercase tracking-widest cursor-pointer hover:underline">Tümü</span>
        </div>
        <div className="flex gap-3 overflow-x-auto px-5 pb-4 scrollbar-hide snap-x">
          {['📱 Elektronik', '🚗 Vasıta', '💻 Bilgisayar', '🛋️ Mobilya', '⌚ Lüks Saat'].map((kat, i) => (
            <div key={i} className="snap-start shrink-0 bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3.5 rounded-full text-xs font-bold text-slate-300 whitespace-nowrap backdrop-blur-md transition-all cursor-pointer shadow-sm">
              {kat}
            </div>
          ))}
        </div>
      </div>

      {/* 🚀 VİTRİN: Premium Ürün Kartları */}
      <div className="px-5 mt-4 relative z-10">
        <h3 className="text-sm font-black uppercase tracking-widest text-white mb-5">Sizin İçin Seçilenler</h3>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((urun) => (
            <Link href={`/urun/${urun}`} key={urun} className="group bg-[#0a0a0a] border border-white/5 rounded-[2rem] overflow-hidden active:scale-95 transition-all shadow-lg hover:border-[#00f260]/30 hover:shadow-[0_0_30px_rgba(0,242,96,0.05)] flex flex-col">
              
              {/* Fotoğraf Alanı */}
              <div className="aspect-[4/5] relative bg-[#111] overflow-hidden">
                <img src={`https://placehold.co/600x800/111/00f260?text=Varlık+${urun}`} alt="Varlık" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-80"></div>
                
                {/* Sol Üst Etiket */}
                <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md border border-white/10 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                  <Zap size={10} className="text-[#00f260]" /> Takasa Açık
                </div>
              </div>

              {/* Bilgi Alanı */}
              <div className="p-4 flex flex-col flex-grow justify-between bg-[#0a0a0a] z-10 -mt-2 rounded-t-2xl relative">
                <div>
                  <h4 className="text-xs font-bold text-slate-200 line-clamp-2 leading-snug mb-2 group-hover:text-white transition-colors">
                    Apple iPhone 13 Pro Max 256GB Kusursuz {urun}
                  </h4>
                </div>
                <div className="flex justify-between items-end mt-2 pt-3 border-t border-white/5">
                  <div>
                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest block mb-0.5">Değer</span>
                    <span className="text-[#00f260] font-black text-sm">35.000 ₺</span>
                  </div>
                  <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-[#00f260]/20 group-hover:text-[#00f260] transition-colors">
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>

            </Link>
          ))}
        </div>
      </div>

      {/* 📱 İOS STİLİ YÜZEN ALT MENÜ (Floating Dock) */}
      <div className="fixed bottom-6 w-full px-5 z-[100] md:hidden">
        <div className="bg-[#050505]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-2 flex justify-between items-center shadow-[0_20px_40px_rgba(0,0,0,0.8)]">
          <Link href="/" className="flex-1 flex flex-col items-center gap-1 p-2">
            <LayoutGrid size={22} className="text-[#00f260]" />
            <span className="text-[9px] font-black text-[#00f260]">Vitrin</span>
          </Link>
          <Link href="/borsa" className="flex-1 flex flex-col items-center gap-1 p-2 text-slate-500 hover:text-white transition-colors">
            <Zap size={22} />
            <span className="text-[9px] font-black">Borsa</span>
          </Link>
          
          {/* Ortadaki Dev Buton */}
          <Link href="/urun-ekle" className="relative -top-5 w-16 h-16 bg-[#00f260] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,242,96,0.3)] text-black border-[6px] border-[#000000] active:scale-95 transition-transform">
            <ArrowLeftRight size={26} />
          </Link>

          <button className="flex-1 flex flex-col items-center gap-1 p-2 text-slate-500 hover:text-white transition-colors">
            <Search size={22} />
            <span className="text-[9px] font-black">Ara</span>
          </button>
          <button className="flex-1 flex flex-col items-center gap-1 p-2 text-slate-500 hover:text-white transition-colors">
            <User size={22} />
            <span className="text-[9px] font-black">Profil</span>
          </button>
        </div>
      </div>

    </div>
  );
}
