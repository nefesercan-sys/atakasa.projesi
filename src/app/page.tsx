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
    { isim: "Teknoloji Endeksi", ikon: "💻", trend: "+%14", renk: "from-blue-500 to-cyan-400" },
    { isim: "Araç & Mobilite", ikon: "🚗", trend: "+%8", renk: "from-emerald-500 to-teal-400" },
    { isim: "Gayrimenkul", ikon: "🏢", trend: "+%22", renk: "from-purple-500 to-fuchsia-400" },
    { isim: "Koleksiyon & Antika", ikon: "🏺", trend: "+%35", renk: "from-amber-500 to-orange-400" },
    { isim: "Hizmet & Yetenek", ikon: "⚡", trend: "+%41", renk: "from-rose-500 to-red-400" },
    { isim: "Moda & Lüks", ikon: "💎", trend: "+%5", renk: "from-indigo-500 to-blue-400" }
  ];

  // Demo Siber Varlıklar (İleride MongoDB'den akacak)
  const sonVarliklar = [
    { id: 1, baslik: "MacBook Pro M3 Max", deger: "120.000 ₺", takasIsteği: "Araba veya Arsa", resim: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=600" },
    { id: 2, baslik: "Rolex Submariner", deger: "450.000 ₺", takasIsteği: "Klasik Otomobil", resim: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=600" },
    { id: 3, baslik: "Sony A7 IV + Lens Seti", deger: "95.000 ₺", takasIsteği: "Oyun Bilgisayarı + Nakit", resim: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600" },
    { id: 4, baslik: "Ege'de 500m2 Arsa", deger: "Teklif Bekliyor", takasIsteği: "2 Adet SUV Araç", resim: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=600" }
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-white selection:bg-[#00f260] selection:text-black overflow-hidden">
      
      {/* 🌌 SİBER ARKA PLAN EFEKTLERİ */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#00f260] opacity-[0.03] blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-blue-600 opacity-[0.04] blur-[150px] rounded-full"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
      </div>

      {/* 📢 CANLI TAKAS BORSASI AKIŞI (TICKER) */}
      <div className="relative z-20 bg-[#00f260] text-black text-[10px] md:text-xs font-black uppercase tracking-[0.2em] py-2 overflow-hidden flex items-center shadow-[0_0_20px_rgba(0,242,96,0.3)] border-y border-[#00f260]/50 mt-[1px]">
        <div className="animate-[marquee_20s_linear_infinite] whitespace-nowrap flex gap-10">
          <span>🔥 SON İŞLEM: iPhone 14 Pro 🔄 PS5 + 10.000₺ Takaslandı (2 dk önce)</span>
          <span>⚡ TREND: Teknoloji kategorisinde %14 hacim artışı!</span>
          <span>💎 DEV TAKAS: İzmir'de Arsa 🔄 2 Adet Elektrikli Araç (15 dk önce)</span>
          <span>🔥 SON İŞLEM: MacBook Air 🔄 iPad Pro M2 (Şimdi)</span>
        </div>
      </div>

      {/* 🚀 HERO SECTION (PSİKOLOJİK TETİKLEYİCİ) */}
      <div className={`relative z-10 pt-20 pb-16 px-4 md:px-8 text-center transition-all duration-1000 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <h1 className="text-6xl md:text-[9rem] font-black italic tracking-tighter uppercase leading-[0.8] mb-6">
          AT <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f260] to-emerald-300 drop-shadow-[0_0_20px_rgba(0,242,96,0.5)]">
            TAKASA.
          </span>
        </h1>
        <p className="max-w-2xl mx-auto text-slate-400 font-bold uppercase tracking-[0.2em] text-xs md:text-sm mb-12">
          Satamıyor musun? Bekleme. Elindeki gücü kullan. Sınırları kaldır ve küresel takas borsasına hükmet.
        </p>
        
        {/* DEV ARAMA MOTORU */}
        <div className="relative max-w-3xl mx-auto group z-30">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-[#00f260] to-[#00f260]/30 rounded-2xl blur opacity-30 group-focus-within:opacity-60 transition duration-500"></div>
          <div className="relative flex items-center bg-[#0b0f19]/90 backdrop-blur-xl border border-[#00f260]/20 rounded-2xl overflow-hidden p-2 shadow-2xl">
            <span className="pl-4 text-[#00f260] text-2xl animate-pulse">⚡</span>
            <input 
              type="text"
              placeholder="HANGİ VARLIĞI ARIYORSUN? (Örn: MacBook, Arsa, Saat)"
              className="w-full bg-transparent border-none p-5 text-white text-sm md:text-base font-black tracking-widest outline-none placeholder:text-slate-600"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="hidden md:block bg-[#00f260] hover:bg-white text-black font-black uppercase tracking-widest px-8 py-4 rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(0,242,96,0.4)] hover:shadow-[#00f260]">
              Piyasayı Tara
            </button>
          </div>
        </div>
      </div>

      {/* 📊 HACİM ENDEKSLERİ */}
      <div className="relative z-10 max-w-[1500px] mx-auto px-4 md:px-8 mb-24">
        <h2 className="text-sm md:text-base font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
          Hacim Endeksleri <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {kategoriler.map((kat, idx) => (
            <Link key={idx} href="#" className="group relative bg-[#0b0f19] border border-white/5 rounded-2xl p-5 overflow-hidden hover:border-[#00f260]/30 transition-all duration-300 shadow-lg">
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${kat.renk} opacity-50 group-hover:opacity-100 transition-opacity`}></div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-3xl grayscale group-hover:grayscale-0 transition-all drop-shadow-md">{kat.ikon}</span>
                <span className="text-[#00f260] font-black text-xs bg-[#00f260]/10 px-2 py-1 rounded-md border border-[#00f260]/20">{kat.trend}</span>
              </div>
              <h3 className="font-black text-[10px] md:text-xs uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">{kat.isim}</h3>
            </Link>
          ))}
        </div>
      </div>

      {/* 💠 CANLI PİYASA AKIŞI */}
      <div className="relative z-10 max-w-[1500px] mx-auto px-4 md:px-8 pb-32">
        <div className="flex justify-between items-end mb-10 border-b border-white/10 pb-6">
          <div>
            <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase">
              Canlı <span className="text-[#00f260]">Tahta.</span>
            </h2>
            <p className="text-[#00f260] text-[10px] md:text-xs font-black uppercase tracking-widest mt-2 animate-pulse flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00f260]"></span> Gerçek zamanlı piyasa akışı
            </p>
          </div>
          <Link href="/kesfet" className="hidden md:flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:text-[#00f260] transition-colors bg-white/5 px-4 py-2 rounded-lg hover:bg-white/10">
            Tüm Piyasayı Gör <span>➔</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sonVarliklar.map((varlik) => (
            <Link key={varlik.id} href={`/varlik/${varlik.id}`} className="group bg-[#0b0f19] border border-white/5 rounded-[2rem] overflow-hidden hover:-translate-y-2 transition-all duration-500 shadow-xl hover:shadow-[0_20px_40px_rgba(0,242,96,0.15)] flex flex-col hover:border-[#00f260]/30">
              <div className="relative h-64 overflow-hidden bg-[#030712]">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] to-transparent z-10 opacity-90"></div>
                <img src={varlik.resim} alt={varlik.baslik} className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700 opacity-60 group-hover:opacity-100 mix-blend-luminosity group-hover:mix-blend-normal" />
                <div className="absolute bottom-4 left-4 z-20 w-[90%]">
                  <div className="bg-[#030712]/80 backdrop-blur-md border border-[#00f260]/20 text-white text-[10px] font-black px-3 py-2 rounded-lg uppercase tracking-widest mb-2 inline-block shadow-[0_0_10px_rgba(0,0,0,0.8)]">
                    Değer Endeksi: <span className="text-[#00f260] ml-1">{varlik.deger}</span>
                  </div>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between relative">
                <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-[#00f260]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-wide leading-tight mb-3 group-hover:text-[#00f260] transition-colors">{varlik.baslik}</h3>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                      <span className="text-[#00f260] text-sm">🔄</span> İstenen Takas:
                    </p>
                    <p className="text-white text-xs font-black uppercase tracking-wide mt-1">{varlik.takasIsteği}</p>
                  </div>
                </div>
                <div className="mt-6 flex justify-between items-center pt-4 border-t border-white/5">
                  <span className="text-[10px] text-[#00f260] font-black uppercase tracking-widest animate-pulse">Açık İşlem</span>
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#00f260] transition-all duration-300 border border-white/10 group-hover:border-transparent">
                    <span className="text-white group-hover:text-black transform -rotate-45 group-hover:rotate-0 transition-transform duration-300">➔</span>
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
