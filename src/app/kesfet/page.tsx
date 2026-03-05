"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function Kesfet() {
  const [activeKategori, setActiveKategori] = useState("Tümü");
  const [arama, setArama] = useState("");

  const kategoriler = [
    "Tümü", "Teknoloji", "Araç & Mobilite", "Gayrimenkul", "Moda & Lüks", "Koleksiyon", "Hizmet"
  ];

  // Demo Siber Varlıklar (İleride Veritabanından Akacak)
  const varliklar = [
    { id: 1, baslik: "MacBook Pro M3 Max", deger: "120.000 ₺", takasIstegi: "Araç veya Arsa", kategori: "Teknoloji", konum: "İstanbul", resim: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=600" },
    { id: 2, baslik: "Rolex Submariner", deger: "450.000 ₺", takasIstegi: "Klasik Otomobil", kategori: "Moda & Lüks", konum: "İzmir", resim: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=600" },
    { id: 3, baslik: "Sony A7 IV + Lens Seti", deger: "95.000 ₺", takasIstegi: "Oyun Bilgisayarı", kategori: "Teknoloji", konum: "Ankara", resim: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600" },
    { id: 4, baslik: "Ege'de 500m2 Arsa", deger: "Teklif Bekliyor", takasIstegi: "2 Adet SUV Araç", kategori: "Gayrimenkul", konum: "Muğla", resim: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=600" },
    { id: 5, baslik: "Tesla Model Y", deger: "2.100.000 ₺", takasIstegi: "Daire + Nakit", kategori: "Araç & Mobilite", konum: "Bursa", resim: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=600" },
    { id: 6, baslik: "Antika Pikap & Plak Seti", deger: "35.000 ₺", takasIstegi: "Elektrikli Scooter", kategori: "Koleksiyon", konum: "Antalya", resim: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=600" },
  ];

  const filtrelenmisVarliklar = varliklar.filter(v => 
    (activeKategori === "Tümü" || v.kategori === activeKategori) &&
    v.baslik.toLowerCase().includes(arama.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans pb-32 pt-6">
      
      {/* 🌌 ARKA PLAN DERİNLİĞİ */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[-10%] w-[40vw] h-[40vw] bg-[#00f260] opacity-[0.02] blur-[150px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-[1500px] mx-auto px-4 md:px-8">
        
        {/* ÜST BAŞLIK VE ARAMA REAKTÖRÜ */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white">
              Açık <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f260] to-emerald-400">Piyasa.</span>
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00f260] animate-pulse"></span> {filtrelenmisVarliklar.length} Varlık İşlem Görüyor
            </p>
          </div>

          <div className="w-full md:w-[400px] relative group">
            <div className="absolute -inset-0.5 bg-[#00f260] rounded-2xl blur opacity-0 group-focus-within:opacity-20 transition duration-500"></div>
            <div className="relative flex items-center bg-[#0a0a0a] border border-white/[0.08] rounded-2xl p-2 shadow-xl">
              <span className="pl-4 text-slate-400">🔍</span>
              <input 
                type="text"
                placeholder="Piyasada ne arıyorsun?"
                className="w-full bg-transparent border-none px-4 py-3 text-white text-sm font-bold tracking-wide outline-none placeholder:text-slate-600"
                value={arama}
                onChange={(e) => setArama(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 🗂️ YATAY KATEGORİ FİLTRELERİ */}
        <div className="flex gap-3 overflow-x-auto pb-6 mb-6 no-scrollbar snap-x">
          {kategoriler.map((kat) => (
            <button 
              key={kat}
              onClick={() => setActiveKategori(kat)}
              className={`snap-start whitespace-nowrap px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 border ${
                activeKategori === kat 
                ? "bg-[#00f260] text-black border-[#00f260] shadow-[0_0_20px_rgba(0,242,96,0.3)]" 
                : "bg-[#0a0a0a] text-slate-400 border-white/[0.05] hover:border-white/[0.15] hover:text-white"
              }`}
            >
              {kat}
            </button>
          ))}
        </div>

        {/* 💠 VARLIK LİSTESİ (IZGARA) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {filtrelenmisVarliklar.map((varlik) => (
            <Link key={varlik.id} href={`/varlik/${varlik.id}`} className="group flex flex-col bg-[#0a0a0a] border border-white/[0.04] rounded-[2rem] p-3 hover:border-[#00f260]/30 hover:-translate-y-2 transition-all duration-500 shadow-[0_15px_40px_rgba(0,0,0,0.3)]">
              
              <div className="relative h-60 w-full rounded-[1.5rem] overflow-hidden bg-[#111]">
                <img src={varlik.resim} alt={varlik.baslik} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-white/10 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5">
                  <span className="text-[#00f260]">📍</span> {varlik.konum}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white leading-snug mb-3 group-hover:text-[#00f260] transition-colors">{varlik.baslik}</h3>
                  <div className="flex flex-col gap-1 mb-5">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Tahmini Değer</p>
                    <p className="text-[#00f260] font-black text-sm md:text-base">{varlik.deger}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-white/[0.04] flex items-center justify-between">
                  <div className="flex-1 pr-2">
                    <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-1">Takas Beklentisi</p>
                    <p className="text-slate-200 text-xs font-semibold truncate">{varlik.takasIstegi}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center group-hover:bg-[#00f260] group-hover:border-[#00f260] transition-all duration-300">
                    <span className="text-slate-400 group-hover:text-black transform -rotate-45 group-hover:rotate-0 transition-all duration-500">➔</span>
                  </div>
                </div>
              </div>

            </Link>
          ))}
        </div>

        {/* BOŞ SONUÇ DURUMU */}
        {filtrelenmisVarliklar.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center text-center opacity-60">
            <span className="text-6xl mb-6 grayscale">🔍</span>
            <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Varlık Bulunamadı</h3>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Bu kritere uygun işlem gören varlık yok.</p>
            <button onClick={() => {setArama(""); setActiveKategori("Tümü");}} className="mt-8 px-6 py-3 border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-colors">
              Piyasayı Sıfırla
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
