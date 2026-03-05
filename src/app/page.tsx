"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const kategoriler = [
    { isim: "Teknoloji Endeksi", ikon: "💻", trend: "+%14" },
    { isim: "Araç & Mobilite", ikon: "🚗", trend: "+%8" },
    { isim: "Gayrimenkul", ikon: "🏢", trend: "+%22" },
    { isim: "Koleksiyon & Antika", ikon: "🏺", trend: "+%35" },
    { isim: "Hizmet & Yetenek", ikon: "⚡", trend: "+%41" },
    { isim: "Moda & Lüks", ikon: "💎", trend: "+%5" }
  ];

  const sonVarliklar = [
    { id: 1, baslik: "MacBook Pro M3 Max", deger: "120.000 ₺", takasIsteği: "Araba veya Arsa", resim: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=600" },
    { id: 2, baslik: "Rolex Submariner", deger: "450.000 ₺", takasIsteği: "Klasik Otomobil", resim: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=600" },
    { id: 3, baslik: "Sony A7 IV + Lens Seti", deger: "95.000 ₺", takasIsteği: "Oyun Bilgisayarı", resim: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600" },
    { id: 4, baslik: "Ege'de 500m2 Arsa", deger: "Teklif Bekliyor", takasIsteği: "2 Adet SUV Araç", resim: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=600" }
  ];

  return (
    <div className="min-h-screen bg-[#02040a] text-white selection:bg-[#00f260] selection:text-black overflow-hidden font-sans">
      
      {/* 🌌 SİBER ARKA PLAN EFEKTLERİ (Çizgisiz, Yumuşak Geçişli) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#00f260] opacity-[0.04] blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600 opacity-[0.03] blur-[150px] rounded-full"></div>
      </div>

      {/* 📢 CANLI BANT (Sınır Çizgisi Yok, Sadece Arka Plan Rengi) */}
      <div className="relative z-20 bg-[#00f260] text-black text-[10px] md:text-xs font-black uppercase tracking-[0.2em] py-3 overflow-hidden flex items-center shadow-[0_10px_30px_rgba(0,242,96,0.15)]">
        <div className="animate-[marquee_20s_linear_infinite] whitespace-nowrap flex gap-12">
          <span>🔥 SON İŞLEM: iPhone 14 Pro 🔄 PS5 + 10.000₺ Takaslandı (2 dk önce)</span>
          <span>⚡ TREND: Teknoloji kategorisinde %14 hacim artışı!</span>
          <span>💎 DEV TAKAS: İzmir'de Arsa 🔄 2 Adet Elektrikli Araç (15 dk önce)</span>
          <span>🔥 SON İŞLEM: MacBook Air 🔄 iPad Pro M2 (Şimdi)</span>
        </div>
      </div>

      {/* 🚀 HERO SECTION (Tamamen Cam Efekti, Çizgi Yok) */}
      <div className={`relative z-10 pt-24 pb-20 px-4 md:px-8 text-center transition-all duration-1000 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <h1 className="text-7xl md:text-[10rem] font-black italic tracking-tighter uppercase leading-[0.8] mb-6 drop-shadow-2xl">
          AT <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#00f260] to-teal-400 drop-shadow-[0_0_30px_rgba(0,242,96,0.4)]">
            TAKASA.
          </span>
        </h1>
        <p className="max-w-2xl mx-auto text-slate-400 font-medium uppercase tracking-[0.2em] text-xs md:text-sm mb-14">
          Satamıyor musun? Bekleme. Elindeki gücü kullan. Sınırları kaldır ve küresel takas borsasına hükmet.
        </p>
        
        {/* DEV ARAMA MOTORU (Çizgisiz, Havada Asılı Zırh) */}
        <div className="relative max-w-3xl mx-auto z-30 group">
          <div className="absolute -inset-2 bg-[#00f260] rounded-[2rem] blur-xl opacity-10 group-focus-within:opacity-30 transition duration-700"></div>
          <div className="relative flex items-center bg-white/[0.03] backdrop-blur-2xl rounded-[2rem] overflow-hidden p-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <span className="pl-6 text-[#00f260] text-2xl animate-pulse">⚡</span>
            <input 
              type="text"
              placeholder="PİYASADA VARLIK ARA (Örn: MacBook, Arsa, Saat)..."
              className="w-full bg-transparent border-none p-5 text-white text-sm md:text-base font-bold tracking-widest outline-none placeholder:text-slate-500"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="hidden md:block bg-gradient-to-r from-[#00f260] to-emerald-400 text-black font-black uppercase tracking-widest px-10 py-5 rounded-xl hover:scale-105 transition-transform duration-300 shadow-[0_0_20px_rgba(0,242,96,0.3)]">
              Tara
            </button>
          </div>
        </div>
      </div>

      {/* 📊 HACİM ENDEKSLERİ (Çizgisiz "Bento Box" Tasarımı) */}
      <div className="relative z-10 max-w-[1500px] mx-auto px-4 md:px-8 mb-32">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-6">
          Piyasa Endeksleri <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {kategoriler.map((kat, idx) => (
            <Link key={idx} href="#" className="group relative bg-[#0a0f1c] rounded-3xl p-6 overflow-hidden hover:bg-[#0d1425] transition-colors duration-300 shadow-xl shadow-black/40">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent"></div>
              <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                <div className="flex justify-between items-start">
                  <span className="text-4xl drop-shadow-lg group-hover:scale-110 transition-transform duration-500">{kat.ikon}</span>
                  <span className="text-[#00f260] font-black text-[10px] bg-[#00f260]/10 px-3 py-1.5 rounded-full">{kat.trend}</span>
                </div>
                <h3 className="font-bold text-[11px] uppercase tracking-widest text-slate-300 group-hover:text-white">{kat.isim}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 💠 CANLI TAHTA / KARTLAR (Sıfır Çizgi, Sadece Derinlik ve Gölge) */}
      <div className="relative z-10 max-w-[1500px] mx-auto px-4 md:px-8 pb-32">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase drop-shadow-lg">
              Canlı <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f260] to-emerald-400">Tahta.</span>
            </h2>
            <p className="text-[#00f260] text-xs font-bold uppercase tracking-widest mt-3 flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00f260] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00f260]"></span>
              </span>
              Gerçek zamanlı piyasa akışı
            </p>
          </div>
          <Link href="/kesfet" className="hidden md:flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-[#00f260] transition-colors">
            Tüm Piyasayı Gör <span className="text-lg">➔</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {sonVarliklar.map((varlik) => (
            <Link key={varlik.id} href={`/varlik/${varlik.id}`} className="group relative bg-[#0a0f1c] rounded-[2.5rem] overflow-hidden hover:-translate-y-3 transition-all duration-500 shadow-[0_20px_40px_rgba(0,0,0,0.6)] hover:shadow-[0_30px_60px_rgba(0,242,96,0.1)] flex flex-col">
              
              {/* Resim Alanı */}
              <div className="relative h-72 overflow-hidden bg-[#02040a]">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1c] via-transparent to-transparent z-10 opacity-100"></div>
                <img src={varlik.resim} alt={varlik.baslik} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-60 group-hover:opacity-90 mix-blend-luminosity group-hover:mix-blend-normal" />
                
                {/* Değer Etiketi (Çizgisiz, Cam) */}
                <div className="absolute bottom-5 left-5 z-20">
                  <div className="bg-white/10 backdrop-blur-xl text-white text-[11px] font-black px-4 py-2.5 rounded-xl uppercase tracking-widest shadow-2xl">
                    Değer: <span className="text-[#00f260] ml-1">{varlik.deger}</span>
                  </div>
                </div>
              </div>

              {/* İçerik Alanı */}
              <div className="p-7 flex-1 flex flex-col justify-between relative z-20 bg-[#0a0f1c]">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-wide leading-tight mb-5 group-hover:text-[#00f260] transition-colors">{varlik.baslik}</h3>
                  <div className="bg-white/[0.03] rounded-2xl p-4">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mb-1.5">
                      <span className="text-[#00f260] text-sm">🔄</span> İstenen Takas
                    </p>
                    <p className="text-white text-xs font-black uppercase tracking-wide">{varlik.takasIsteği}</p>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-between items-center">
                  <span className="text-[10px] text-[#00f260] font-black uppercase tracking-widest">Açık İşlem</span>
                  <div className="w-12 h-12 rounded-full bg-white/[0.05] flex items-center justify-center group-hover:bg-[#00f260] transition-colors duration-500">
                    <span className="text-white group-hover:text-black transform -rotate-45 group-hover:rotate-0 transition-transform duration-500 text-lg">➔</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
