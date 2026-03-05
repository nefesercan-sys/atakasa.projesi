"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function VarlikDetay() {
  const params = useParams();
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Demo Siber Varlık (İleride MongoDB'den params.id'ye göre çekilecek)
  const varlik = {
    id: params.id,
    baslik: "MacBook Pro M3 Max 1TB - Kutu & Faturalı",
    deger: "120.000 ₺",
    takasIstegi: "Üst model araçlarla veya İzmir içi arsa ile takas olur. Altı üstü konuşulur.",
    kategori: "Teknoloji Endeksi",
    konum: "İzmir, Karşıyaka",
    tarih: "2 saat önce piyasaya sürüldü",
    aciklama: "Cihaz kozmetik olarak 10/10'dur. Sadece ofiste yazılım için kullanıldı. Pil devri 45. Kutusu, orijinal şarj aleti ve faturası eksiksiz teslim edilecektir. Sadece mantıklı takas tekliflerine açığım, nakit satılık DEĞİLDİR.",
    sahip: { isim: "Ercan N.", islemSayisi: 42, guvenSkoru: "%98" },
    resimler: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1511385348-a52b4a160dc2?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1531297172864-16ce38ea4c03?auto=format&fit=crop&q=80&w=1200"
    ]
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans pb-32 pt-6">
      
      {/* 🌌 ARKA PLAN DERİNLİĞİ */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-[#00f260] opacity-[0.02] blur-[150px] rounded-full"></div>
      </div>

      <div className={`relative z-10 max-w-[1200px] mx-auto px-4 md:px-8 transition-all duration-1000 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        
        {/* ÜST GERİ DÖNÜŞ VE KATEGORİ */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-[#00f260] transition-colors font-bold text-xs uppercase tracking-widest">
            <span className="text-lg">←</span> Piyasaya Dön
          </button>
          <span className="bg-[#00f260]/10 border border-[#00f260]/20 text-[#00f260] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            {varlik.kategori}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* 📸 SOL TARAF: GÖRSEL GALERİSİ */}
          <div className="space-y-4">
            <div className="aspect-square md:aspect-[4/3] w-full bg-[#0a0a0a] border border-white/[0.05] rounded-[2.5rem] overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <img src={varlik.resimler[activeImage]} alt={varlik.baslik} className="w-full h-full object-cover transition-all duration-500" />
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase border border-white/10">
                {activeImage + 1} / {varlik.resimler.length}
              </div>
            </div>
            
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {varlik.resimler.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveImage(idx)}
                  className={`relative flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${activeImage === idx ? 'border-[#00f260] opacity-100 shadow-[0_0_15px_rgba(0,242,96,0.3)]' : 'border-transparent opacity-50 hover:opacity-100'}`}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* 📊 SAĞ TARAF: VARLIK BİLGİLERİ VE AKSİYON */}
          <div className="flex flex-col">
            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4 tracking-tight">
              {varlik.baslik}
            </h1>
            
            <div className="flex items-center gap-4 text-slate-400 text-xs font-bold uppercase tracking-widest mb-8 border-b border-white/[0.05] pb-6">
              <span className="flex items-center gap-1.5"><span className="text-lg">📍</span> {varlik.konum}</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><span className="text-lg">⏱️</span> {varlik.tarih}</span>
            </div>

            {/* DEĞER VE TAKAS ŞARTLARI */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-[#0a0a0a] border border-white/[0.04] p-6 rounded-3xl shadow-inner">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Tahmini Piyasa Değeri</p>
                <p className="text-3xl font-black text-[#00f260]">{varlik.deger}</p>
              </div>
              <div className="bg-[#00f260]/[0.02] border border-[#00f260]/10 p-6 rounded-3xl shadow-inner">
                <p className="text-[#00f260]/70 text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-2"><span className="text-sm">🔄</span> Takas Beklentisi</p>
                <p className="text-white text-xs font-bold leading-relaxed">{varlik.takasIstegi}</p>
              </div>
            </div>

            {/* AÇIKLAMA */}
            <div className="mb-10">
              <h3 className="text-white text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-4">
                Varlık Raporu <div className="h-[1px] flex-1 bg-gradient-to-r from-white/[0.05] to-transparent"></div>
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed font-medium">
                {varlik.aciklama}
              </p>
            </div>

            <div className="mt-auto space-y-4">
              {/* SAHİP PROFİLİ ÖZETİ */}
              <div className="flex items-center justify-between bg-[#0a0a0a] border border-white/[0.04] p-4 rounded-2xl mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/[0.05] rounded-full flex items-center justify-center border border-white/10 text-xl">
                    👤
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">{varlik.sahip.isim}</p>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{varlik.sahip.islemSayisi} Başarılı İşlem</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[#00f260] text-sm font-black">{varlik.sahip.guvenSkoru}</p>
                  <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Güven Endeksi</p>
                </div>
              </div>

              {/* DEV TAKAS REAKTÖRÜ */}
              <button onClick={() => alert("Siber Teklif Modülü Yakında Devreye Girecek!")} className="w-full relative group overflow-hidden rounded-[2rem] p-[2px]">
                <span className="absolute inset-0 bg-gradient-to-r from-[#00f260] to-emerald-400 rounded-[2rem] opacity-70 group-hover:opacity-100 blur-sm transition-opacity duration-300"></span>
                <div className="relative w-full bg-[#050505] group-hover:bg-transparent transition-colors duration-300 rounded-[2rem] flex items-center justify-center gap-3 py-6">
                  <span className="text-[#00f260] group-hover:text-black text-2xl transition-colors">🤝</span>
                  <span className="text-[#00f260] group-hover:text-black font-black uppercase tracking-widest text-lg transition-colors">
                    TAKAS TEKLİF ET
                  </span>
                </div>
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
