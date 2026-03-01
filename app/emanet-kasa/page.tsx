"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AramaSonuclari() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || ""; 

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/listings')
      .then(res => res.json())
      .then(data => {
        let ilanListesi = Array.isArray(data) ? data : (data?.data || data?.ilanlar || []);
        const filtered = ilanListesi.filter(item => {
          const searchStr = `${item.title || ''} ${item.description || ''} ${item.category || ''}`.toLowerCase();
          return searchStr.includes(query.toLowerCase());
        });
        setResults(filtered.reverse());
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [query]);

  // 🚨 SİBER MAYMUNCUK
  const getResim = (item) => {
    if (!item) return "https://placehold.co/400x300/030712/00f260?text=GORSEL+YOK";
    const gorsel = item.image || item.imageSrc || item.imageUrl || item.resimUrl || item.fotograf || item.resim || (Array.isArray(item.images) && item.images[0]) || (Array.isArray(item.imageUrls) && item.imageUrls[0]);
    return gorsel ? gorsel : "https://placehold.co/400x300/030712/00f260?text=GORSEL+YOK";
  };

  return (
    <div className="min-h-screen bg-[#030712] py-32 px-4 md:px-8 max-w-6xl mx-auto">
      <div className="mb-12 border-b border-white/5 pb-8 text-center md:text-left">
        <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase text-white">
          ARAMA <span className="text-[#00f260]">SONUÇLARI.</span>
        </h1>
        <p className="text-slate-400 text-xs tracking-widest uppercase mt-4">
          Aranan Kelime: <span className="text-[#00f260] font-bold">"{query}"</span>
        </p>
      </div>

      {loading ? (
        <div className="text-center text-[#00f260] animate-pulse font-black uppercase tracking-widest">Siber Ağ Taranıyor... 📡</div>
      ) : results.length === 0 ? (
        <div className="text-center py-20 bg-[#0b0f19] border border-white/5 rounded-[3rem]">
          <span className="text-6xl opacity-50 mb-4 block">🔍</span>
          <p className="text-slate-400 font-bold uppercase tracking-widest">Bu koda ait varlık bulunamadı.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {results.map((item, idx) => (
            <Link key={idx} href={`/ilan/${item._id || item.id}`} className="bg-[#0b0f19] border border-white/10 rounded-3xl p-4 hover:border-[#00f260]/50 transition-all group flex flex-col h-full shadow-lg">
              <div className="relative mb-4 overflow-hidden rounded-2xl h-40 md:h-48 bg-[#030712]">
                <img 
                  src={getResim(item)} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                  alt={item.title}
                  onError={(e) => { e.target.src = "https://placehold.co/400x300/030712/00f260?text=GORSEL+HATA"; }}
                />
              </div>
              <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">{item.category || "Genel"}</div>
              <h3 className="text-white font-black uppercase tracking-wide truncate">{item.title}</h3>
              
              <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5">
                 <div className="text-[#00f260] font-black text-lg md:text-xl">{item.price?.toLocaleString("tr-TR")} ₺</div>
                 <div className="bg-white/5 text-white p-2 rounded-lg transition-colors group-hover:bg-[#00f260] group-hover:text-black">➔</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
