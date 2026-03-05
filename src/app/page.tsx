"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  // 📡 CANLI VERİ STATE'LERİ
  const [ilanlar, setIlanlar] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 📡 SİBER VERİ ÇEKME OPERASYONU
  useEffect(() => {
    setIsLoaded(true);
    const veriGetir = async () => {
      try {
        const res = await fetch("/api/varliklar");
        const data = await res.json();
        // Eğer veri geldiyse ilanları set et, gelmediyse boş dizi kalsın
        setIlanlar(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Veri akışı kesildi:", err);
      } finally {
        setLoading(false);
      }
    };
    veriGetir();
  }, []);

  const kategoriler = [
    { isim: "Teknoloji Endeksi", ikon: "💻", trend: "+%14", renk: "from-emerald-400 to-cyan-400" },
    { isim: "Araç & Mobilite", ikon: "🚗", trend: "+%8", renk: "from-teal-400 to-emerald-500" },
    { isim: "Gayrimenkul", ikon: "🏢", trend: "+%22", renk: "from-blue-400 to-indigo-500" },
    { isim: "Koleksiyon & Sanat", ikon: "🏺", trend: "+%35", renk: "from-orange-400 to-amber-500" },
    { isim: "Hizmet & Yetenek", ikon: "⚡", trend: "+%41", renk: "from-rose-400 to-red-500" },
    { isim: "Moda & Lüks", ikon: "💎", trend: "+%5", renk: "from-fuchsia-400 to-purple-500" }
  ];

  const handleArama = () => {
    router.push(`/kesfet?ara=${searchTerm}`);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 selection:bg-[#00f260] selection:text-black font-sans pb-20">
      
      {/* 🌌 YUMUŞATILMIŞ ARKA PLAN IŞIKLARI */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#00f260] opacity-[0.02] blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-blue-600 opacity-[0.02] blur-[150px] rounded-full"></div>
      </div>

      {/* 📢 ELEGANT CANLI BANT */}
      <div className="relative z-20 bg-[#00f260] border-b border-[#00f260] shadow-[0_0_20px_rgba(0,242,96,0.2)] py-2.5 overflow-hidden flex items-center">
        <div className="animate-[marquee_25s_linear_infinite] whitespace-nowrap flex gap-12 text-[11px] font-black tracking-widest text-black uppercase">
          <span>🔥 İŞİNE YARAMIYOR MU? <strong className="text-white bg-black px-2 py-0.5 rounded">AT TAKASA, DEĞER YARAT!</strong></span>
          <span>⚡ <strong className="text-black">TAKAS ET, KÂR ET!</strong> Son 1 saatte 142 başarılı işlem.</span>
          <span>🔄 ELİNDE TUTMA, <strong className="text-white bg-black px-2 py-0.5 rounded">HEMEN DEĞİŞTİR!</strong></span>
          <span>💎 <strong className="text-black">SATAMIYOR MUSUN?</strong> Bekleme, doğrudan takasla.</span>
        </div>
      </div>

      {/* 🚀 HERO SECTION */}
      <div className={`relative z-10 pt-28 pb-20 px-6 md:px-12 flex flex-col items-center text-center transition-all duration-1000 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        
        <h1 className="text-7xl md:text-[10rem] font-black tracking-tighter uppercase leading-[0.85] mb-8 drop-shadow-2xl">
          <span className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">A</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f260] to-emerald-400 drop-shadow-[0_0_30px_rgba(0,242,96,0.5)]">TAKAS</span>
          <span className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">A.</span>
        </h1>
        
        <div className="flex flex-wrap justify-center gap-3 md:gap-5 mb-10 max-w-4xl mx-auto">
          <div className="px-5 py-2.5 rounded-full bg-white/[0.02] border border-white/[0.05] shadow-lg hover:border-[#00f260]/40 transition-colors">
            <span className="text-slate-400 text-[10px] md:text-xs font-bold tracking-widest uppercase">Satamıyor musun? <strong className="text-white">At Takasa</strong></span>
          </div>
          <div className="px-5 py-2.5 rounded-full bg-white/[0.02] border border-white/[0.05] shadow-lg hover:border-[#00f260]/40 transition-colors">
            <span className="text-slate-400 text-[10px] md:text-xs font-bold tracking-widest uppercase">Elinde Tutma, <strong className="text-[#00f260]">Hemen Değiştir</strong></span>
          </div>
          <div className="px-5 py-2.5 rounded-full bg-[#00f260]/10 border border-[#00f260]/20 shadow-[0_0_15px_rgba(0,242,96,0.1)]">
            <span className="text-[#00f260] text-[10px] md:text-xs font-black tracking-widest uppercase animate-pulse">Takas Et, Kâr Et 🚀</span>
          </div>
        </div>

        {/* ⚡ ARAMA MOTORU */}
        <div className="relative w-full max-w-3xl z-30 group">
          <div className="absolute -inset-1 bg-[#00f260] rounded-[2.5rem] blur-2xl opacity-0 group-focus-within:opacity-25 transition duration-1000"></div>
          <div className="relative flex items-center bg-[#0a0a0a] border border-white/[0.08] rounded-[2.5rem] p-2.5 shadow-[0_30px_50px_rgba(0,0,0,0.6)] transition-all hover:border-white/[0.15]">
            <span className="pl-6 text-[#00f260] text-xl">✨</span>
            <input 
              type="text"
              placeholder="Piyasada varlık ara (Örn: MacBook, Arsa)..."
              className="w-full bg-transparent border-none px-6 py-5 text-white text-base font-medium tracking-wide outline-none placeholder:text-slate-500"
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleArama()}
            />
            <button onClick={handleArama} className="hidden md:block bg-gradient-to-r from-white to-slate-200 text-black font-black tracking-widest px-10 py-5 rounded-[2rem] hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300">
              DEĞİŞ TOKUŞ YAP
            </button>
          </div>
        </div>
      </div>

      {/* 📊 ENDEKS KARTLARI */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 mb-32">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-[0.2em] mb-10 flex items-center gap-6">
          Siber Piyasa Hacmi <div className="h-[1px] flex-1 bg-gradient-to-r from-white/[0.05] to-transparent"></div>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {kategoriler.map((kat, idx) => (
            <Link key={idx} href="/kesfet" className="group relative bg-[#0a0a0a] border border-white/[0.04] rounded-3xl p-7 flex flex-col justify-between h-40 hover:border-[#00f260]/30 hover:-translate-y-1 transition-all duration-500 shadow-xl shadow-black/20">
              <div className="flex justify-between items-start">
                <span className="text-3xl opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">{kat.ikon}</span>
                <span className="text-[#00f260] font-bold text-[10px] bg-[#00f260]/10 px-3 py-1.5 rounded-full">{kat.trend}</span>
              </div>
              <h3 className="font-semibold text-xs tracking-wide text-slate-300 group-hover:text-white transition-colors">{kat.isim}</h3>
            </Link>
          ))}
        </div>
      </div>

      {/* 💠 CANLI TAHTA (ARTIK GERÇEK VERİLERLE!) */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-3">
              Canlı <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f260] to-emerald-400">Akış.</span>
            </h2>
            <p className="text-slate-400 text-sm font-medium flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00f260] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00f260]"></span>
              </span>
              Sistemdeki sıcak varlık hareketleri
            </p>
          </div>
        </div>

        {/* 🚀 VERİ AKIŞI */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-[400px] bg-white/[0.02] border border-white/[0.04] rounded-[2.5rem] animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {ilanlar.length > 0 ? ilanlar.map((varlik) => (
              <Link key={varlik._id} href={`/varlik/${varlik._id}`} className="group flex flex-col bg-[#0a0a0a] border border-white/[0.04] rounded-[2.5rem] p-3 hover:border-[#00f260]/20 hover:-translate-y-2 transition-all duration-500 shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
                
                <div className="relative h-64 w-full rounded-[2rem] overflow-hidden bg-[#111]">
                  {varlik.resimler?.[0] ? (
                    <img src={varlik.resimler[0]} alt={varlik.baslik} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl opacity-10">🖼️</div>
                  )}
                  <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md border border-white/10 text-[#00f260] text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                    {varlik.kategori || "At Takasa"}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white leading-snug mb-4 group-hover:text-[#00f260] transition-colors truncate">{varlik.baslik}</h3>
                    <div className="flex flex-col gap-1.5 mb-6">
                      <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">Tahmini Değer</p>
                      <p className="text-[#00f260] font-black text-base">{Number(varlik.fiyat).toLocaleString()} ₺</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-white/[0.04] flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider mb-1">Takas Beklentisi</p>
                      <p className="text-slate-200 text-xs font-semibold truncate max-w-[150px]">{varlik.takasIstegi || "Takasa Açık"}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center group-hover:bg-[#00f260] group-hover:text-black transition-all duration-300">
                      <span className="transform -rotate-45 group-hover:rotate-0 transition-transform duration-500">➔</span>
                    </div>
                  </div>
                </div>

              </Link>
            )) : (
              <div className="col-span-full py-20 text-center opacity-30">
                <span className="text-6xl block mb-4">📡</span>
                <p className="font-black uppercase tracking-widest">Sinyal Bulunamadı. İlk ilanı sen ver!</p>
              </div>
            )}
          </div>
        )}

        {/* 🚀 DEV TÜM PİYASAYI GÖR BUTONU */}
        <div className="mt-16 flex justify-center">
          <Link href="/kesfet" className="group relative inline-flex items-center justify-center px-10 py-6 text-sm md:text-base font-black tracking-widest text-black uppercase bg-gradient-to-r from-[#00f260] to-emerald-400 rounded-full overflow-hidden hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(0,242,96,0.3)] hover:shadow-[0_0_60px_rgba(0,242,96,0.5)]">
            <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-full group-hover:h-56 opacity-20"></span>
            <span className="relative flex items-center gap-3">
              TÜM PİYASAYI KEŞFET <span className="text-2xl group-hover:translate-x-2 transition-transform">➔</span>
            </span>
          </Link>
        </div>

      </div>

    </div>
  );
}
