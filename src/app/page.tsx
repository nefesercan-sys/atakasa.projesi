"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  // 📡 CANLI VERİ STATE'LERİ
  const [ilanlar, setIlanlar] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 📡 SİBER VERİ ÇEKME OPERASYONU
  useEffect(() => {
    setIsLoaded(true);
    const veriGetir = async () => {
      try {
        const res = await fetch("/api/varliklar");
        const data = await res.json();
        setIlanlar(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Veri akışı kesildi:", err);
      } finally {
        setLoading(false);
      }
    };
    veriGetir();
  }, []);

  // 📸 SİBER GÖRSEL YAKALAMA RADARI
  const getResim = (ilan: any) => {
    if (!ilan) return "https://placehold.co/600x400/030712/00f260?text=GORSEL+YOK";
    if (ilan.resimler && ilan.resimler.length > 0) return ilan.resimler[0];
    if (ilan.images && ilan.images.length > 0) return ilan.images[0];
    if (ilan.media?.images && ilan.media.images.length > 0) return ilan.media.images[0];
    if (typeof ilan.resim === 'string' && ilan.resim) return ilan.resim;
    if (typeof ilan.image === 'string' && ilan.image) return ilan.image;
    return "https://placehold.co/600x400/030712/00f260?text=GORSEL+YOK";
  };

  const kategoriler = [
    { isim: "Teknoloji Endeksi", ikon: "💻", trend: "+%14", slug: "urun-satis" },
    { isim: "Araç & Mobilite", ikon: "🚗", trend: "+%8", slug: "ikinci-el" },
    { isim: "Gayrimenkul", ikon: "🏢", trend: "+%22", slug: "kiralama" },
    { isim: "Koleksiyon & Sanat", ikon: "🏺", trend: "+%35", slug: "antika" },
    { isim: "Hizmet & Yetenek", ikon: "⚡", trend: "+%41", slug: "hizmet" },
    { isim: "Moda & Lüks", ikon: "💎", trend: "+%5", slug: "moda" }
  ];

  const handleKategoriGit = (slug: string) => {
    router.push(`/kategori/${slug}`);
  };

  const handleArama = () => {
    router.push(`/kesfet?ara=${searchTerm}`);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 selection:bg-[#00f260] selection:text-black font-sans pb-20 italic">
      
      {/* 🌌 ARKA PLAN IŞIKLARI */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#00f260] opacity-[0.02] blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-blue-600 opacity-[0.02] blur-[150px] rounded-full"></div>
      </div>

      {/* 📢 CANLI BANT */}
      <div className="relative z-20 bg-[#00f260] border-b border-[#00f260] py-2.5 overflow-hidden flex items-center">
        <div className="animate-[marquee_25s_linear_infinite] whitespace-nowrap flex gap-12 text-[11px] font-black tracking-widest text-black uppercase">
          <span>🔥 İŞİNE YARAMIYOR MU? <strong className="text-white bg-black px-2 py-0.5 rounded">AT TAKASA, DEĞER YARAT!</strong></span>
          <span>⚡ <strong className="text-black">TAKAS ET, KÂR ET!</strong> Son 1 saatte 142 başarılı işlem.</span>
        </div>
      </div>

      {/* 🚀 HERO SECTION */}
      <div className={`relative z-10 pt-28 pb-20 px-6 md:px-12 flex flex-col items-center text-center transition-all duration-1000 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        <h1 className="text-7xl md:text-[10rem] font-black tracking-tighter uppercase leading-[0.85] mb-8 drop-shadow-2xl">
          <span className="text-white">A</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f260] to-emerald-400">TAKAS</span>
          <span className="text-white">A.</span>
        </h1>
        <div className="relative w-full max-w-3xl z-30 group">
          <div className="relative flex items-center bg-[#0a0a0a] border border-white/[0.08] rounded-[2.5rem] p-2.5 shadow-2xl transition-all hover:border-white/[0.15]">
            <span className="pl-6 text-[#00f260] text-xl">✨</span>
            <input 
              type="text"
              placeholder="Piyasada varlık ara (MacBook, Arsa)..."
              className="w-full bg-transparent border-none px-6 py-5 text-white text-base font-medium outline-none"
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleArama()}
            />
            <button onClick={handleArama} className="hidden md:block bg-white text-black font-black tracking-widest px-10 py-5 rounded-[2rem] hover:scale-105 transition-all">
              DEĞİŞ TOKUŞ YAP
            </button>
          </div>
        </div>
      </div>

      {/* 📊 KATEGORİ ENDEKSLERİ */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 mb-32">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-[0.2em] mb-10 flex items-center gap-6">
          Siber Piyasa Hacmi <div className="h-[1px] flex-1 bg-gradient-to-r from-white/[0.05] to-transparent"></div>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {kategoriler.map((kat, idx) => (
            <div key={idx} onClick={() => handleKategoriGit(kat.slug)} className="group bg-[#0a0a0a] border border-white/[0.04] rounded-3xl p-7 flex flex-col justify-between h-40 hover:border-[#00f260]/30 hover:-translate-y-1 transition-all cursor-pointer">
              <div className="flex justify-between items-start">
                <span className="text-3xl group-hover:scale-110 transition-all">{kat.ikon}</span>
                <span className="text-[#00f260] font-bold text-[10px] bg-[#00f260]/10 px-3 py-1.5 rounded-full">{kat.trend}</span>
              </div>
              <h3 className="font-semibold text-xs text-slate-300">{kat.isim}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* 💠 CANLI AKIŞ - BORSA VİTRİNİ */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12">
        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-12">
          Canlı <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f260] to-emerald-400">Akış.</span>
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-[400px] bg-white/[0.02] border border-white/[0.04] rounded-[2.5rem] animate-pulse"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {ilanlar.map((ilan) => (
              <div key={ilan._id} className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-cyan-500/50 transition-all shadow-lg group flex flex-col p-3">
                
                {/* Üst Kısım: Görsel ve Borsa Oranları */}
                <div className="relative h-56 w-full rounded-[2rem] overflow-hidden bg-[#111]">
                  <img src={getResim(ilan)} alt={ilan.baslik} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  
                  <div className="absolute top-4 left-4">
                    <span className="bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[8px] font-black uppercase border border-white/10">
                      {ilan.kategori || "Varlık"}
                    </span>
                  </div>

                  <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
                    <span className="bg-[#00f260] text-black px-2 py-1 rounded-lg text-[10px] font-black shadow-lg">
                      📈 +%4.2
                    </span>
                    <span className="bg-amber-400 text-black px-2 py-1 rounded-lg text-[8px] font-black">
                      ⭐ 4.8
                    </span>
                  </div>
                </div>

                {/* Alt Kısım: Bilgiler ve Aksiyonlar */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-white font-black uppercase text-sm mb-2 truncate">{ilan.title || ilan.baslik}</h3>
                  <div className="flex justify-between items-end mb-4">
                    <p className="text-[#00f260] font-black text-xl italic">{Number(ilan.price || ilan.fiyat).toLocaleString()} ₺</p>
                    <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">📍 {ilan.sehir || "İzmir"}</p>
                  </div>

                  {/* 🚀 3'LÜ SİBER AKSİYON BUTONLARI */}
                  <div className="mt-auto flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Link href={`/varlik/${ilan._id}?islem=takas`} className="flex-1 bg-cyan-500/10 text-cyan-400 py-3 rounded-xl text-[9px] font-black uppercase text-center hover:bg-cyan-500 hover:text-black transition-all border border-cyan-500/20">
                        🔄 Takas Et
                      </Link>
                      <Link href={`/varlik/${ilan._id}?islem=satinal`} className="flex-1 bg-[#00f260]/10 text-[#00f260] py-3 rounded-xl text-[9px] font-black uppercase text-center hover:bg-[#00f260] hover:text-black transition-all border border-[#00f260]/20">
                        🛒 Satın Al
                      </Link>
                    </div>
                    <Link href={`/varlik/${ilan._id}?islem=incele`} className="w-full bg-white/5 text-slate-300 py-3 rounded-xl text-[9px] font-black uppercase text-center hover:bg-white/10 transition-all border border-white/5">
                      🔍 İncele & Detaylar
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
