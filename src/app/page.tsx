"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [ilanlar, setIlanlar] = useState<any[]>([]); 
  const [borsaVerisi, setBorsaVerisi] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aktifFiltre, setAktifFiltre] = useState("Hepsi");
  const router = useRouter();

  // 📡 SİBER VERİ VE BORSA ANALİZ OPERASYONU
  useEffect(() => {
    setIsLoaded(true);
    const piyasaVerisiCek = async () => {
      try {
        // 1. Tüm Varlıklar
        const res = await fetch("/api/varliklar");
        const data = await res.json();
        setIlanlar(Array.isArray(data) ? data : []);

        // 2. Borsa Analiz Merkezi (Yeni API)
        const borsaRes = await fetch("/api/borsa/analiz");
        if (borsaRes.ok) {
          const bData = await borsaRes.json();
          setBorsaVerisi(bData);
        }
      } catch (err) {
        console.error("Siber sinyal koptu:", err);
      } finally {
        setLoading(false);
      }
    };
    piyasaVerisiCek();
  }, []);

  const getResim = (ilan: any) => {
    if (!ilan) return "https://placehold.co/600x400/030712/00f260?text=GORSEL+YOK";
    return ilan.resimler?.[0] || ilan.images?.[0] || ilan.media?.images?.[0] || "https://placehold.co/600x400/030712/00f260?text=GORSEL+YOK";
  };

  const handleKategoriGit = (slug: string) => router.push(`/kategori/${slug}`);
  const handleArama = () => router.push(`/kesfet?ara=${searchTerm}`);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#00f260] selection:text-black italic">
      
      {/* 🌌 SİBER KATMANLAR (Glow Effects) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-[#00f260] opacity-[0.03] blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-blue-600 opacity-[0.03] blur-[150px] rounded-full"></div>
      </div>

      {/* 📟 1. BÖLÜM: SİBER BORSA BANDI (TICKER) */}
      <div className="relative z-50 bg-black border-y border-[#00f260]/20 py-3 overflow-hidden flex items-center shadow-[0_0_30px_rgba(0,242,96,0.1)]">
        <div className="flex whitespace-nowrap gap-12 text-[10px] font-black tracking-[0.2em] uppercase">
          <div className="animate-[marquee_40s_linear_infinite] flex gap-12 items-center">
            {borsaVerisi?.enCokDusenler?.map((v: any) => (
              <span key={v._id} className="flex items-center gap-2">
                <span className="text-slate-500">{v.baslik}</span>
                <span className="text-red-500 font-bold">▼ %{v.degisimYuzdesi}</span>
                <span className="text-[#00f260]">{v.fiyat.toLocaleString()} ₺</span>
              </span>
            ))}
            {borsaVerisi?.enCokArtanler?.map((v: any) => (
              <span key={v._id} className="flex items-center gap-2">
                <span className="text-slate-500">{v.baslik}</span>
                <span className="text-[#00f260] font-bold">▲ %{v.degisimYuzdesi}</span>
                <span className="text-[#00f260]">{v.fiyat.toLocaleString()} ₺</span>
              </span>
            ))}
            {/* Tekrar Döngüsü İçin Kopya Veriler */}
            {borsaVerisi?.enCokDusenler?.map((v: any) => (
              <span key={v._id + "_copy"} className="flex items-center gap-2">
                <span className="text-slate-500">{v.baslik}</span>
                <span className="text-red-500 font-bold">▼ %{v.degisimYuzdesi}</span>
                <span className="text-[#00f260]">{v.fiyat.toLocaleString()} ₺</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 🚀 2. BÖLÜM: HERO & SEARCH */}
      <div className={`relative z-10 pt-20 pb-16 px-6 text-center transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <h1 className="text-7xl md:text-[12rem] font-black tracking-tighter uppercase leading-none mb-4">
          <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">A</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f260] to-emerald-500 drop-shadow-[0_0_40px_rgba(0,242,96,0.6)]">TAKASA</span>
          <span className="text-white">.</span>
        </h1>
        <p className="text-slate-500 text-xs md:text-sm font-bold tracking-[0.4em] uppercase mb-12">
          Sıradan İlanlar Değil, <span className="text-white">Varlık Borsası.</span>
        </p>

        <div className="relative w-full max-w-4xl mx-auto group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#00f260] to-blue-600 rounded-[3rem] blur opacity-10 group-focus-within:opacity-40 transition duration-1000"></div>
          <div className="relative flex items-center bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-[3rem] p-3 shadow-2xl transition-all hover:border-white/20">
            <input 
              type="text"
              placeholder="Piyasada varlık ara (iPhone, Tarla, BMW)..."
              className="w-full bg-transparent border-none px-8 py-6 text-white text-lg font-medium outline-none placeholder:text-slate-600"
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleArama()}
            />
            <button onClick={handleArama} className="hidden md:block bg-white text-black font-black tracking-widest px-12 py-6 rounded-[2.5rem] hover:bg-[#00f260] transition-all duration-500">
              VARLIĞI BUL
            </button>
          </div>
        </div>
      </div>

      {/* 🏢 3. BÖLÜM: SEKTÖR ENDEKSLERİ */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 mb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {borsaVerisi?.sektorEndeksleri?.map((s: any) => (
            <div key={s._id} onClick={() => handleKategoriGit(s._id.toLowerCase())} className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl hover:border-[#00f260]/40 transition-all group cursor-pointer shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{s._id}</span>
                <span className="text-[#00f260] text-[10px] font-bold">▲ %{((s.toplamHacim / 1000000) * 1.2).toFixed(1)}</span>
              </div>
              <p className="text-2xl font-black text-white group-hover:text-[#00f260] transition-colors">
                {Math.round(s.ortalamaFiyat).toLocaleString()} ₺
              </p>
              <p className="text-slate-600 text-[8px] font-bold mt-1 uppercase tracking-tighter">{s.toplamVarlik} Aktif Emir</p>
            </div>
          ))}
        </div>
      </div>

      {/* 💠 4. BÖLÜM: CANLI AKIŞ & FİLTRELEME */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-none">Canlı <span className="text-[#00f260]">Akış.</span></h2>
          
          <div className="flex flex-wrap gap-2 bg-[#0a0a0a] p-2 rounded-2xl border border-white/5">
            {["Hepsi", "Düşüştekiler", "En Yeniler", "Popüler"].map((f) => (
              <button 
                key={f} 
                onClick={() => setAktifFiltre(f)}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${aktifFiltre === f ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-white'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-[450px] bg-white/[0.02] border border-white/5 rounded-[3rem] animate-pulse"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {ilanlar.map((ilan) => (
              <div key={ilan._id} className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-[#00f260]/40 transition-all shadow-2xl group flex flex-col p-3">
                
                <div className="relative h-60 w-full rounded-[2rem] overflow-hidden bg-[#030712]">
                  <img src={getResim(ilan)} alt={ilan.baslik} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                  
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[8px] font-black uppercase border border-white/10 tracking-widest">
                      {ilan.kategori || "Varlık"}
                    </span>
                  </div>

                  <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
                    {ilan.degisimYuzdesi < 0 ? (
                      <span className="bg-red-500 text-white px-2 py-1 rounded-lg text-[10px] font-black shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                        📉 %{Math.abs(ilan.degisimYuzdesi)} DÜŞÜŞ
                      </span>
                    ) : (
                      <span className="bg-[#00f260] text-black px-2 py-1 rounded-lg text-[10px] font-black shadow-[0_0_15px_rgba(0,242,96,0.3)]">
                        📈 %{ilan.degisimYuzdesi || '0.0'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-white font-black uppercase text-sm mb-2 truncate group-hover:text-[#00f260] transition-colors tracking-tighter">{ilan.title || ilan.baslik}</h3>
                  <div className="flex justify-between items-end mb-5">
                    <p className="text-[#00f260] font-black text-2xl italic tracking-tighter">{Number(ilan.price || ilan.fiyat).toLocaleString()} ₺</p>
                    <p className="text-slate-600 text-[9px] font-bold uppercase tracking-widest">📍 {ilan.sehir || "Türkiye"}</p>
                  </div>

                  <div className="mt-auto space-y-2">
                    <div className="flex gap-2">
                      <Link href={`/varlik/${ilan._id}?islem=takas`} className="flex-1 bg-cyan-500/10 text-cyan-400 py-3 rounded-2xl text-[9px] font-black uppercase text-center hover:bg-cyan-500 hover:text-black transition-all border border-cyan-500/20">
                        🔄 Takas
                      </Link>
                      <Link href={`/varlik/${ilan._id}?islem=satinal`} className="flex-1 bg-[#00f260]/10 text-[#00f260] py-3 rounded-xl text-[9px] font-black uppercase text-center hover:bg-[#00f260] hover:text-black transition-all border border-[#00f260]/20">
                        🛒 Satın Al
                      </Link>
                    </div>
                    <Link href={`/varlik/${ilan._id}?islem=incele`} className="w-full bg-white/5 text-slate-400 py-3 rounded-2xl text-[9px] font-black uppercase text-center hover:bg-white/10 hover:text-white transition-all border border-white/5">
                      📊 İNCELE & ANALİZ ET
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🚀 5. BÖLÜM: ALT SEKTÖR HAVUZLARI */}
      <div className="mt-32 border-t border-white/5 pt-20 max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-gradient-to-br from-[#0a0a0a] to-blue-900/10 p-12 rounded-[3rem] border border-white/5 relative overflow-hidden group">
            <h4 className="text-4xl font-black uppercase italic mb-4">Elektronik <span className="text-blue-400">Havuzu.</span></h4>
            <p className="text-slate-400 text-sm mb-8">Bu sektördeki toplam takas hacmi son 24 saatte %14 arttı. Elindeki cihazı nakde veya başka bir varlığa çevir.</p>
            <Link href="/kategori/elektronik" className="text-xs font-black uppercase tracking-widest text-white border-b-2 border-blue-400 pb-1 group-hover:border-white transition-all">Tüm Cihazları İncele →</Link>
          </div>
          <div className="bg-gradient-to-br from-[#0a0a0a] to-[#00f260]/10 p-12 rounded-[3rem] border border-white/5 relative overflow-hidden group">
            <h4 className="text-4xl font-black uppercase italic mb-4">Otomobil <span className="text-[#00f260]">Endeksi.</span></h4>
            <p className="text-slate-400 text-sm mb-8">Piyasa değeri en çok artan araçlar ve takas teklifine en açık olan modeller burada listeleniyor.</p>
            <Link href="/kategori/otomobil" className="text-xs font-black uppercase tracking-widest text-white border-b-2 border-[#00f260] pb-1 group-hover:border-white transition-all">Tüm Araçları İncele →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
