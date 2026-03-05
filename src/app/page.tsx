"use client";
import React from "react";
import Link from "next/link";
import { Search, Zap, ArrowRight, ShieldCheck, LayoutGrid, ArrowLeftRight, User, TrendingUp, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#000000] text-zinc-100 font-sans selection:bg-[#00f260] selection:text-black pb-32 relative overflow-hidden">
      
      {/* 🌌 SİBER ATMOSFER (Derinlik Efektleri) */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[40%] bg-[#00f260]/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[-5%] w-[50%] h-[50%] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none"></div>

      {/* 🚀 ÜST BAR: Glassmorphism Header */}
      <div className="sticky top-0 z-50 bg-black/60 backdrop-blur-2xl border-b border-white/5 px-5 pt-7 pb-5">
        <div className="flex justify-between items-center mb-6">
           <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-[#00f260] rounded-lg flex items-center justify-center rotate-3">
               <ArrowLeftRight size={18} className="text-black" />
             </div>
             <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">
               ATA<span className="text-[#00f260]">KASA.</span>
             </h1>
           </div>
           <div className="w-11 h-11 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-[#00f260]">
             <User size={20} />
           </div>
        </div>
        
        <div className="relative group">
           <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
             <Search size={18} className="text-zinc-500" />
           </div>
           <input
             type="text"
             placeholder="Varlık veya borsa kodu ara..."
             className="w-full bg-zinc-900/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-[#00f260]/30 font-medium"
           />
        </div>
      </div>

      {/* 🚀 ANA VİZYON KARTI (Hero Section) */}
      <div className="px-5 mt-8">
        <div className="relative bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-white/10 rounded-[2.5rem] p-7 overflow-hidden">
           <div className="absolute top-0 right-0 p-4">
             <Sparkles size={40} className="text-[#00f260]/20" />
           </div>
           
           <div className="flex items-center gap-2 bg-white/5 border border-white/10 w-fit px-3 py-1.5 rounded-full mb-6">
             <ShieldCheck size={14} className="text-[#00f260]" />
             <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">Global Takas Borsası v3.0</span>
           </div>
           
           <h2 className="text-4xl font-black leading-[1.1] mb-4 tracking-tighter text-white">
             VARLIKLARINI <br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f260] to-emerald-400 italic">SİBER GÜÇLE</span> <br/>
             TAKASLA.
           </h2>
           
           <p className="text-zinc-400 text-sm mb-8 leading-relaxed font-medium">
             Dünyanın en gelişmiş takas algoritmasıyla eşyalarını saniyeler içinde yeni nesil varlıklara dönüştür.
           </p>
           
           <Link href="/urun-ekle" className="flex items-center justify-center gap-2 w-full bg-[#00f260] text-black px-6 py-5 rounded-[1.5rem] text-sm font-black uppercase tracking-widest active:scale-95 transition-all">
             HEMEN VARLIK YÜKLE <Zap size={18} fill="currentColor" />
           </Link>
        </div>
      </div>

      {/* 🚀 VİTRİN: Premium Siber Kartlar */}
      <div className="px-5 mt-10">
        <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6">Öne Çıkan Varlıklar</h3>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((urun) => (
            <Link href={`/urun/${urun}`} key={urun} className="group relative bg-zinc-900/20 border border-white/5 rounded-[2.2rem] overflow-hidden active:scale-95 transition-all">
              <div className="aspect-[3/4] bg-zinc-950 relative overflow-hidden">
                <img src={`https://placehold.co/600x800/09090b/00f260?text=Asset+${urun}`} alt="Asset" className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
              </div>
              <div className="p-4 bg-black/40 backdrop-blur-md -mt-4 relative rounded-t-3xl border-t border-white/5">
                <h4 className="text-[11px] font-bold text-zinc-200 line-clamp-2 mb-3">Siber Varlık Başlığı Örneği {urun}</h4>
                <div className="flex justify-between items-center">
                  <span className="text-[#00f260] font-black text-sm italic">{urun * 12}.000 ₺</span>
                  <ArrowRight size={14} className="text-[#00f260]" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 📱 DOCK: Lüks Alt Menü */}
      <div className="fixed bottom-7 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-[100]">
        <div className="bg-zinc-950/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-2.5 flex justify-between items-center shadow-2xl">
          <Link href="/" className="flex-1 flex justify-center py-3 text-[#00f260]">
            <LayoutGrid size={24} />
          </Link>
          <Link href="/borsa" className="flex-1 flex justify-center py-3 text-zinc-500">
            <Zap size={24} />
          </Link>
          <Link href="/urun-ekle" className="relative -top-8 w-16 h-16 bg-[#00f260] rounded-full flex items-center justify-center text-black border-[6px] border-[#000000] shadow-lg">
            <ArrowLeftRight size={28} />
          </Link>
          <button className="flex-1 flex justify-center py-3 text-zinc-500"><Search size={24} /></button>
          <button className="flex-1 flex justify-center py-3 text-zinc-500"><User size={24} /></button>
        </div>
      </div>

    </div>
  );
}
