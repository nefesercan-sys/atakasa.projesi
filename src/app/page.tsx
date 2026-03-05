"use client";
import React from "react";
import Link from "next/link";
import { Search, Zap, ArrowRight, ShieldCheck, LayoutGrid, ArrowLeftRight, User, TrendingUp, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#000000] text-zinc-100 font-sans selection:bg-[#00f260] selection:text-black pb-32 relative overflow-hidden">
      
      {/* 🌌 SİBER ATMOSFER (Derinlik Efektleri) */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[40%] bg-[#00f260]/5 blur-[120px] rounded-full pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[10%] right-[-5%] w-[50%] h-[50%] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none"></div>

      {/* 🚀 ÜST BAR: Glassmorphism Header */}
      <div className="sticky top-0 z-50 bg-black/60 backdrop-blur-2xl border-b border-white/5 px-5 pt-7 pb-5">
        <div className="flex justify-between items-center mb-6">
           <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-[#00f260] rounded-lg flex items-center justify-center rotate-3 shadow-[0_0_15px_rgba(0,242,96,0.4)]">
               <ArrowLeftRight size={18} className="text-black" />
             </div>
             <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">
               ATA<span className="text-[#00f260]">KASA.</span>
             </h1>
           </div>
           <div className="flex items-center gap-3">
             <div className="hidden md:flex flex-col items-end mr-2">
               <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Siber Puan</span>
               <span className="text-xs font-black text-[#00f260]">1,250 XP</span>
             </div>
             <div className="w-11 h-11 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-[#00f260] hover:border-[#00f260]/50 transition-all cursor-pointer">
               <User size={20} />
             </div>
           </div>
        </div>
        
        {/* Arama Motoru: Minimalist & Fonksiyonel */}
        <div className="relative group">
           <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
             <Search size={18} className="text-zinc-500 group-focus-within:text-[#00f260] transition-colors" />
           </div>
           <input
             type="text"
             placeholder="Varlık, marka veya borsa kodu ara..."
             className="w-full bg-zinc-900/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-[#00f260]/30 focus:bg-zinc-900/80 transition-all placeholder:text-zinc-600 font-medium"
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
           
           <h2 className="text-4xl font-black leading-[1.1] mb-4 tracking-tighter">
             VARLIKLARINI <br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f260] to-emerald-400 italic">SİBER GÜÇLE</span> <br/>
             TAKASLA.
           </h2>
           
           <p className="text-zinc-400 text-sm mb-8 leading-relaxed font-medium w-11/12">
             Dünyanın en gelişmiş takas algoritmasıyla eşyalarını saniyeler içinde yeni nesil varlıklara dönüştür.
           </p>
           
           <Link href="/urun-ekle" className="flex items-center justify-center gap-2 w-full bg-[#00f260] text-black px-6 py-5 rounded-[1.5rem] text-sm font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(0,242,96,0.4)] active:scale-95 transition-all">
             HEMEN VARLIK YÜKLE <Zap size={18} fill="currentColor" />
           </Link>
        </div>
      </div>

      {/* 🚀 CANLI BORSA TRENDLERİ (Yatay Kayan Liste) */}
      <div className="mt-10">
        <div className="px-6 flex justify-between items-end mb-4">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Piyasa Trendleri</h3>
          <Link href="/borsa" className="text-[10px] text-[#00f260] font-black uppercase border-b border-[#00f260]/30 pb-0.5">Tahtayı İncele</Link>
        </div>
        <div className="flex gap-4 overflow-x-auto px-6 pb-6 scrollbar-hide snap-x">
          {[
            { label: "Elektronik", val: "+12.4%", up: true },
            { label: "Vasıta", val: "-2.1%", up: false },
            { label: "Lüks Saat", val: "+8.7%", up: true },
            { label: "Emlak", val: "+0.4%", up: true }
          ].map((item, i) => (
