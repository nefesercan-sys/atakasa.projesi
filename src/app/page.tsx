"use client";
import React from "react";
import Link from "next/link";
import { Search, ArrowRight, ShieldCheck, Zap, LayoutGrid, ArrowLeftRight, User } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans pb-28 selection:bg-emerald-500 selection:text-black">
      
      {/* 🚀 ÜST BAR: Akıllı Arama ve Karşılama (Glassmorphism) */}
      <div className="sticky top-0 z-50 bg-black/70 backdrop-blur-xl border-b border-white/10 px-4 pt-6 pb-4">
        <div className="flex justify-between items-center mb-6">
           <h1 className="text-2xl font-black tracking-tighter text-white">
             ATA<span className="text-emerald-500">KASA.</span>
           </h1>
           <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 p-[1px]">
             <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
               <User size={18} className="text-emerald-500"/>
             </div>
           </div>
        </div>
        
        {/* Lüks Arama Çubuğu */}
        <div className="relative group">
           <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
             <Search size={18} className="text-zinc-500" />
           </div>
           <input
             type="text"
             placeholder="Varlık, kategori veya kod ara..."
             className="w-full bg-zinc-900/60 border border-zinc-800 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-zinc-200 outline-none focus:border-emerald-500/50 focus:bg-zinc-900 transition-all placeholder:text-zinc-600 shadow-inner"
           />
        </div>
      </div>

      {/* 🚀 HERO BÖLÜMÜ: Premium Vizyon Kartı */}
      <div className="px-4 mt-6">
        <div className="relative bg-gradient-to-b from-zinc-900 to-black border border-zinc-800 rounded-3xl p-6 overflow-hidden shadow-2xl">
           {/* Gizli Parlama Efekti */}
           <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none"></div>
           
           <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-5 border border-emerald-500/20">
             <ShieldCheck size={14} /> Siber Güvenli Takas
           </div>
           
           <h2 className="text-3xl font-bold tracking-tight mb-3 text-white leading-snug">
             Değerini <br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Keşfet & Takasla.</span>
           </h2>
           
           <p className="text-zinc-400 text-sm mb-8 leading-relaxed font-medium">
             Kullanmadığın varlıkları premium ekosistemde değerlendir. Gerçek değerinde, güvenle takasla.
           </p>
           
           <Link href="/urun-ekle" className="inline-flex items-center justify-center gap-2 w-full bg-emerald-500 text-black px-6 py-4 rounded-2xl text-sm font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-[0.98] transition-all">
             Sisteme Varlık Ekle <ArrowRight size={18} />
           </Link>
        </div>
      </div>

      {/* 🚀 LÜKS KATEGORİLER */}
      <div className="mt-8">
        <div className="px-5 mb-4 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-zinc-300">Kategoriler</h3>
          <span className="text-[11px] text-emerald-500 font-medium cursor-pointer">Tümünü Gör</span>
        </div>
        <div className="flex gap-3 overflow-x-auto px-5 pb-4 scrollbar-hide">
          {['📱 Elektronik', '🚗 Vasıta', '💻 Bilgisayar', '🛋️ Mobilya', '⌚ Lüks Saat'].map((kat, i) => (
            <div key={i} className="shrink-0 bg-zinc-900/80 border border-zinc-800 px-5 py-2.5 rounded-xl text-xs font-medium text-zinc-300 whitespace-nowrap active:bg-zinc-800 transition-colors cursor-pointer">
              {kat}
            </div>
          ))}
        </div>
      </div>

      {/* 🚀 VİTRİN: Premium Ürün Kartları */}
      <div className="px-4 mt-2">
        <h3 className="text-sm font-semibold text-zinc-300 mb-4 px-1">Sizin İçin Seçilenler</h3>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((urun) => (
            <Link href={`/urun/${urun}`} key={urun} className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col active:scale-[0.98] transition-transform">
              
              <div className="aspect-[4/5] bg-zinc-950 relative">
                <img src={`https://placehold.co/400x500/18181b/10b981?text=Urun+${urun}`} alt="Ürün" className="w-full h-full object-cover opacity-90" />
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-md border border-white/5 flex items-center gap-1">
                   <Zap size={10} /> Takasa Uygun
                </div>
              </div>
              
              <div className="p-3 bg-zinc-900/80">
                <h4 className="text-xs font-medium text-zinc-200 line-clamp-2 mb-2 leading-relaxed">Apple iPhone 13 Pro Max 256GB - Kusursuz</h4>
                <div className="text-emerald-400 font-bold text-sm">35.000 ₺</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 📱 İOS STİLİ YÜZEN ALT MENÜ (Floating Dock) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-50">
        <div className="bg-zinc-900/90 backdrop-blur-2xl border border-zinc-800 rounded-3xl p-2 flex justify-between items-center shadow-[0_20px_40px_rgba(0,0,0,0.8)]">
          <Link href="/" className="flex-1 flex flex-col items-center gap-1 p-2 text-emerald-500">
            <LayoutGrid size={22} />
          </Link>
          <Link href="/borsa" className="flex-1 flex flex-col items-center gap-1 p-2 text-zinc-500 hover:text-zinc-300 transition-colors">
            <Zap size={22} />
          </Link>
          
          {/* Ortadaki Aksiyon Butonu */}
          <Link href="/urun-ekle" className="relative -top-6 w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center text-black border-[5px] border-black shadow-lg active:scale-95 transition-transform">
            <ArrowLeftRight size={22} />
          </Link>

          <button className="flex-1 flex flex-col items-center gap-1 p-2 text-zinc-500 hover:text-zinc-300 transition-colors">
            <Search size={22} />
          </button>
          <button className="flex-1 flex flex-col items-center gap-1 p-2 text-zinc-500 hover:text-zinc-300 transition-colors">
            <User size={22} />
          </button>
        </div>
      </div>

    </div>
  );
}
