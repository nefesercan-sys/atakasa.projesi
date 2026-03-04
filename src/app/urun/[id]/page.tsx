"use client";
import React from "react";
import Link from "next/link";
import { ArrowLeft, Share2, Heart, ShieldCheck, MapPin, Zap } from "lucide-react";

export default function UrunDetay() {
  return (
    <div className="min-h-screen bg-[#030712] text-white pb-24 font-sans antialiased">
      
      {/* 🚀 UÇTAN UCA FOTOĞRAF ALANI */}
      <div className="relative w-full h-96 bg-[#111827]">
        {/* Üst Kayan Butonlar */}
        <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
          <Link href="/" className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex gap-2">
            <button className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10">
              <Share2 size={18} />
            </button>
            <button className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10">
              <Heart size={18} />
            </button>
          </div>
        </div>
        {/* Örnek Resim */}
        <img src="https://placehold.co/800x800/111827/00f260?text=Varlık+Görseli" alt="Varlık" className="w-full h-full object-cover" />
      </div>

      {/* 🚀 ÜRÜN BİLGİLERİ */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div className="bg-[#00f260]/10 text-[#00f260] text-[10px] font-black px-3 py-1 rounded-md uppercase tracking-widest border border-[#00f260]/20">
            Elektronik
          </div>
          <div className="text-xs text-slate-500 font-bold flex items-center gap-1">
            <MapPin size={12} /> İzmir, Karşıyaka
          </div>
        </div>
        
        <h1 className="text-2xl font-black mb-3 leading-tight">iPhone 13 Pro Max 256GB Kusursuz Temizlikte</h1>
        
        <div className="flex items-end gap-2 mb-6 border-b border-white/5 pb-6">
          <span className="text-3xl font-black text-[#00f260] italic">35.000 ₺</span>
          <span className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-widest">Piyasa Değeri</span>
        </div>

        {/* 🚀 SATICI (TAKASÇI) GÜVEN PROFİLİ */}
        <div className="bg-[#0b0f19] border border-white/5 rounded-2xl p-4 flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-tr from-[#00f260] to-sky-500 rounded-full p-[2px]">
              <div className="w-full h-full bg-[#030712] rounded-full border-2 border-[#030712] overflow-hidden">
                <img src="https://placehold.co/100/111827/fff?text=A" alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-sm">Ali Yılmaz</h3>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-black tracking-wider uppercase mt-1">
                <ShieldCheck size={12} className="text-[#00f260]" /> Siber Onaylı Hesap
              </div>
            </div>
          </div>
          <Link href="/profil/ali" className="text-[10px] font-black bg-white/5 text-white px-4 py-2 rounded-xl uppercase tracking-widest hover:bg-white/10 transition-colors">
            Profili Gör
          </Link>
        </div>

        {/* 🚀 AÇIKLAMA */}
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-3">Varlık Detayları</h3>
        <p className="text-sm text-slate-300 leading-relaxed font-medium">
          Cihazım ilk günkü gibi temizdir. Sadece oyuncu bilgisayarı (Tercihen RTX 3080 ve üzeri sistemler) veya dengi mantıklı teknolojik aletlerle takas düşünülür. Üste nakit alıp verebilirim, tekliflere açığım.
        </p>
      </div>

      {/* 🚀 SABİT ALT AKSİYON BARI (App Style Sticky Bottom) */}
      <div className="fixed bottom-0 w-full bg-[#030712]/90 backdrop-blur-xl border-t border-white/10 p-4 flex gap-3 z-50">
        <button className="flex-1 bg-[#0b0f19] border border-white/10 text-white font-black uppercase tracking-widest text-xs py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/5 transition-colors">
          Mesaj At
        </button>
        <button className="flex-[2] bg-[#00f260] text-black font-black uppercase tracking-widest text-xs py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,242,96,0.3)] hover:scale-[1.02] transition-transform">
          <Zap size={16} /> TAKAS TEKLİF ET
        </button>
      </div>

    </div>
  );
}
