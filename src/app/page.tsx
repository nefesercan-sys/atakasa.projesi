"use client";
import React from "react";
import Link from "next/link";
import { Search, Home as HomeIcon, ArrowLeftRight, Bell, User, Zap, Star } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#030712] text-white pb-20 md:pb-0 font-sans antialiased">
      
      {/* 🚀 ÜST BAR: Arama ve Profil (App Header) */}
      <div className="sticky top-0 z-50 bg-[#030712]/80 backdrop-blur-md border-b border-white/5 p-4 flex gap-3 items-center">
        <div className="flex-1 bg-[#0b0f19] border border-white/10 rounded-2xl flex items-center px-4 py-3 focus-within:border-[#00f260] transition-colors">
          <Search size={18} className="text-slate-500 mr-3" />
          <input 
            type="text" 
            placeholder="Ne takaslamak istersin?" 
            className="bg-transparent border-none text-sm text-white w-full outline-none placeholder:text-slate-600"
          />
        </div>
        <button className="w-12 h-12 bg-[#0b0f19] border border-white/10 rounded-2xl flex items-center justify-center relative">
          <Bell size={20} className="text-slate-300" />
          <span className="absolute top-3 right-3 w-2 h-2 bg-[#00f260] rounded-full shadow-[0_0_10px_#00f260]"></span>
        </button>
      </div>

      {/* 🚀 KAMPANYA / VİZYON ALANI */}
      <div className="p-4">
        <div className="w-full bg-gradient-to-r from-[#00f260]/20 to-[#030712] border border-[#00f260]/30 rounded-3xl p-6 relative overflow-hidden">
          <Zap className="absolute -right-4 -top-4 text-[#00f260]/10 w-32 h-32" />
          <h1 className="text-2xl font-black uppercase italic tracking-tighter mb-2">
            TAKAS <span className="text-[#00f260]">SEPETİ.</span>
          </h1>
          <p className="text-xs text-slate-300 font-bold mb-4 w-2/3 leading-relaxed">
            Fazlalık mı var? Sokağa atma, ekonomiye kat. Aradığını bul, takasla!
          </p>
          <Link href="/urun-ekle" className="inline-block bg-[#00f260] text-black text-xs font-black px-6 py-2 rounded-full uppercase tracking-widest hover:scale-105 transition-transform">
            + Varlık Ekle
          </Link>
        </div>
      </div>

      {/* 🚀 HIZLI KATEGORİLER (Yatay Kaydırmalı) */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Sektörler</h2>
          <span className="text-[10px] text-[#00f260] font-bold uppercase cursor-pointer">Tümü</span>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {['📱 Elektronik', '🚗 Vasıta', '💻 Bilgisayar', '🛋️ Mobilya', '⌚ Saat'].map((kat, i) => (
            <div key={i} className="shrink-0 bg-[#0b0f19] border border-white/5 px-5 py-3 rounded-2xl text-xs font-bold text-slate-300 whitespace-nowrap">
              {kat}
            </div>
          ))}
        </div>
      </div>

      {/* 🚀 VİTRİN: SİBER AKIŞ */}
      <div className="px-4">
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Senin İçin Seçilenler</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((urun) => (
            <Link href={`/urun/${urun}`} key={urun} className="bg-[#0b0f19] border border-white/5 rounded-3xl overflow-hidden active:scale-95 transition-transform">
              <div className="aspect-square bg-[#111827] relative">
                <img src={`https://placehold.co/400x400/111827/00f260?text=Varlık+${urun}`} alt="Ürün" className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-[#00f260] text-[9px] font-black px-2 py-1 rounded-lg uppercase">
                  Takasa Açık
                </div>
              </div>
              <div className="p-3">
                <h3 className="text-xs font-bold text-white line-clamp-2 mb-1">iPhone 13 Pro Max 256GB Kusursuz</h3>
                <p className="text-[10px] text-slate-500 mb-2 flex items-center gap-1"><Star size={10} className="text-amber-400 fill-amber-400"/> 4.9 Güven</p>
                <div className="text-[#00f260] font-black text-sm italic">35.000 ₺ <span className="text-[8px] text-slate-500 font-normal">değerinde</span></div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 📱 MOBİL ALT MENÜ (Sadece Mobilde Görünür - App Hissiyatı) */}
      <div className="md:hidden fixed bottom-0 w-full bg-[#030712]/90 backdrop-blur-lg border-t border-white/10 px-6 py-4 flex justify-between items-center z-50">
        <div className="flex flex-col items-center gap-1 text-[#00f260]">
          <HomeIcon size={20} />
          <span className="text-[9px] font-black uppercase">Keşfet</span>
        </div>
        <Link href="/borsa" className="flex flex-col items-center gap-1 text-slate-500 hover:text-white transition-colors">
          <Zap size={20} />
          <span className="text-[9px] font-black uppercase">Borsa</span>
        </Link>
        <Link href="/urun-ekle" className="w-12 h-12 bg-[#00f260] rounded-full flex items-center justify-center -mt-8 shadow-[0_0_20px_rgba(0,242,96,0.3)] text-black">
          <ArrowLeftRight size={24} />
        </Link>
        <div className="flex flex-col items-center gap-1 text-slate-500 hover:text-white transition-colors">
          <Search size={20} />
          <span className="text-[9px] font-black uppercase">Ara</span>
        </div>
        <Link href="/profil" className="flex flex-col items-center gap-1 text-slate-500 hover:text-white transition-colors">
          <User size={20} />
          <span className="text-[9px] font-black uppercase">Profil</span>
        </Link>
      </div>

    </div>
  );
}
