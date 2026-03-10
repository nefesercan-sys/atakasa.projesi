"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Zap } from "lucide-react"; // 🚀 İkonlar

export default function KategoriSayfasi() {
  const { slug } = useParams();
  const [ilanlar, setIlanlar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const varlikGetir = async () => {
      try {
        const res = await fetch("/api/varliklar"); // Senin API rotan
        const data = await res.json();
        const liste = Array.isArray(data) ? data : data.data || [];

        // Kategori slug filtrelemesi
        const filtrelenmis = liste.filter((i: any) => 
          i.kategori && i.kategori.toLowerCase().replace(/\s+/g, '-') === slug
        );

        setIlanlar(filtrelenmis);
      } catch (err) {
        console.error("Sinyal koptu:", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (slug) varlikGetir();
  }, [slug]);

  const kategoriBaslik = typeof slug === 'string' ? slug.replace(/-/g, ' ').toUpperCase() : "";

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 pb-28 pt-24 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* BAŞLIK */}
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-8 text-white">
          Sektör: <span className="text-[#00f260] italic">{kategoriBaslik}</span>
        </h1>

        {/* 🚀 LÜKS HIZLI İLAN VER BAR'I */}
        <div className="w-full bg-[#0a0a0a] border border-[#00f260]/20 rounded-[2rem] p-6 md:p-8 mb-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_30px_rgba(0,242,96,0.05)]">
          <div className="text-center md:text-left">
            <h3 className="text-white font-black uppercase tracking-widest text-lg md:text-xl mb-2">
              Bu Sektörde Varlığın Var Mı?
            </h3>
            <p className="text-zinc-400 text-xs uppercase font-bold tracking-widest leading-relaxed">
              Hemen sisteme yükle ve siber takas borsasında yerini al.
            </p>
          </div>
          
          <Link 
            href="/ilan-ver" 
            className="flex items-center justify-center gap-3 bg-[#00f260] text-black font-black uppercase tracking-[0.2em] text-xs px-8 py-5 rounded-2xl hover:scale-105 transition-all duration-300 w-full md:w-auto shadow-[0_0_20px_rgba(0,242,96,0.3)] shrink-0"
          >
            <Zap size={18} />
            HIZLI İLAN VER
          </Link>
        </div>

        {/* İLANLAR */}
        {loading ? (
          <div className="animate-pulse text-[#00f260] font-black tracking-widest text-sm">SİNYAL ARANIYOR...</div>
        ) : (
          <div>
            {ilanlar.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {ilanlar.map((ilan: any) => (
                  <Link key={ilan._id} href={`/varlik/${ilan._id}`} className="group bg-[#0a0a0a] border border-white/5 hover:border-[#00f260]/50 rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-2">
                    <div className="relative h-48 w-full bg-black">
                       <img src={ilan.resimler?.[0] || "https://placehold.co/400x300/0a0a0a/00f260?text=AT-TAKASA"} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all" />
                       <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent"></div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-white text-sm mb-3">{ilan.baslik}</h3>
                      <p className="text-[#00f260] font-black text-xl italic">{Number(ilan.fiyat).toLocaleString()} ₺</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-12 text-center">
                <p className="opacity-30 uppercase font-black tracking-widest text-sm">Bu sektörde henüz varlık yok.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
