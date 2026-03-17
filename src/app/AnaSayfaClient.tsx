"use client";
import React, { useState, useMemo, useCallback } from "react";
import Image from "next/image"; 
import { Search, SlidersHorizontal, Zap, Star } from "lucide-react";

export default function AnaSayfaClient({ baslangicVerisi }: { baslangicVerisi: any[] }) {
  // State'ler
  const [searchTerm, setSearchTerm] = useState("");
  const [aktifKategori, setAktifKategori] = useState("Hepsi");
  const [aktifSehir, setAktifSehir] = useState("Tüm Şehirler");
  const [minFiyat, setMinFiyat] = useState(""); 
  const [maxFiyat, setMaxFiyat] = useState("");
  const [sadeceTakaslik, setSadeceTakaslik] = useState(false);
  const [filtreMenusuAcik, setFiltreMenusuAcik] = useState(false);

  const sehirler = ["Tüm Şehirler", "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya"];

  const getImageUrl = useCallback((ilan: any) => {
    const img = ilan?.resimler?.[0] || ilan?.medyalar?.[0] || ilan?.images?.[0];
    return typeof img === 'string' ? img : "https://placehold.co/600x400/050505/00f260?text=ATAKASA";
  }, []);

  const filtrelenmisIlanlar = useMemo(() => {
    let liste = [...baslangicVerisi];
    if (searchTerm) liste = liste.filter(i => (i.baslik || "").toLowerCase().includes(searchTerm.toLowerCase()));
    if (aktifKategori !== "Hepsi") liste = liste.filter(i => (i.kategori || "").toLowerCase().includes(aktifKategori.toLowerCase()));
    if (aktifSehir !== "Tüm Şehirler") liste = liste.filter(i => (i.sehir || "").toUpperCase() === aktifSehir.toUpperCase());
    if (minFiyat) liste = liste.filter(i => Number(i.fiyat || 0) >= Number(minFiyat));
    if (maxFiyat) liste = liste.filter(i => Number(i.fiyat || 0) <= Number(maxFiyat));
    if (sadeceTakaslik) liste = liste.filter(i => i.takasIstegi);
    return liste;
  }, [baslangicVerisi, searchTerm, aktifKategori, aktifSehir, minFiyat, maxFiyat, sadeceTakaslik]);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#00f260] selection:text-black">
      {/* Header ve Arama Çubuğu (Buradaki kodların önceki kısımla aynı, sadeleştirdim) */}
      <header className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 p-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input 
              type="text" 
              placeholder="Siber ağda varlık ara..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-[#00f260]/50 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setFiltreMenusuAcik(!filtreMenusuAcik)}
            className={`flex items-center gap-2 px-6 py-4 rounded-2xl border transition-all font-bold text-sm ${filtreMenusuAcik ? 'bg-[#00f260] text-black border-transparent' : 'bg-white/5 border-white/10 text-gray-400'}`}
          >
            <SlidersHorizontal size={18} /> Filtreler
          </button>
        </div>
      </header>

      {/* Ana İçerik */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filtrelenmisIlanlar.map((ilan, index) => (
            <div key={ilan._id} className="group relative bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-[#00f260]/30 transition-all duration-500">
              
              {/* CLS İyileştirmesi: aspect-square ve bg-black/20 eklendi */}
              <div className="relative aspect-square overflow-hidden bg-[#111] rounded-t-[2.5rem]">
                <Image 
                  src={getImageUrl(ilan)} 
                  alt={ilan.baslik}
                  fill
                  priority={index < 4} // İlk 4 resim hemen yüklenir (LCP skoru uçar)
                  loading={index < 4 ? "eager" : "lazy"}
                  className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-1">
                   <Zap size={12} className="text-[#00f260]" />
                   <span className="text-[10px] font-bold uppercase">{ilan.kategori || "Varlık"}</span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-bold line-clamp-1 group-hover:text-[#00f260] transition-colors">{ilan.baslik}</h3>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-2xl font-black tracking-tighter">{Number(ilan.fiyat || 0).toLocaleString()} ₺</span>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Star size={14} className="fill-[#00f260] text-[#00f260]" />
                    <span className="text-xs font-bold text-white">Güvenli</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
